import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { convertAxiosHeadersToFastify } from "@/common/utils";
import { browserClient, SiteType } from "@/common/request";

export default async function collectController(fastify: FastifyInstance) {
  fastify.post(
    "/collect",
    async (
      request: FastifyRequest<{
        Params: { server: string; headerCopy?: string };
      }>,
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

      const { headerCopy, ...queryParams } = request.params;
      const requestHeaders = headerCopy === "no" ? {} : request.headers;

      const instance = await browserClient.create(SiteType.COLLECT_DATA);
      const response = await instance.get(
        `https://${server}.clarity.ms/collect`,
        {
          headers: request.headers,
          data: request.body,
        },
      );
      const headers = convertAxiosHeadersToFastify(response.headers, request);
      reply.headers(headers);
      reply.send(response.data);
    },
  );
}
