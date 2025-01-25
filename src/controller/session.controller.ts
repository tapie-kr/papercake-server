import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  SessionSecondStepQuery,
  SessionThirdStepQuery,
} from "@/common/variable";
import { handleRedirectSession, handleDataSession } from "@/common/session";

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

      const sessionParams = { server, filename, request, reply };

      try {
        if (Object.keys(request.query).length === 0) {
          await handleRedirectSession(sessionParams);
        } else if (
          SessionSecondStepQuery.every((key) => key in request.query)
        ) {
          await handleRedirectSession({
            ...sessionParams,
            query: request.query,
            targetHost: "bing.com",
          });
        } else if (SessionThirdStepQuery.every((key) => key in request.query)) {
          await handleDataSession({
            ...sessionParams,
            query: request.query,
          });
        }
      } catch (error) {
        request.log.error(error);
        reply.code(500).send({ error: "Failed to handle session request" });
      }
    },
  );
}
