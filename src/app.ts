import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import "dotenv/config";

async function createApp() {
  const server = Fastify({
    logger: process.env.NODE_ENV !== "development",
  });

  await server.register(fastifyCors, {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });
  return server;
}

const server = createApp();

export default server;
