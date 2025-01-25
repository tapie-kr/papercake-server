import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { getCurrentHostURI, isValidProjectId } from "@/common/utils";
import { browserClient, SiteType } from "@/common/request";
import { SessionSecondStepQuery } from "@/common/variable";

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
      const hostURI = getCurrentHostURI(request);
      const { server, filename } = request.params;

      if (server.length > 2 || filename.length > 2) {
        reply.send(
          request.server.httpErrors.badRequest(
            "This server ID or filename is not allowed.",
          ),
        );
        return;
      }
      console.log("keylength", Object.keys(request.query).length);
      console.log("keys", request.query);
      if (Object.keys(request.query).length === 0) {
        const instance = await browserClient.create(SiteType.SESSION_CREATE);
        const response = await instance.get(
          `https://${server}.clarity.ms/${filename}.gif`,
        );
        if (response.status != 302) {
          reply.send(
            request.server.httpErrors.internalServerError(
              "Response from an invalid server.",
            ),
          );
          return;
        }
        const redirectURI = response.headers["location"] as string;
        const convertedURI = redirectURI.replace(
          /https:\/\/c\.bing\.com\/([^"?]+)\.gif(\?[^"]*)/g,
          `${hostURI}/session/c/$1.gif$2`,
        );
        console.log(response.headers);
        const headers = Object.entries(response.headers).reduce(
          (acc, [key, value]) => {
            if (key !== "location") {
              acc[key] = value;
            }
            return acc;
          },
          {} as Record<string, string | string[]>,
        );
        reply.headers(headers);
        reply.redirect(convertedURI, 302);
        return;
      } else if (SessionSecondStepQuery.every((key) => key in request.query)) {
      }
    },
  );
}
