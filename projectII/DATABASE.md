# Database Schema

## Tables

### Courses

| Column      | Type         | Description                  |
|-------------|--------------|------------------------------|
| id          | SERIAL       | Primary key                  |
| name        | VARCHAR(255) | Course name (unique)         |
| description | TEXT         | Optional course description  |
| created_at  | TIMESTAMP    | Timestamp of course creation |

### Questions

| Column      | Type         | Description                  |
|-------------|--------------|------------------------------|
| id          | SERIAL       | Primary key                  |
| course_id   | INT          | Foreign key to Courses table |
| user_uuid   | TEXT         | User who posted the question |
| title       | VARCHAR(255) | Question title               |
| content     | TEXT         | Question content             |
| votes       | INT          | Number of votes              |
| created_at  | TIMESTAMP    | Timestamp of question creation|
| updated_at  | TIMESTAMP    | Timestamp of last update     |

### Answers

| Column      | Type         | Description                  |
|-------------|--------------|------------------------------|
| id          | SERIAL       | Primary key                  |
| question_id | INT          | Foreign key to Questions table|
| user_uuid   | TEXT         | User who provided the answer |
| content     | TEXT         | Answer content               |
| votes       | INT          | Number of votes              |
| created_at  | TIMESTAMP    | Timestamp of answer creation |
| updated_at  | TIMESTAMP    | Timestamp of last update     |
| is_generated| BOOLEAN      | Whether the answer is AI-generated|

## Indexes

### Courses

- `name` (Unique index): Ensures that each course name is unique and allows for fast lookups by name.

### Questions

- `course_id` (Index): Allows for fast lookups of questions by course.
- `user_uuid` (Index): Allows for fast lookups of questions by user.
- `votes` (Index): Allows for fast sorting of questions by votes.

### Answers

- `question_id` (Index): Allows for fast lookups of answers by question.
- `user_uuid` (Index): Allows for fast lookups of answers by user.
- `votes` (Index): Allows for fast sorting of answers by votes.

## Denormalization Decisions

### Votes

- The `votes` column in the `Questions` and `Answers` tables is an example of denormalization. Instead of calculating the number of votes on the fly by joining with a `Votes` table, we store the count directly in the `Questions` and `Answers` tables. This improves read performance at the cost of additional complexity when updating votes.

### User Information in Questions and Answers

- Storing the `user_uuid` in the `Questions` and `Answers` tables allows us to quickly retrieve the user who posted the question or answer without needing to join with the `Users` table. This improves read performance for common queries.

## Justification for Indexes

- Indexes on `name` in the `Courses` table ensure that lookups by course name are fast, which is important for course management functionality.
- Indexes on `course_id` in the `Questions` table and `question_id` in the `Answers` table ensure that lookups by these foreign keys are fast, which is important for displaying questions and answers related to a specific course or question.
- Indexes on `votes` in the `Questions` and `Answers` tables allow for fast sorting by votes, which is important for displaying the most popular questions and answers.

By carefully choosing indexes and denormalizing certain data, we can optimize the performance of our application for the most common queries and operations.

## Caching Decisions

### Method Call Caching

- The `qaService` object is created by wrapping the `apiService` with a `cacheMethodCalls` function. This function caches the results of specific method calls to reduce the number of API requests and improve performance.
- Flushing cache methods include: `upVote`, `addQuestion`, `addAnswer`, `deleteVote`, `saveGeneratedAnswers`, `getLastAnswer` and `getLastQuestion`.
- By flushing the cache for these methods, we ensure that the cache remains consistent with the database and that users see the most up-to-date information.
