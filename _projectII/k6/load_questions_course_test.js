import http from 'k6/http';
import { check } from 'k6';
import { generateUuid } from './util/randomuuidUtil.js';


export let options = {
  vus: 10, // Simulate 10 users
  duration: '30s', // Test duration
};

export default function () {
  let user_uuid = generateUuid();
  let courseId = 1; // Example course ID

  let res = http.get('http://localhost:7800/api/courses/'+courseId+'/questions?user_uuid=' + user_uuid);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response contains questions': (r) => JSON.parse(r.body).length > 0,
  });
}
