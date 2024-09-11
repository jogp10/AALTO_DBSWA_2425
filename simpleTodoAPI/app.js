let todos = [];

const handleGetRoot = async (request) => {
  return new Response("Hello world at root!");
};

const handleGetTodos = async (request) => {
  return new Response(JSON.stringify(todos));
};

const handlePostTodos = async (request) => {
  try {
    const body = await request.json();
    todos.push(body);
    return new Response("OK", { status: 200 });
  } catch (e) {
    return new Response("Bad request", { status: 400 });
  }
};

const urlMapping = [
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
  return await mapping.fn(request, mappingResult);
};

Deno.serve({ port: 7777 }, handleRequest);
