import http from "k6/http";
import { sleep } from "k6";
import { check } from "k6";

export let options = {
  stages: [
    { duration: "10s", target: 50 }, // Ramp up to 50 users
    { duration: "15s", target: 50 },  // Sustained load
    { duration: "10s", target: 0 },  // Ramp down
  ],
};


function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function () {
  const userUuid = generateUuid();
  const programmingAssignmentId = 1;
  const code = 'def hello(): return "Hello"';

  const payload = JSON.stringify({
    user_uuid: userUuid,
    programming_assignment_id: programmingAssignmentId,
    code: code,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  let response = http.post("http://localhost:7800/api/assignment", payload, params);

  check(response, {
    "status is 200": (r) => r.status === 200,
    "submission response time < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1); // Wait before the next iteration
}
