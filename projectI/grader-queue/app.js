import { createClient } from "./deps.js";
import { updateSubmissionGrade } from "./services/databaseService.js";

// Redis Client for Streams
const streamClient = createClient({
  url: "redis://redis:6379",
  pingInterval: 1000,
});


const STREAM_NAME = "grading_queue"; // Redis Stream name
const CONSUMER_GROUP = "grading_workers";
const CONSUMER_NAME = "worker_1";

await streamClient.connect();

// Create the stream and the consumer group if they don't exist
async function initializeConsumerGroup() {
  try {
    // Attempt to create the consumer group and stream if they don't exist
    await streamClient.xGroupCreate(STREAM_NAME, CONSUMER_GROUP, "$", {
      MKSTREAM: true, // This ensures that the stream will be created if it doesn't exist
    });
    console.log(
      `Consumer group '${CONSUMER_GROUP}' created on stream '${STREAM_NAME}'`
    );
  } catch (err) {
    // If the group already exists, ignore the error; otherwise, log it
    if (err.message.includes("BUSYGROUP")) {
      console.log(
        `Consumer group '${CONSUMER_GROUP}' already exists on stream '${STREAM_NAME}'`
      );
    } else {
      console.error("Error creating consumer group:", err);
    }
  }
}

// Function to process each submission
async function processSubmission(messageId, data) {
  console.log("Processing message:", messageId);
  const { metadata, code } = data;

  // Send code to Grader API
  const graderResponse = await fetch("http://grader-api:7000/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ testCode: data.testCode, code }),
  });
  const graderResult = await graderResponse.json();
  console.log("Grader result:", graderResult);

  // Update the submission grade (implement this function to update in DB)
  console.log("Updating submission grade in database");
  console.log(metadata);
  await updateSubmissionGrade(metadata.user_uuid, metadata.programming_assignment_id, graderResult.correct, graderResult.feedback);

  // Send feedback to UI
  const feedback = {
    submissionId: metadata.submissionId,
    user_uuid: metadata.user_uuid,
    assignment_id: metadata.programming_assignment_id,
    feedback: graderResult.result,
  };
  await streamClient.publish("feedback-channel", JSON.stringify(feedback));

  // Acknowledge message in the stream
  await streamClient.xAck(STREAM_NAME, CONSUMER_GROUP, messageId);
}

// Poll the Redis Stream for new messages
async function pollStream() {
  while (true) {
    const response = await streamClient.xReadGroup(
      CONSUMER_GROUP,
      CONSUMER_NAME,
      [{ key: STREAM_NAME, id: ">" }],
      { COUNT: 1, BLOCK: 5000 }
    );

    if (response) {
      const message = response[0].messages[0];

      const messageId = message.id;
      const fields = message.message;
      console.log("Message ID");
      console.log(messageId);
      console.log("Message Fields");
      console.log(fields.message);
      const parsedData = JSON.parse(fields.message);

      // Process each submission
      await processSubmission(messageId, parsedData);
    }
  }
}

await initializeConsumerGroup();

// Start polling the stream
pollStream().catch((err) => console.error("Polling error:", err));
