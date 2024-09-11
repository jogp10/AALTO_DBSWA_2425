import postgres from "https://deno.land/x/postgresjs@v3.4.4/mod.js";

const sql = postgres({
  // local usage
  // database: "db",
  // username: "postgres",
  // password: "postgres"
});

const handleGetRoot = async (request) => {
  return new Response("Hello world at root!");
};

const handleGetTodo = async (request, urlPatternResult) => {
  try {
    const id = urlPatternResult.pathname.groups.id;
    const todos = await sql`SELECT * FROM todos WHERE id = ${id}`;

    return Response.json(todos[0]);
  } catch (e) {
    return new Response("Id not found", { status: 404 });
  }
};

const handleGetTodos = async (request) => {
  try {
    const todos = await sql`SELECT * FROM todos`;
    return Response.json(todos);
  }
  catch (e) {
    return new Response("Internal error, e: " + e, { status: 400 });
  }
};

const handlePostTodos = async (request) => {
  try {
    const body = await request.json();

    if (!body.item || body.item.length === 0) {
      return new Response("Bad request", { status: 400 });
    }

    await sql`INSERT INTO todos (item) VALUES (${body.item})`;
    return new Response("OK", { status: 200 });
  } catch (e) {
    return new Response("Bad request", { status: 400 });
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
