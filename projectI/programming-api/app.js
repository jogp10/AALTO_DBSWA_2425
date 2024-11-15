import * as programmingAssignmentService from "./services/programmingAssignmentService.js";
import { serve } from "./deps.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";
import { createClient } from "./deps.js";

const SERVER_ID = crypto.randomUUID();

const cachedProgrammingService = cacheMethodCalls(
  programmingAssignmentService,
  ["getNextAssignment"]
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
    console.log("hey" + graderResult);
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
      return new Response("Completed all assignments", { status: 200 });
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
    return new Response("Error while retrieving user progress", { status: 500 });
  }
};

const handlePostAssignment = async (request) => {
  try {
    const requestData = await request.json();

    // Check if user has ongoing assignment (submission-status = 'pending')
    let submission = await cachedProgrammingService.checkOngoingSubmission(
      requestData.user_uuid
    );

    if (submission.length > 0) {
      return new Response("You have an ongoing grading, wait for feedback", { status: 400 });
    }

    // Check if user has already submitted the same code
    submission = await cachedProgrammingService.getSubmission(
      requestData.user_uuid,
      requestData.programming_assignment_id,
      requestData.code
    );

    if (submission.length > 0) {
      return new Response(submission[0], { status: 200 });
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
    sendToGrade(requestData);

    return new Response(submissionId, { status: 200 });
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
    metadata: requestData
  };

  const client = createClient({
    url: "redis://redis:6379",
    pingInterval: 1000,
  });
 
  await client.connect();

  console.log("Connected to Redis and adding message to grading stream");
  console.log(data); 

  // Add message to the Redis Stream instead of publishing to a channel
  await client.xAdd(
    "grading_queue",  // Stream name
    "*",              // Use "*" to auto-generate the message ID
    {
      message: JSON.stringify(data),
    }
  );

  // Close the Redis connection
  await client.disconnect();
}

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
