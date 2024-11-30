import http from 'k6/http';
import { check, sleep } from 'k6';
import { generateUuid } from './util/randomuuidUtil.js';

export let options = {
  stages: [
    { duration: '1m', target: 100 }, // Ramp-up to 100 users
    { duration: '3m', target: 100 }, // Sustain 100 users
    { duration: '1m', target: 0 },   // Ramp-down
  ],
};

export default function () {
  let res = http.get('http://localhost:7800/api/courses');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
