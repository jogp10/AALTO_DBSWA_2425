import * as programmingAssignmentService from "./services/programmingAssignmentService.js";
import { serve } from "./deps.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";

const SERVER_ID = crypto.randomUUID();

const cachedProgrammingService = cacheMethodCalls(programmingAssignmentService, ["submitAssignment"]);

const handleGetGrade = async (request) => {
  const programmingAssignments = await programmingAssignmentService.findAll();

  const requestData = await request.json();
  const testCode = programmingAssignments[0]["test_code"];
  const data = {
    testCode: testCode,
    code: requestData.code,
  };

  const response = await fetch("http://grader-api:7000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response;
};

const handleGetRoot = async (request) => {
  return new Response(`Hello from ${ SERVER_ID }`);
}

const handleGetAssignments = async () => {
  return Response.json(await programmingAssignmentService.findAll());
}

const handleGetAssignment = async (request, urlPatternResult) => {
  try {
    const id = urlPatternResult.pathname.groups.id;
    const nextAssignment = await programmingAssignmentService.getNextAssignment(id);
    return Response.json(nextAssignment[0]);
  } catch (e) {
    return new Response("Assignment not found", { status: 404 });
  }
}

const handleGetUserProgress = async (request, urlPatternResult) => {
  try {
    const id = urlPatternResult.pathname.groups.id;
    const progress = await programmingAssignmentService.getUserProgress(id);
    return Response.json(progress[0]);
  } catch (e) {
    return new Response("Progress not found", { status: 404 });
  }
}

const handlePostAssignment = async (request) => {
  try {
    const requestData = await request.json();
    await cachedProgrammingService.submitAssignment(requestData.user_uuid, requestData.programming_assignment_id, requestData.code);
    return new Response("Assignment submitted");
  } catch (e) {
    return new Response("Failed to submit assignment", { status: 500 });
  }
}

const urlMapping = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/assignment" }),
    fn: handleGetAssignments,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/assignment/:id" }),
    fn: handleGetAssignment,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/progress/:id" }),
    fn: handleGetUserProgress,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/assignment" }),
    fn: handlePostAssignment,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/grade" }),
    fn: handleGetGrade,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/" }),
    fn: handleGetRoot,
  }
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
    return new Response(e.stack, { status: 500 })
  }
};

const portConfig = { port: 7777, hostname: "0.0.0.0" };
serve(handleRequest, portConfig);
