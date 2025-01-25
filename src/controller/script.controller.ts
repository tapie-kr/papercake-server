import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { isValidProjectId } from "@/common/utils";

export default async function scriptController(fastify: FastifyInstance) {
  fastify.get(
    "/tag/:projectId",
    async (
      request: FastifyRequest<{ Params: { projectId: string } }>,
      reply: FastifyReply,
    ) => {
      const { projectId } = request.params;
      console.log(projectId);
      if (!isValidProjectId(projectId)) {
        return request.server.httpErrors.badRequest(
          "This project ID is not allowed.",
        );
      }
      return "ok";
    },
  );
}
