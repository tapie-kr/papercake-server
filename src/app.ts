import "dotenv/config";
import Fastify from "fastify";
import { readFileSync } from "node:fs";
import fastifyCors from "@fastify/cors";
import fastifySensible from "@fastify/sensible";
import staticController from "@/controller/static.controller";
import scriptController from "@/controller/script.controller";
import sessionController from "@/controller/session.controller";
import collectController from "@/controller/collect.controller";

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

  server.addContentTypeParser("*", function (request, payload, done) {
    let data = "";
    payload.on("data", (chunk) => {
      data += chunk;
    });
    payload.on("end", () => {
      done(null, data);
    });
  });

  await server.register(fastifyCors, {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });
  await server.register(fastifySensible);

  await server.register(staticController);
  await server.register(scriptController);
  await server.register(sessionController);
  await server.register(collectController);

  return server;
}

export default createApp;
