import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { isValidProjectId, getCurrentHostURI } from "@/common/utils";
import { browserClient, SiteType } from "@/common/request";

export default async function scriptController(fastify: FastifyInstance) {
  fastify.get(
    "/tag/:projectId",
    async (
      request: FastifyRequest<{ Params: { projectId: string } }>,
      reply: FastifyReply,
    ) => {
      const { projectId } = request.params;
      if (!isValidProjectId(projectId)) {
        reply.send(
          request.server.httpErrors.badRequest(
            "This project ID is not allowed.",
          ),
        );
        return;
      }

      const instance = await browserClient.create(SiteType.CLARITY_INJECT);
      const response = await instance.get(
        "https://www.clarity.ms/tag/" + projectId,
        {
          params: request.query,
        },
      );
      const hostURI = getCurrentHostURI(request);
      console.log(hostURI);
      const originalScript = response.data as string;
      const modifiedScript = originalScript
        .replace(
          /https:\/\/[^/]+\.clarity\.ms\/collect/g,
          `${hostURI}/collect?server=$1`,
        )
        .replace(
          /https:\/\/[^/]+\.clarity\.ms\/([^"]+)\.gif/g,
          `${hostURI}/session/$1.gif?server=$1`,
        )
        .replace(
          /https:\/\/www\.clarity\.ms\/s\/(.+)\/clarity\.js/,
          `${hostURI}/static/$1/tracker.js`,
        );

      reply.send(modifiedScript);
      return;
    },
  );
}
