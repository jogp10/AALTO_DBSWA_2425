import { sql } from "./database.js";

const helloMessage = `Hello from server: ${Math.floor(10000 * Math.random())}`;

const handleRequest = async (request) => {
  await sql`INSERT INTO visit_log (created_at) VALUES (
    NOW()
  )`;

  const rows = await sql`SELECT COUNT(*) FROM visit_log`;
  const count = rows[0].count;
  
  return new Response(`${helloMessage} -- count: ${count}`);
};

Deno.serve({ hostname: "0.0.0.0", port: 7777 }, handleRequest);