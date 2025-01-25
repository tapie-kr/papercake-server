import "dotenv/config";
import Fastify from "fastify";
import { readFileSync } from "node:fs";
import fastifyCors from "@fastify/cors";
import staticController from "@/controller/static.controller";

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

  await server.register(staticController);

  return server;
}

export default createApp;
