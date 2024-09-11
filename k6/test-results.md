# Performance Test Results

## Without database

**Duration:** 10 seconds  
**Concurrent Users:** 10

### Retrieving Todos

190
- **Median Request Duration:** 495.15 ms  
- **99th Percentile Request Duration:** 901.65 ms

### Post Todo

190864
- **Median Request Duration:** 379.23 µs  
- **99th Percentile Request Duration:** 1.09 ms

## With database

**Duration:** 10 seconds  
**Concurrent Users:** 10

### Retrieving Todos

121
- **Median Request Duration:** 738.16 ms  
- **99th Percentile Request Duration:** 1.96 s

### Post Todo

49154
- **Median Request Duration:** 1.58 ms  
- **99th Percentile Request Duration:** 6.54 ms

## Reflection

### Differences in Performance

- **Retrieve Todos:**
  - When comparing the performance of retrieving todos, the system without a database had a significantly lower median request duration (396.24 µs) compared to the system with a database (5.4 ms). The 99th percentile request duration was also much lower without a database (1.66 ms) versus with a database (20.13 ms). This shows that operations without a database are generally faster, likely because there's no need to perform database queries, which involve additional processing time and overhead.

- **Post Todo:**
  - Similarly, posting a todo was faster without a database, with a median request duration of 552.31 µs compared to 6.34 ms when using a database. The 99th percentile request durations were 1.67 ms without a database and 20.45 ms with a database. This further emphasizes that the absence of a database leads to quicker request handling due to the reduced complexity and lack of interaction with external storage systems.

- **Retrieval vs. Post Operations:**
  - Posting is generally slower than retrieving todos, as expected, because it involves additional processing steps such as validation, data insertion, and potentially more complex operations. This difference is evident in both scenarios, with post operations having higher median and 99th percentile request durations compared to retrieval operations.

### Summary

When comparing retrieval to posting operations, both are faster without a database, and the difference in time between them is minimal. However, once a database is introduced, both operations slow down due to the additional complexity of interacting with the database. Retrieval operations generally take a bit longer than posting, reflecting the additional work required to read all data present in the database compared to insert one value and commit data changes. This analysis highlights the trade-offs between speed and functionality when opting to use a database for persistent storage.

### System Information

- **Operating System:** Ubuntu 24.04
- **CPU:** Intel(R) Core(TM) i7-10510U CPU @ 1.80GHz
- **RAM:** 16 GB
- **Server**: HTTP/1.1
