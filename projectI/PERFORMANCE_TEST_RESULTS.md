### Test Execution Details

#### Environment Details

- **Operating System**: Ubuntu 24.04
- **Environment**: Local

## Scenario 1: Test the performance of the loading the assignment page

The performance test measured key metrics related to loading the assignment page and fetching progress data, covering the following API requests:

1. User Progress Status (via /api/progress/{userUuid})
2. Total Progress Status (via /api/assignment)
3. Assignment Details (via /api/assignment/{userUuid})

Each API request was tested for both response status and response time, aiming for a status of 200 and a load time of less than 500ms.

## Performance Summary

Key Metrics

- Checks:
  - All checks passed (100%), with 26,988 successful checks out of 26,988.
- Data Transfer:
  - Data Received: 9.5 MB (79 kB/s)
  - Data Sent: 1.4 MB (12 kB/s)
- HTTP Request Performance:

  - Request Duration:
    - Average: 2.85 ms
    - Median: 2.4 ms
    - Max: 117.45 ms
    - 90th percentile: 4.06 ms
    - 95th percentile: 5.28 ms

  - Request Breakdown:
    - Receiving Time: Avg 49.6 µs, 95th percentile 84.86 µs
    - Sending Time: Avg 13.03 µs, 95th percentile 25.81 µs
    - Waiting Time: Avg 2.79 ms, 95th percentile 5.19 ms
    - Blocked Time: Avg 5.47 µs

- Error Rate:
  - HTTP Request Failures: 0% (0 out of 13,494 requests)

- Virtual Users:
  - Min VUs: 1
  - Max VUs: 50

### Summary and Analysis

- **Response Times**: The average response time across requests was well below the 500ms threshold, with the 95th percentile response time at 5.28ms, indicating consistent low latency even under load.
- **Error Rate**: There were no failed requests, showing that the service remained stable throughout the test.
- **Performance under Load**: The system handled up to 50 VUs without significant slowdowns or bottlenecks. The minimal variation in response times (avg=2.85ms, 90th percentile=4.06ms) reflects good performance scaling.

### Conclusions

- **Page Load Performance**: The assignment page and related progress endpoints performed well under simulated load, with all response times within acceptable limits.
- **Scalability**: Based on these results, the API endpoints demonstrate scalability for concurrent user access without performance degradation.

## Scenario 2: Test the performance of the submit an assignment

This performance test focused on submitting assignments and tracking the submission status. The API endpoint for assignment submission was tested to ensure that the response status is 200 and that the response time stays below 500ms.
The assignment page makes 3 API calls to get the assignment details, user progress, and total available progress.

## Performance Summary

Key Metrics

- Checks:
  - Pass Rate: 94.18% (1,959 successful checks out of 2,080 total checks)
  - Failures: 121 instances where the submission response time exceeded 500ms.
- Data Transfer:
  - Data Received: 304 kB (8.4 kB/s)
  - Data Sent: 280 kB (7.8 kB/s)
- HTTP Request Performance:
  - Request Duration:
    - Average: 229.69 ms
    - Median: 159.32 ms
    - Max: 1.22 s
    - 90th percentile: 534.14 ms
    - 95th percentile: 644.13 ms

  - Request Breakdown:
    - Receiving Time: Avg 149.32 µs, 95th percentile 374.99 µs
    - Sending Time: Avg 63.17 µs, 95th percentile 117.27 µs
    - Waiting Time: Avg 229.48 ms, 95th percentile 644.04 ms
    - Blocked Time: Avg 31.68 µs, 95th percentile 63.88 µs

- Error Rate:
  - HTTP Request Failures: 0% (0 out of 1,040 requests)

- Virtual Users:
  - Min VUs: 1
  - Max VUs: 50

### Summary and Analysis

- **Response Times**: The average response time for the submission API was 229.69 ms, with the 90th percentile reaching 534.14 ms. Although most requests were processed well below the 500ms target, there was a notable portion of requests (121 instances) that exceeded this threshold.
- **Submission Performance**: Despite a few failures to meet the 500ms target, the submission process remains generally fast, with the majority of responses being processed within a reasonable time.
- **Error Rate**: No requests failed during the test, indicating a stable system.


### Conclusions

- **Submission Performance**: The assignment submission process works well for most requests but needs improvement in handling occasional delays to meet the 500ms performance target.
- **Scalability**: The API performed well under 50 VUs, indicating that it can handle a moderate load, but further tests with higher VUs could be useful to assess scalability under more intense usage.
