# Performance test results

Brief description of the used server: HTTP/1.1

Brief description of your computer:
- **Operating System:** Ubuntu 24.04
- **CPU:** Intel(R) Core(TM) i7-10510U CPU @ 1.80GHz
- **RAM:** 16 GB

## No Redis Cache

### Retrieving todos

http_reqs: 16100
http_req_duration - median: 18.3 ms
http_req_duration - 99th percentile: 77.23 ms

## Redis Cache

### Retrieving todos

http_reqs: 17964
http_req_duration - median: 11.15 ms
http_req_duration - 99th percentile: 42.36 ms

## Reflection

The performance test results indicate a clear improvement in response times when using Redis cache compared to when no caching was used. Without Redis, the median request duration was 18.3 ms, with the 99th percentile reaching up to 77.23 ms. When Redis caching was enabled, the median request time dropped to 11.15 ms, with the 99th percentile at 42.36 ms, showing consistent and faster responses.

The improvement is expected because Redis allows quick access to previously requested data, reducing the need to query the database for every request. This lowers the load on the server and results in faster response times.
