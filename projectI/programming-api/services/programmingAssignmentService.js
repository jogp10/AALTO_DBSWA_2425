import { sql } from "../database/database.js";

const findAll = async () => {
  // Find all programming assignments
  return await sql`SELECT * FROM programming_assignments;`;
};

const getNextAssignment = async (user_uuid) => {
  // Find the next incomplete assignment
  return await sql`
WITH latest_submissions AS (
    SELECT 
        programming_assignment_id,
        MAX(id) AS latest_id
    FROM 
        programming_assignment_submissions
    WHERE 
        user_uuid = ${user_uuid}
    GROUP BY 
        programming_assignment_id
),
filtered_submissions AS (
    SELECT 
        pas.programming_assignment_id,
        pas.status,
        pas.correct
    FROM 
        programming_assignment_submissions pas
    JOIN 
        latest_submissions ls 
        ON pas.id = ls.latest_id
    WHERE 
        pas.user_uuid = ${user_uuid}
)
SELECT 
    pa.id, pa.title, pa.handout
FROM 
    programming_assignments pa
LEFT JOIN 
    filtered_submissions fs 
    ON pa.id = fs.programming_assignment_id
WHERE 
    (
        fs.programming_assignment_id IS NULL 
        OR (fs.status = 'pending') 
        OR (fs.status = 'processed' AND fs.correct = false)
    )
ORDER BY 
    pa.id
LIMIT 1;
    `;
};

const getNextAssignmentTestCode = async (user_uuid) => {
  // Find the next incomplete assignment
  return await sql`
      SELECT pa.id, pa.test_code
      FROM programming_assignments pa
      LEFT JOIN programming_assignment_submissions pas
      ON pa.id = pas.programming_assignment_id AND pas.user_uuid = ${user_uuid}
      WHERE pas.status = 'pending' OR pas.id IS NULL
      ORDER BY pa.assignment_order
      LIMIT 1
    `;
};

const getSubmission = async (user_uuid, programming_assignment_id, code) => {
  // Get the submission
  return await sql`
        SELECT * FROM programming_assignment_submissions
        WHERE user_uuid = ${user_uuid} AND programming_assignment_id = ${programming_assignment_id} AND code = ${code}
        `;
};

const checkOngoingSubmission = async (user_uuid) => {
  // Check if user has ongoing submission
  return await sql`
        SELECT * FROM programming_assignment_submissions
        WHERE user_uuid = ${user_uuid} AND status = 'pending'
        `;
};

const submitAssignment = async (user_uuid, programming_assignment_id, code) => {
  // Insert the submission
  await sql`
        INSERT INTO programming_assignment_submissions (user_uuid, programming_assignment_id, code)
        VALUES (${user_uuid}, ${programming_assignment_id}, ${code})
        `;
};

const getUserProgress = async (user_uuid) => {
  // Count the number of completed assignments
  return await sql`
            SELECT COUNT(DISTINCT programming_assignment_id) AS completed
              FROM programming_assignment_submissions
              WHERE user_uuid = ${user_uuid} AND status = 'processed' AND correct = true;
            `;
};

export {
  findAll,
  getNextAssignment,
  getNextAssignmentTestCode,
  getSubmission,
  checkOngoingSubmission,
  submitAssignment,
  getUserProgress,
};
