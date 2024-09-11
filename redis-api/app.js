import * as todoService from "./services/todoService.js";
import { cacheMethodCalls } from "./util/cacheUtil.js";

const SERVER_ID = crypto.randomUUID();

const cachedTodoService = cacheMethodCalls(todoService, ["addTodo"]);

const handleGetRoot = async (request) => {
  return new Response(`Hello from ${ SERVER_ID }`);
};

const handleGetTodo = async (request, urlPatternResult) => {
  try {
    const id = urlPatternResult.pathname.groups.id;
    return Response.json(await cachedTodoService.getTodo(id));
  } catch (e) {
    return new Response("Todo not found", { status: 404 });
  }
};

const handleGetTodos = async (request) => {
  try {
    return Response.json(await cachedTodoService.getTodos());
  }
  catch (e) {
    return new Response("Internal error, e: " + e, { status: 400 });
  }
};

const handlePostTodos = async (request) => {
  try {
    const body = await request.json();
    await cachedTodoService.addTodo(body.item);
    return new Response("OK", { status: 200 });
  } catch (e) {
    return new Response("Bad request, " + e, { status: 400 });
  }
};

const handleDeleteTodo = async (request, urlPatternResult) => {
  try {
    const id = urlPatternResult.pathname.groups.id;

    // Check if the todo exists
    await cachedTodoService.getTodo(id);
    
    await cachedTodoService.deleteTodo(id);
    return new Response("OK", { status: 200 });
  }
  catch (e) {
    return new Response("Id not found", { status: 404 });
  }
};

const urlMapping = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/todos/:id" }),
    fn: handleGetTodo,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/todos" }),
    fn: handleGetTodos,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/todos" }),
    fn: handlePostTodos,
  },
  {
    method: "DELETE",
    pattern: new URLPattern({ pathname: "/todos/:id" }),
    fn: handleDeleteTodo,
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

Deno.serve({ port: 7777 }, handleRequest);
