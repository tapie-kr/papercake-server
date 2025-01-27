import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  isValidProjectId,
  getCurrentHostURI,
  convertAxiosHeadersToFastify,
} from "@/common/utils";
import { browserClient, SiteType } from "@/common/request";

export default async function scriptController(fastify: FastifyInstance) {
  fastify.get(
    "/tag/:projectId",
    async (
      request: FastifyRequest<{
        Params: { projectId: string };
        Querystring: { headerCopy?: string };
      }>,
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

      const { headerCopy, ...queryParams } = request.query;
      const requestHeaders =
        headerCopy === "no"
          ? {}
          : {
              ...request.headers,
              "Sec-Ch-Ua-Mobile": "?0",
            };

      const axiosConfig = {
        params: queryParams,
        headers: requestHeaders,
      };

      const response = await instance.get(
        "https://www.clarity.ms/tag/" + projectId,
        axiosConfig,
      );
      console.log(response.status);
      const hostURI = getCurrentHostURI(request);
      const originalScript = response.data as string;
      const modifiedScript = originalScript
        .replace(
          /https:\/\/([^/]+)\.clarity\.ms\/collect/g,
          `${hostURI}/collect?server=$1`,
        )
        .replace(
          /https:\/\/([^/]+)\.clarity\.ms\/([^"]+)\.gif/g,
          `${hostURI}/session/$1/$2.gif`,
        )
        .replace(
          /https:\/\/www\.clarity\.ms\/s\/(.+)\/clarity\.js/,
          `${hostURI}/static/$1/tracker.js`,
        );
      const headers = convertAxiosHeadersToFastify(response.headers, request);

      reply.send(modifiedScript);
      return;
    },
  );
}
