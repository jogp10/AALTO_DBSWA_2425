const portConfig = { port: 7777 };

const handleRequest = async (request) => {
  return new Response("Hello world!");
};

const handleHttpConnection = async (conn) => {
  for await (const requestEvent of Deno.serveHttp(conn)) {
    requestEvent.respondWith(await handleRequest(requestEvent.request));
  }
}

for await (const conn of Deno.listen(portConfig)) {
  handleHttpConnection(conn);
}