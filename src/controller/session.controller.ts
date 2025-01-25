import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { getCurrentHostURI, isValidProjectId } from "@/common/utils";
import { browserClient, SiteType } from "@/common/request";

// https://localhost/session/c.gif?server=c

export default async function sessionController(fastify: FastifyInstance) {
  fastify.get(
    "/session/:filename.gif",
    async (
      request: FastifyRequest<{ Params: { server: string } }>,
      reply: FastifyReply,
    ) => {
      const { server } = request.params;
      if (server.length > 2) {
        reply.send(
          request.server.httpErrors.badRequest(
            "This server ID is not allowed.",
          ),
        );
        return;
      }
    },
  );
}
