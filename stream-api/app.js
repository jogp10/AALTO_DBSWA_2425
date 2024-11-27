import { serve } from "https://deno.land/std@0.222.1/http/server.ts";

const message = new TextEncoder().encode("data: {\"user\": \"bob\", \"message\": \"Hello world!\"}\n\n");

const handleRequest = async (request) => {
  let interval;

  const body = new ReadableStream({
    start(controller) {
      interval = setInterval(() => {
        controller.enqueue(message);
      }, 1000);
    },
    cancel() {
      clearInterval(interval);
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Access-Control-Allow-Origin": "*",
      Connection: "keep-alive",
    },
  });
};
 
serve(handleRequest, { port: 1111 });