import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { getCurrentHostURI, isValidProjectId } from "@/common/utils";
import { browserClient, SiteType } from "@/common/request";

// https://localhost/session/c/c.gif

export default async function sessionController(fastify: FastifyInstance) {
  fastify.get(
    "/session/:server/:filename.gif",
    async (
      request: FastifyRequest<{ Params: { server: string; filename: string } }>,
      reply: FastifyReply,
    ) => {
      const { server, filename } = request.params;
      if (server.length > 2 || filename.length > 2) {
        reply.send(
          request.server.httpErrors.badRequest(
            "This server ID or filename is not allowed.",
          ),
        );
        return;
      }
    },
  );
}
