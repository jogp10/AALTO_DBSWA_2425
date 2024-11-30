import http from 'k6/http';
import { check } from 'k6';
import { generateUuid } from './util/randomuuidUtil.js';

export let options = {
  stages: [
    { duration: '10s', target: 50 }, // Ramp-up
    { duration: '10s', target: 200 }, // Stress level
    { duration: '10s', target: 0 },   // Ramp-down
  ],
};

export default function () {
  let user_uuid = generateUuid();
  let courseId = 1; // Example course ID

  let payload = JSON.stringify({
    user_uuid: user_uuid,
    title: `Test Question ${__VU}-${__ITER}`,
    content: 'This is a test question.',
  });

  let params = { headers: { 'Content-Type': 'application/json' } };
  let res = http.post('http://localhost:7800/api/courses/'+courseId+'/questions', payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 1s': (r) => r.timings.duration < 1000,
  });
}
