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

export default function () {
  const userUuid = "test-user-uuid"; 

  // Step 1: Fetch User Progress
  const userProgressResponse = http.get(`http://localhost:7800/api/progress/${userUuid}`);
  check(userProgressResponse, {
    "user progress status is 200": (r) => r.status === 200,
    "user progress load time < 500ms": (r) => r.timings.duration < 500,
  });

  // Step 2: Fetch Total Progress
  const totalProgressResponse = http.get("http://localhost:7800/api/assignment");
  check(totalProgressResponse, {
    "total progress status is 200": (r) => r.status === 200,
    "total progress load time < 500ms": (r) => r.timings.duration < 500,
  });

  // Step 3: Fetch Assignment Details
  const assignmentResponse = http.get(`http://localhost:7800/api/assignment/${userUuid}`);
  check(assignmentResponse, {
    "assignment status is 200": (r) => r.status === 200,
    "assignment load time < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1);
}
