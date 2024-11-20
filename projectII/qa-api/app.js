import * as qaService from "./services/qaService.js";
import { addJobToQueue } from "./services/generatorService.js";
import { serve } from "./deps.js";

const SERVER_ID = crypto.randomUUID();

const handleGetRoot = async (request) => {
  return new Response(`Hello from ${SERVER_ID}`);
};

const handleTestRequest = async (request) => {
  const data = await request.json();
  console.log(data);
  const response = await fetch("http://llm-api:7000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response;
};

const handleGetCourses = async (request) => {
  const courses = await qaService.getCourses();
  return new Response(JSON.stringify(courses), {
    headers: { "content-type": "application/json" },
  });
}

const handleGetCourse = async (request, params) => {
  const courseId = params.pathname.groups.courseId;
  const course = await qaService.getCourse(courseId);
  return new Response(JSON.stringify(course), {
    headers: { "content-type": "application/json" },
  });
}

const handleGetQuestions = async (request, params) => {
  const courseId = params.pathname.groups.courseId;

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || 1;

  const questions = await qaService.getQuestions(courseId, page);
  return new Response(JSON.stringify(questions), {
    headers: { "content-type": "application/json" },
  });
}

const handleGetQuestion = async (request, params) => {
  const questionId = params.pathname.groups.questionId;
  const question = await qaService.getQuestion(questionId);
  return new Response(JSON.stringify(question), {
    headers: { "content-type": "application/json" },
  });
}

const handleGetAnswers = async (request, params) => {
  const questionId = params.pathname.groups.questionId;

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || 1;

  const answers = await qaService.getAnswers(questionId, page);
  return new Response(JSON.stringify(answers), {
    headers: { "content-type": "application/json" },
  });
}

const handlePostQuestion = async (request, params) => {
  const courseId = params.pathname.groups.courseId;
  const data = await request.json();

  // Check if user has posted in last minute
  const lastQuestion = false//await qaService.getLastQuestion(data);

  if (lastQuestion) {
    return new Response(JSON.stringify({ message: "User has posted a question in the last minute" }), {
      headers: { "content-type": "application/json" },
    });
  }
  
  const question = await qaService.addQuestion(courseId, data);

  // Submit job to LLM API to generate answers
  await addJobToQueue({
    user: data.user_uuid,
    questionId: question.id,
    question: question.content
  });

  return new Response(JSON.stringify(question), {
    headers: { "content-type": "application/json" },
  });
}

const handlePostAnswer = async (request, params) => {
  const questionId = params.pathname.groups.questionId;
  const data = await request.json();

  // Check if user has already answered
  const userHasAnswered = await qaService.checkAnswer(data);

  if (userHasAnswered) {
    return new Response(JSON.stringify({ message: "User has already answered" }), {
      headers: { "content-type": "application/json" },
    });
  }

  // Check if user posted in last minute
  const lastAnswer = await qaService.getLastAnswer(data);
  if (lastAnswer) {
    return new Response(JSON.stringify({ message: "User has posted an answer in the last minute" }), {
      headers: { "content-type": "application/json" },
    });
  }

  const answer = await qaService.addAnswer(questionId, data);
  return new Response(JSON.stringify(answer), {
    headers: { "content-type": "application/json" },
  });
}

const handleUpVote = async (request) => {
  const data = await request.json();

  // Check if user has already voted
  const userHasVoted = await qaService.checkVote(data);

  if (userHasVoted) {
    // delete vote
    await qaService.deleteVote(data);
    return new Response(JSON.stringify({ message: "Vote deleted" }), {
      headers: { "content-type": "application/json" },
    });
  }

  const updated = await qaService.upVote(data);
  return new Response(JSON.stringify(updated), {
    headers: { "content-type": "application/json" },
  });
}

const urlMapping = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/courses" }),
    fn: handleGetCourses,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/courses/:courseId" }),
    fn: handleGetCourse,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/courses/:courseId/questions" }),
    fn: handleGetQuestions,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/questions/:questionId" }),
    fn: handleGetQuestion,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/questions/:questionId/answers" }),
    fn: handleGetAnswers,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/courses/:courseId/questions" }),
    fn: handlePostQuestion,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/questions/:questionId/answers" }),
    fn: handlePostAnswer,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/upvote" }),
    fn: handleUpVote,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/test" }),
    fn: handleTestRequest,
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
