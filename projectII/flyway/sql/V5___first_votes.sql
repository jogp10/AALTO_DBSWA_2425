INSERT INTO votes (user_uuid, question_id) VALUES
    (gen_random_uuid(), 1),
    (gen_random_uuid(), 1),
    (gen_random_uuid(), 2);

INSERT INTO votes (user_uuid, answer_id) VALUES
    (gen_random_uuid(), 1),
    (gen_random_uuid(), 1),
    (gen_random_uuid(), 2);
