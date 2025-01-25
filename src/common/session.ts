import { browserClient, SiteType } from "@/common/request";
import { FastifyRequest, FastifyReply } from "fastify";
import {
  getCurrentHostURI,
  convertAxiosHeadersToFastify,
} from "@/common/utils";

interface SessionParams {
  server: string;
  filename: string;
  request: FastifyRequest;
  reply: FastifyReply;
  query?: Record<string, string>;
  targetHost?: string;
}

export async function createSession({
  server,
  filename,
  request,
  reply,
  query,
  targetHost = "clarity.ms",
}: SessionParams) {
  const hostURI = getCurrentHostURI(request);
  const instance = await browserClient.create(SiteType.SESSION_CREATE);

  const response = await instance.get(
    `https://${server}.${targetHost}/${filename}.gif`,
    query ? { params: query } : undefined,
  );

  if (response.status !== 302) {
    reply.send(
      request.server.httpErrors.internalServerError(
        "Response from an invalid server.",
      ),
    );
    return;
  }

  const redirectURI = response.headers["location"] as string;
  const convertedURI = redirectURI.replace(
    /https:\/\/c\.(clarity\.ms|bing\.com)\/([^"?]+)\.gif(\?[^"]*)?/g,
    `${hostURI}/session/c/$2.gif$3`,
  );

  const headers = convertAxiosHeadersToFastify(response.headers, request);
  reply.headers(headers);
  reply.redirect(convertedURI, 302);
}
