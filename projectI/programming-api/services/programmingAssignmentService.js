import { sql } from "../database/database.js";

const findAll = async () => {
  // Find all programming assignments
  return await sql`SELECT * FROM programming_assignments;`;
};

const getNextAssignment = async (user_uuid) => {
  // Find the next incomplete assignment
  return await sql`
      SELECT pa.id, pa.title, pa.handout 
      FROM programming_assignments pa
      LEFT JOIN programming_assignment_submissions pas
      ON pa.id = pas.programming_assignment_id AND pas.user_uuid = ${user_uuid}
      WHERE pas.id IS NULL
      ORDER BY pa.assignment_order
      LIMIT 1
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
            SELECT COUNT(*) AS completed
            FROM programming_assignment_submissions
            WHERE user_uuid = ${user_uuid}
            `;
};

export { findAll, getNextAssignment, submitAssignment, getUserProgress };
