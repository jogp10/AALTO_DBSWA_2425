# Performance Test Summary

#### Environment Details

- **Operating System**: Ubuntu 24.04
- **Environment**: Local

## Scenario 1: Load Main Page

- **Description**: This scenario tests the performance of the main page of the application.
- **Scenario**: 10 looping VUs for 30s

### Performance Test Results

| Metric | Value |
| ------ | ----- |
| Total Requests | 7865 |
| Failed Requests | 0 |
| Average Response Time | 37.93ms |
| Min Response Time | 18.39m |
| Max Response Time | 107.81ms |
| p95 Response Time | 55.4ms |

## Scenario 2: Load Courses

- **Description**: This scenario tests the performance of loading courses.
- **Scenario**: Up to 100 looping VUs for 5m0s over 3 stages (gracefulRampDown: 30s, gracefulStop: 30s)

### Performance Test Results

| Metric | Value |
| ------ | ----- |
| Total Requests | 23960 |
| Failed Requests | 0 |
| Average Response Time | 4.33ms |
| Min Response Time | 828.48µs |
| Max Response Time | 140.07ms |
| p95 Response Time | 12.95ms |

## Scenario 3: Load Questions for a Course

- **Description**: This scenario tests the performance of loading questions for a course.
- **Scenario**: 10 looping VUs for 30s (gracefulStop: 30s)

### Performance Test Results

| Metric | Value |
| ------ | ----- |
| Total Requests | 17761 |
| Failed Requests | 0 |
| Average Response Time | 16.1ms |
| Min Response Time | 5.13ms |
| Max Response Time | 269.38ms |
| p95 Response Time | 36.09ms |

## Scenario 4: Stress Test for Submitting a Question

- **Description**: This scenario tests the performance of submitting a question.
- **Scenario**: Up to 200 looping VUs for 30s over 3 stages (gracefulRampDown: 30s, gracefulStop: 30s)

### Performance Test Results

| Metric | Value |
| ------ | ----- |
| Total Requests | 13060 |
| Failed Requests | 0 |
| Average Response Time | 192.28ms |
| Min Response Time | 4.56ms |
| Max Response Time | 455.61ms |
| p95 Response Time | 354.97ms |

## Scenario 5: Concurrent Users Test for Submitting an Answer and Upvoting an Answer

- **Description**: This scenario tests the performance of submitting an answer and upvoting an answer.
- **Scenario**: 
    - Submitting an Answer: 50 looping VUs for 2m0s
    - Upvoting an Answer: 50 looping VUs for 2m0s

### Performance Test Results

| Metric | Value |
| ------ | ----- |
| Total Requests | 11664 |
| Failed Requests | 0 |
| Average Response Time | 32.5ms |
| Min Response Time | 3.68ms |
| Max Response Time | 563.25ms |
| p95 Response Time | 170.19ms |
