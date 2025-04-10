import { serve, createClient } from "./deps.js";
import { grade } from "./services/gradingService.js";
import { updateSubmissionGrade } from "./services/databaseService.js";

const streamClient = createClient({
  url: "redis://redis:6379",
  pingInterval: 1000,
});

await streamClient.connect();

const STREAM_NAME = "grading_queue";
const CONSUMER_GROUP = "grading_workers";
const CONSUMER_NAME = "worker_1";

let state = -1;

async function createConsumerGroup() {
  try {
    await streamClient.xGroupCreate(STREAM_NAME, CONSUMER_GROUP, '0', { MKSTREAM: true });
    console.log(`Consumer group '${CONSUMER_GROUP}' created on stream '${STREAM_NAME}'`);
  } catch (err) {
    if (err.message.includes("BUSYGROUP")) {
      console.log("Consumer group already exists");
    } else {
      console.error("Error creating group:", err); 
      throw err; // Rethrow the error if it's not related to an existing group
    }
  } 
}

await createConsumerGroup();

const getCode = () => {
  state = (state + 1) % 5;

  if (state == 0) {
    return `
def hello():
  return "Hello world!"
`;
  } else if (state == 1) {
    return `
def hello():
  return "hello world!"
    `;
  } else if (state == 2) {
    return `
def ohnoes():
  return "Hello world!"
    `;
  } else if (state == 3) {
    return `
:D
      `;
  } else {
    return `
while True:
  print("Hmmhmm...")
    `;
  }
};

const gradingDemo = async () => {
  let code = getCode();

  const testCode = `
import socket
def guard(*args, **kwargs):
  raise Exception("Internet is bad for you :|")
socket.socket = guard

import unittest
from code import *

class TestHello(unittest.TestCase):

  def test_hello(self):
    self.assertEqual(hello(), "Hello world!", "Function should return 'Hello world!'")

if __name__ == '__main__':
  unittest.main()  
`;

  return await grade(code, testCode);
};

// const handleRequest = async (request) => {
//   // the starting point for the grading api grades code following the
//   // gradingDemo function, but does not e.g. use code from the user
//   let result;
//   try {
//     const requestData = await request.json();

//     const code = requestData.code;
//     const testCode = requestData.testCode;

//     result = await grade(code, testCode);
//   } catch (e) {
//     result = await gradingDemo();
//   }

//   // in practice, you would either send the code to grade to the grader-api
//   // or use e.g. a message queue that the grader api would read and process

//   return new Response(JSON.stringify({ result: result }));
// };

// const portConfig = { port: 7000, hostname: "0.0.0.0" };
// serve(handleRequest, portConfig);

while (true) {
  try {
    const response = await streamClient.xReadGroup(
      CONSUMER_GROUP,
      CONSUMER_NAME,
      [{ key: STREAM_NAME, id: '>' }],
      { COUNT: 1, BLOCK: 500 }
    );

    if (response && response.length) {
      const message = response[0].messages[0];


      const messageId = message.id;
      const fields = message.message.message;

      // Process each submission
      await processSubmission(messageId, fields, streamClient);
      await streamClient.xAck(STREAM_NAME, CONSUMER_GROUP, messageId);
    }
  } catch (err) {
    if (err.message.includes("NOGROUP")) {
      console.warn("Consumer group or stream missing, attempting to recreate...");
      await createConsumerGroup();
    } else {
      console.error("Error polling stream inside pollStream:", err);
      throw err;
    }
  }
}

async function processSubmission(messageId, data, streamClient) {
  const { testCode, code, metadata }  = JSON.parse(data);

  const graderResponse = await grade(code, testCode);

  const correct = graderResponse.split("\n")[0] === "." || graderResponse.split("\n")[0] === "..";

  await updateSubmissionGrade(
    metadata.user_uuid,
    metadata.programming_assignment_id,
    correct,
    graderResponse
  );

  // Send feedback to programmingAPI
  const feedback = { 
    submissionId: metadata.submissionId,
    user_uuid: metadata.user_uuid,
    assignment_id: metadata.programming_assignment_id,
    correct: correct,
    feedback: graderResponse,
  };

  await streamClient.publish("feedback-channel", JSON.stringify(feedback))
}
