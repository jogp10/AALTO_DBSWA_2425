import { sql } from "../database/database.js";

const getCourses = async () => {
    const query = sql`SELECT * FROM courses`;
    const result = await query;
    return result;
};

const getCourse = async (courseId) => {
    const query = sql`SELECT * FROM courses WHERE id = ${courseId}`;
    const result = await query;
    return result[0];
};

const getQuestions = async (courseId, page = 1) => {
    const limit = 20; // Number of questions per page
    const offset = (page - 1) * limit; // Calculate the starting row
    const query = sql`
        SELECT * 
        FROM questions 
        WHERE course_id = ${courseId}
        ORDER BY updated_at DESC
        LIMIT ${limit} OFFSET ${offset}`;
    const result = await query;
    return result;
};

const getQuestion = async (questionId) => {
    const query = sql`SELECT * FROM questions WHERE id = ${questionId}`;
    const result = await query;
    return result[0];
};

const getAnswers = async (questionId, page = 1) => {
    const limit = 20; // Number of answers per page
    const offset = (page - 1) * limit; // Calculate the starting row
    const query = sql`
        SELECT * 
        FROM answers 
        WHERE question_id = ${questionId}
        ORDER BY updated_at DESC
        LIMIT ${limit} OFFSET ${offset}`;
    const result = await query;
    return result;
};

const addQuestion = async (courseId, data) => {
    const query = sql`INSERT INTO questions (course_id, title, content, user_uuid) VALUES (${courseId}, ${data.title}, ${data.content}, ${data.user_uuid}) RETURNING *`;
    const result = await query;
    return result[0];
}

const getLastQuestion = async (data) => {
    const query = sql`SELECT * FROM questions WHERE user_uuid = ${data.user_uuid} ORDER BY created_at DESC LIMIT 1`;
    const result = await query;
    return result[0];
}

const checkAnswer = async (data) => {
    const query = sql`SELECT * FROM answers WHERE user_uuid = ${data.user_uuid} AND question_id = ${data.question_id}`;
    const result = await query;
    return result.length > 0;
}

const getLastAnswer = async (data) => {
    const query = sql`SELECT * FROM answers WHERE user_uuid = ${data.user_uuid} ORDER BY created_at DESC LIMIT 1`;
    const result = await query;
    return result[0];
}

const addAnswer = async (questionId, data) => {
    const query = sql`INSERT INTO answers (question_id, content, user_uuid) VALUES (${questionId}, ${data.content}, ${data.user_uuid}) RETURNING *`;
    const result = await query;
    return result[0];
}

const checkVote = async (data) => {
    switch (data.type) {
        case "question":
            return checkQuestionVote(data);
        case "answer":
            return checkAnswerVote(data);
        default:
            return false;
    }
}

const checkQuestionVote = async (data) => {
    const query = sql`SELECT * FROM votes WHERE user_uuid = ${data.user_uuid} AND question_id = ${data.id}`;
    const result = await query;
    return result.length > 0;
}

const checkAnswerVote = async (data) => {
    const query = sql`SELECT * FROM votes WHERE user_uuid = ${data.user_uuid} AND answer_id = ${data.id}`;
    const result = await query;
    return result.length > 0;
}

const upVote = async (data) => {
    switch (data.type) {
        case "question":
            return upVoteQuestion(data);
        case "answer":
            return upVoteAnswer(data);
        default:
            return null;
    }
}

const upVoteQuestion = async (data) => {
    const query = sql`INSERT INTO votes (user_uuid, question_id) VALUES (${data.user_uuid}, ${data.id}) RETURNING *`;
    const result = await query;
    return result[0];
}

const upVoteAnswer = async (data) => {
    const query = sql`INSERT INTO votes (user_uuid, answer_id) VALUES (${data.user_uuid}, ${data.id}) RETURNING *`;
    const result = await query;
    return result[0];
}

const deleteVote = async (data) => {
    switch (data.type) {
        case "question":
            return deleteQuestionVote(data);
        case "answer":
            return deleteAnswerVote(data);
        default:
            return null;
    }
}

const deleteQuestionVote = async (data) => {
    const query = sql`DELETE FROM votes WHERE user_uuid = ${data.user_uuid} AND question_id = ${data.id}`;
    const result = await query;
    return result;
}

const deleteAnswerVote = async (data) => {
    const query = sql`DELETE FROM votes WHERE user_uuid = ${data.user_uuid} AND answer_id = ${data.id}`;
    const result = await query;
    return result;
}

const saveGeneratedAnswers = async (data) => {
    const queries = data.generatedAnswers.map((answer) => {
        return sql`
        INSERT INTO answers (question_id, content, is_generated) 
        VALUES (${data.questionId}, ${answer}, TRUE)
        RETURNING *;
        `;
    });

    await Promise.all(queries);

    return data.generatedAnswers;
}

export {
    getCourses,
    getCourse,
    getQuestions,
    getQuestion,
    getAnswers,
    addQuestion,
    getLastQuestion,
    checkAnswer,
    getLastAnswer,
    addAnswer,
    checkVote,
    upVote,
    deleteVote,
    saveGeneratedAnswers
}

