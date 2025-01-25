import "dotenv/config";
import Fastify from "fastify";
import { readFileSync } from "node:fs";
import fastifyCors from "@fastify/cors";
import fastifySensible from "@fastify/sensible";
import staticController from "@/controller/static.controller";
import scriptController from "@/controller/script.controller";

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
  await server.register(fastifySensible);

  await server.register(staticController);
  await server.register(scriptController);

  return server;
}

export default createApp;
