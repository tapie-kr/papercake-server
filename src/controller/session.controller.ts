import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { isValidProjectId } from "@/common/utils";
import { SessionSecondStepQuery } from "@/common/variable";
import { createSession } from "@/common/session";

// https://localhost/session/c/c.gif

export default async function sessionController(fastify: FastifyInstance) {
  fastify.get(
    "/session/:server/:filename.gif",
    async (
      request: FastifyRequest<{
        Params: { server: string; filename: string };
        Querystring: Record<string, string>;
      }>,
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

      if (Object.keys(request.query).length === 0) {
        await createSession({ server, filename, request, reply });
      } else if (SessionSecondStepQuery.every((key) => key in request.query)) {
        await createSession({
          server,
          filename,
          request,
          reply,
          query: request.query,
          targetHost: 'bing.com',
        });
      }
    },
  );
}
