# Performance test results

Brief description of the used server (choose one): HTTP/1.1

Brief description of your computer:
- **Operating System:** Ubuntu 24.04
- **CPU:** Intel(R) Core(TM) i7-10510U CPU @ 1.80GHz
- **RAM:** 16 GB

## No Redis Cache

### Retrieving todos

http_reqs: 16100
http_req_duration - median: 4.88 ms
http_req_duration - 99th percentile: 14.66 ms

## Redis Cache

### Retrieving todos

http_reqs: 17964
http_req_duration - median: 4.76 ms
http_req_duration - 99th percentile: 11.02 ms

## Reflection

Brief reflection on the results of the tests -- why do you think you saw the results you saw: TODO