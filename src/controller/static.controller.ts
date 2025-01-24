import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export default async function staticController(fastify: FastifyInstance) {
  fastify.get(
    "/static/:version/tracker.js",
    async (req: FastifyRequest, res: FastifyReply) => {},
  );
}
