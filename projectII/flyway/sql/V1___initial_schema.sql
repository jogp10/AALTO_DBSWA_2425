/* Create your schema here */

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE, -- Course name
    description TEXT, -- Optional course description
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE, -- Course to which the question belongs
    user_uuid TEXT NOT NULL,
    title VARCHAR(255) NOT NULL, -- The question title
    content TEXT NOT NULL, -- The question content
    votes INT DEFAULT 0, -- Number of votes on the question
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When the question was posted
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Updated when upvoted
);

CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
    question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE, -- Question to which the answer belongs
    user_uuid TEXT, -- User who provided the answer
    content TEXT NOT NULL, -- The answer content
    votes INT DEFAULT 0, -- Number of votes on the answer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When the answer was posted
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Updated when upvoted
    is_generated BOOLEAN DEFAULT FALSE -- Whether the answer is AI-generated
);

CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    user_uuid TEXT NOT NULL, -- User who voted
    question_id INT REFERENCES questions(id) ON DELETE CASCADE, -- Question voted on (nullable for answer votes)
    answer_id INT REFERENCES answers(id) ON DELETE CASCADE, -- Answer voted on (nullable for question votes)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for optimized queries
CREATE INDEX idx_questions_course_id ON questions(course_id);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_created_at ON answers(created_at DESC);


-- Trigger to update the votes in answers and questions
CREATE OR REPLACE FUNCTION update_votes_count() 
RETURNS TRIGGER AS $$
BEGIN
    -- Case 1: When a vote is inserted
    IF (TG_OP = 'INSERT') THEN
        -- If it's a vote for a question
        IF NEW.question_id IS NOT NULL THEN
            UPDATE questions
            SET votes = votes + 1
            WHERE id = NEW.question_id;
        END IF;
        
        -- If it's a vote for an answer
        IF NEW.answer_id IS NOT NULL THEN
            UPDATE answers
            SET votes = votes + 1
            WHERE id = NEW.answer_id;
        END IF;
    END IF;

    -- Case 2: When a vote is deleted
    IF (TG_OP = 'DELETE') THEN
        -- If it's a vote for a question
        IF OLD.question_id IS NOT NULL THEN
            UPDATE questions
            SET votes = votes - 1
            WHERE id = OLD.question_id;
        END IF;
        
        -- If it's a vote for an answer
        IF OLD.answer_id IS NOT NULL THEN
            UPDATE answers
            SET votes = votes - 1
            WHERE id = OLD.answer_id;
        END IF;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_timestamp() 
RETURNS TRIGGER AS $$
BEGIN
    -- Update the `updated_at` field to the current timestamp whenever the answer is updated
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_vote_insert
AFTER INSERT ON votes
FOR EACH ROW
EXECUTE FUNCTION update_votes_count();

CREATE TRIGGER after_vote_delete
AFTER DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_votes_count();

CREATE TRIGGER after_answer_update
BEFORE UPDATE ON answers
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER after_question_update
BEFORE UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
