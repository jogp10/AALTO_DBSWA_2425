import * as programmingAssignmentService from "./services/programmingAssignmentService.js";
import { createClient, serve } from "./deps.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";

const SERVER_ID = crypto.randomUUID();

const client = createClient({
  url: "redis://redis:6379",
  pingInterval: 1000,
});

const pubsubClient = createClient({
  url: "redis://redis:6379",
  pingInterval: 1000,
});

await client.connect();
await pubsubClient.connect();

const cachedProgrammingService = cacheMethodCalls(
  programmingAssignmentService,
  ["getNextAssignment", "submitAssignment"]
);

const handleGetGrade = async (request) => {
  try {
    const requestData = await request.json();

    const programmingAssignment =
      await cachedProgrammingService.getNextAssignmentTestCode(
        requestData.user
      );
    const testCode = programmingAssignment[0]["test_code"];
    const data = {
      testCode: testCode,
      code: requestData.code,
    };

    const graderResponse = await fetch("http://grader-api:7000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Parse the grader's response
    const graderResult = (await graderResponse.json()).result; // Assuming it returns text with first-line indicators

    let feedback = {};

    // Process grader result based on the first line of the response
    const firstLine = graderResult.split("\n")[0];
    if (firstLine === "." || firstLine === "..") {
      // Success case
      feedback = {
        status: "success",
        message: "You have successfully completed the assignment!",
      };
    } else if (firstLine == "F") {
      // Test failure case
      feedback = {
        status: "fail",
        feedback: {
          errors: graderResult.split("\n").slice(1), // The rest of the lines are feedback
          suggestions: "Review test case failures and adjust your code.",
        },
      };
    } else {
      // Error case (likely a syntax or runtime error)
      feedback = {
        status: "error",
        feedback: {
          errors: graderResult.split("\n"), // The lines are error details
          suggestions: "Fix the syntax or runtime errors in your code.",
        },
      };
    }

    // Return the processed feedback as a response
    return new Response(JSON.stringify(feedback), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("Failed to grade assignment", { status: 500 });
  }
};

const handleGetRoot = async (request) => {
  return new Response(`Hello from ${SERVER_ID}`);
};

const handleGetAssignments = async () => {
  try {
    return Response.json(await cachedProgrammingService.findAll());
  } catch (e) {
    return new Response("Error while retrieving assignments", { status: 500 });
  }
};

const handleGetAssignment = async (request, urlPatternResult) => {
  try {
    const user_uuid = urlPatternResult.pathname.groups.user_uuid;
    const nextAssignment = await cachedProgrammingService.getNextAssignment(
      user_uuid
    );

    if (nextAssignment.length === 0) {
      return Response.json({completed: "True" }, { status: 200 });
    }

    return Response.json(nextAssignment[0]);
  } catch (e) {
    return new Response("Assignment not found", { status: 404 });
  }
};

const handleGetUserProgress = async (request, urlPatternResult) => {
  try {
    const user_uuid = urlPatternResult.pathname.groups.user_uuid;
    const progress = await cachedProgrammingService.getUserProgress(user_uuid);
    return Response.json(progress[0]);
  } catch (e) {
    return new Response("Error while retrieving user progress", {
      status: 500,
    });
  }
};

const handlePostAssignment = async (request) => {
  try {
    const requestData = await request.json();
    const result = {
      message: "Assignment submitted for grading",
      submissionId: -1,
      graded: null,
    }

    // Check if user has ongoing assignment (submission-status = 'pending')
    let submission = await cachedProgrammingService.checkOngoingSubmission(
      requestData.user_uuid
    );

    if (submission.length > 0) {
      result.message = "You have an ongoing grading, wait for feedback";
      return Response.json(result, {
        status: 400,
      });
    }

    // Check if user has already submitted the same code
    submission = await cachedProgrammingService.getSubmission(
      requestData.user_uuid,
      requestData.programming_assignment_id,
      requestData.code
    );

    if (submission.length > 0) {
      result.graded = submission[0];
      return Response.json(result, { status: 200 });
    }

    // Submit the assignment
    await cachedProgrammingService.submitAssignment(
      requestData.user_uuid,
      requestData.programming_assignment_id,
      requestData.code
    );

    // Submit for grading
    // Generate a unique ID for the submission, to UI subscribe to the channel
    const submissionId = crypto.randomUUID();
    requestData.submissionId = submissionId;
    result.submissionId = submissionId;
    await sendToGrade(requestData);

    const response = Response.json(result, { status: 200 });
    return response;
  } catch (e) {
    return new Response("Failed to submit assignment, " + e, { status: 500 });
  }
};

const sendToGrade = async (requestData) => {
  const programmingAssignment =
    await cachedProgrammingService.getNextAssignmentTestCode(
      requestData.user_uuid
    );

  const testCode = programmingAssignment[0]["test_code"];
  const data = {
    testCode: testCode,
    code: requestData.code,
    metadata: requestData,
  };

  // Add message to the Redis Stream
  await client.xAdd("grading_queue", "*", {
    message: JSON.stringify(data),
  });
};

const handleProgressUpdates = async (request, params) => {
  const submissionId = params.pathname.groups.submissionId;

  const body = new ReadableStream({
    async start(controller) {
      // Subscribe to the Redis feedback channel
      const channel = "feedback-channel";
      await pubsubClient.subscribe(channel, (message) => {
        try { 
          const feedback = JSON.parse(message);
          if (feedback.submissionId === submissionId) {
            console.log("Sending feedback to client", feedback);
            const formattedMessage = `data: ${JSON.stringify(feedback)}\n\n`;
            controller.enqueue(new TextEncoder().encode(formattedMessage));

            // Optionally close the stream if only one update is needed
            controller.close();
          }
        } catch (error) {
          console.error("Error processing feedback message:", error);
          controller.error(error);
        }
      });
    }, 
    cancel() {
      pubsubClient.unsubscribe("feedback-channel");
    }
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};

const urlMapping = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/assignment" }),
    fn: handleGetAssignments,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/assignment/:user_uuid" }),
    fn: handleGetAssignment,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/assignment" }),
    fn: handlePostAssignment,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/progress/:user_uuid" }),
    fn: handleGetUserProgress,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/" }),
    fn: handleGetRoot,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/grading/:submissionId" }),
    fn: handleProgressUpdates,
  },
];

const handleRequest = async (request) => {
  const mapping = urlMapping.find(
    (um) => um.method === request.method && um.pattern.test(request.url)
  );

  if (!mapping) {
    return new Response("Not found", { status: 404 });
  }

  const mappingResult = mapping.pattern.exec(request.url);
  try {
    return await mapping.fn(request, mappingResult);
  } catch (e) {
    console.log(e);
    return new Response(e.stack, { status: 500 });
  }
};

const portConfig = { port: 7777, hostname: "0.0.0.0" };
serve(handleRequest, portConfig);
