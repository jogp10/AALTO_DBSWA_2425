import { serve } from "https://deno.land/std@0.222.1/http/server.ts";

const handleRequest = async (request) => {
  const { socket, response } = Deno.upgradeWebSocket(request);

  let interval = setInterval(() => {
    socket.send("{\"user\": \"bob\", \"message\": \"Hello world!\"}");
  }, 1000);

  socket.onclose = () => {
    clearInterval(interval);
  };

  socket.onmessage = (event) => {
    console.log(event.data);
    
    setTimeout(() => {
      socket.send("Pong");
    }, 1000);
  };

  return response;
};

serve(handleRequest, { port: 7777 });