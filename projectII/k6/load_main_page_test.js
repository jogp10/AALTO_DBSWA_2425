import http from 'k6/http';
import { check } from 'k6';
import { generateUuid } from './util/randomuuidUtil.js';


export let options = {
  vus: 10, // Simulate 10 users
  duration: '30s', // Test duration
};

export default function () {
  let user_uuid = generateUuid();
  let res = http.get('http://localhost:7800/');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
}
