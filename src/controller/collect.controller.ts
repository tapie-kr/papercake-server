import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { convertAxiosHeadersToFastify } from "@/common/utils";
import { browserClient, SiteType } from "@/common/request";

export default async function collectController(fastify: FastifyInstance) {
  fastify.post(
    "/collect",
    {
      config: {
        accept: ["application/x-clarity-gzip"],
      },
      bodyLimit: 1048576, // 1MB
      preParsing: (request, reply, payload, done) => {
        done(null, payload);
      },
    },
    async (
      request: FastifyRequest<{
        Querystring: { server: string; headerCopy?: string };
      }>,
      reply: FastifyReply,
    ) => {
      const { server, headerCopy, ...queryParams } = request.query;
      if (server.length > 2) {
        reply.send(
          request.server.httpErrors.badRequest(
            "This server ID is not allowed.",
          ),
        );
        return;
      }

      const requestHeaders =
        headerCopy === "no"
          ? {}
          : {
              "Sec-Ch-Ua-Mobile": "?0",
              cookie:
                request.headers.cookie
                  ?.split(";")
                  .map((cookie) => cookie.trim())
                  .find((cookie) => cookie.startsWith("MUID=")) || "",
            };

      console.log("[Outgoing Request Headers]", requestHeaders);

      const instance = await browserClient.create(SiteType.COLLECT_DATA);
      const response = await instance.post(
        `https://${server}.clarity.ms/collect`,
        {
          headers: requestHeaders,
          data: request.body,
          params: queryParams,
        },
      );

      const headers = convertAxiosHeadersToFastify(response.headers, request);
      reply.status(response.status).send(response.data);
    },
  );
}
