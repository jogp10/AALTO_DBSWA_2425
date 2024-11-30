import http from 'k6/http';
import { check, sleep } from 'k6';
import { generateUuid } from './util/randomuuidUtil.js';

export let options = {
  scenarios: {
    post_answers: {
      executor: 'constant-vus',
      vus: 50,
      duration: '2m',
      exec: 'postAnswer',
    },
    upvote_answers: {
      executor: 'constant-vus',
      vus: 50,
      duration: '2m',
      exec: 'upvoteAnswer',
    },
  },
};

export function postAnswer() {
  let user_uuid = generateUuid();
  let questionId = 1; // Example question ID

  let payload = JSON.stringify({ user_uuid: user_uuid, question_id: questionId, content: 'This is a test answer.' });
  let params = { headers: { 'Content-Type': 'application/json' } };
  let res = http.post("http://localhost:7800/api/questions/"+questionId+"/answers", payload, params);

  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}

export function upvoteAnswer() {
  let user_uuid = generateUuid();
  let answerId = 1; // Example answer ID

  let payload = JSON.stringify({ user_uuid: user_uuid, type: "answer", id: answerId });
  let params = { headers: { 'Content-Type': 'application/json' } };
  let res = http.post(`http://localhost:7800/api/upvote`, payload, params);

  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
