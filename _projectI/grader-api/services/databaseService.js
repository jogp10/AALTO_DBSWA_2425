import { sql } from "../database/database.js";

const updateSubmissionGrade = async (
  user_uuid,
  assignment_id,
  correct,
  grader_feedback
) => {
  // Update the status of the submission
  await sql`
        UPDATE programming_assignment_submissions
        SET status = 'processed', grader_feedback = ${grader_feedback}, correct = ${correct}
        WHERE user_uuid = ${user_uuid} AND programming_assignment_id = ${assignment_id} AND status = 'pending'
        `;
};

export {
  updateSubmissionGrade,
};
