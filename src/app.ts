import Fastify from "fastify";
import "dotenv/config";

const server = Fastify({
  logger: process.env.NODE_ENV !== "development",
});

export default server;
