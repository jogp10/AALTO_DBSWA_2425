const helloMessage = `Hello from server: ${Math.floor(10000 * Math.random())}`;

const handleRequest = async (request) => {
  return new Response(helloMessage);
};

Deno.serve({ hostname: "0.0.0.0", port: 7777 }, handleRequest);