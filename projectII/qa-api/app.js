import * as apiService from "./services/qaService.js";
import { addJobToQueue } from "./services/generatorService.js";
import { serve } from "./deps.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";


const SERVER_ID = crypto.randomUUID();

let sockets = new Set();

const qaService = cacheMethodCalls(
  apiService,
  ["upVote", "addQuestion", "addAnswer", "deleteVote", "saveGeneratedAnswers", "checkVote"],
);

const handleGetRoot = async (request) => {
  return new Response(`Hello from ${SERVER_ID}`);
};

const handleTestRequest = async (request) => {
  const data = await request.json();
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
};

const handleGetCourse = async (request, params) => {
  const courseId = params.pathname.groups.courseId;
  const course = await qaService.getCourse(courseId);
  return new Response(JSON.stringify(course), {
    headers: { "content-type": "application/json" },
  });
};

const handleGetQuestions = async (request, params) => {
  const courseId = params.pathname.groups.courseId;

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || 1;
  const user_uuid = url.searchParams.get("user_uuid");

  const questions = await qaService.getQuestions(courseId, page);
  const votesByUser = await qaService.getVotesByUser(user_uuid);

  questions.forEach((question) => {
    const vote = votesByUser.find((v) => v.question_id === question.id);
    question.upvoted = vote ? true : false;
  });

  return new Response(JSON.stringify(questions), {
    headers: { "content-type": "application/json" },
  });
};

const handleGetQuestion = async (request, params) => {
  const questionId = params.pathname.groups.questionId;
  const url = new URL(request.url);
  const user_uuid = url.searchParams.get("user_uuid");
  const question = await qaService.getQuestion(questionId);
  
  // get if user has upvoted
  const upvoted = await qaService.checkVote({
    id: questionId,
    user_uuid: user_uuid,
    type: "question",
  });

  question.upvoted = upvoted ? true : false;

  return new Response(JSON.stringify(question), {
    headers: { "content-type": "application/json" },
  });
};

const handleGetAnswers = async (request, params) => {
  const questionId = params.pathname.groups.questionId;

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || 1;
  const user_uuid = url.searchParams.get("user_uuid");

  const answers = await qaService.getAnswers(questionId, page);
  const votesByUser = await qaService.getVotesByUser(user_uuid);

  answers.forEach((answer) => {
    const vote = votesByUser.find((v) => v.answer_id === answer.id);
    answer.upvoted = vote ? true : false;
  });

  return new Response(JSON.stringify(answers), {
    headers: { "content-type": "application/json" },
  });
};

const handlePostQuestion = async (request, params) => {
  const courseId = params.pathname.groups.courseId;
  const data = await request.json();

  // Check if user has posted in last minute
  const lastQuestion = await qaService.getLastQuestion(data);

  if (lastQuestion) {
    return new Response(
      JSON.stringify({
        message: "User has posted a question in the last minute",
      }),
      {
        headers: { "content-type": "application/json" },
      }
    );
  }

  const question = await qaService.addQuestion(courseId, data);

  sockets.forEach((socket) => {
    try {
      socket.send(JSON.stringify(question));
    } catch (e) {
      sockets.delete(socket);
    }
  });

  // Submit job to LLM API to generate answers
  await addJobToQueue({
    user: data.user_uuid,
    questionId: question.id,
    question: question.content,
  });

  return new Response(JSON.stringify(question), {
    headers: { "content-type": "application/json" },
  });
};

const handlePostAnswer = async (request, params) => {
  const questionId = params.pathname.groups.questionId;
  const data = await request.json();


  // Check if user has already answered
  const userHasAnswered = await qaService.checkAnswer(data);

  if (userHasAnswered) {
    return new Response(
      JSON.stringify({ message: "User has already answered" }),
      {
        headers: { "content-type": "application/json" },
      }
    );
  }
  
  // Check if user posted in last minute
  const lastAnswer = await qaService.getLastAnswer(data);
  if (lastAnswer) {
    return new Response(
      JSON.stringify({
        message: "User has posted an answer in the last minute",
      }),
      {
        headers: { "content-type": "application/json" },
      }
    );
  }
  
  const answer = await qaService.addAnswer(questionId, data);
  
  sockets.forEach((socket) => {
    try {
      socket.send(JSON.stringify(answer));
    } catch (e) {
      sockets.delete(socket);
    }
  });
  
  return new Response(JSON.stringify(answer), {
    headers: { "content-type": "application/json" },
  });
};

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
};

const handleSubscribeUpdates = async (request) => {
  const { socket, response } = Deno.upgradeWebSocket(request);

  sockets.add(socket);

  sockets.onclose = () => {
    sockets.delete(socket);
  };

  return response;
};

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
    pattern: new URLPattern({ pathname: "/subscribe_updates" }),
    fn: handleSubscribeUpdates,
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
