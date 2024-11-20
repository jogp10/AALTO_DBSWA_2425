const jokes = [
    "What did baby corn say to mama corn? -- Where's pop corn?",
    "Why are eggs bad at handling stress? -- They crack under pressure.",
  ];
  
  const server = `Server ${Math.floor(10000 * Math.random())}`;
  
  const handleRequest = async (request) => {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
  
    return new Response(`${server}: ${joke}`);
  };
  
  Deno.serve({ hostname: "0.0.0.0", port: 7777 }, handleRequest);