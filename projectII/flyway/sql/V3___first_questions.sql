INSERT INTO questions (course_id, user_uuid, title, content) VALUES
    (1, gen_random_uuid(), 'Var in programming', 'What is a variable in programming?'),
    (1, gen_random_uuid(), 'Loops', 'How do you write a for loop in Python?'),
    (1, gen_random_uuid(), 'Functions', 'What is a function in programming?'),
    (1, gen_random_uuid(), 'Data types', 'What are the different data types in Python?'),
    (1, gen_random_uuid(), 'Operators', 'What are the different operators in Python?');
DO $$
DECLARE
    i INT := 0;
BEGIN
    WHILE i < 50 LOOP
        INSERT INTO questions (course_id, user_uuid, title, content) VALUES
            (1, gen_random_uuid(), 'Question ' || i, 'Content ' || i);
        i := i + 1;
    END LOOP;
END $$;