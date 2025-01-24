import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import "dotenv/config";
import { readFileSync } from "node:fs";

async function createApp() {
  const httpsOptions = {
    key: readFileSync("./server.key"),
    cert: readFileSync("./server.crt"),
  };
  const server = Fastify({
    logger: process.env.NODE_ENV !== "development",
    https: httpsOptions,
    requestTimeout: 30000,
  });

  await server.register(fastifyCors, {
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });
  return server;
}

const server = createApp();

export default server;
