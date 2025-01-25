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

type SessionResponse = {
  status: number;
  headers: Record<string, any>;
  data?: any;
  location?: string;
};

async function makeSessionRequest(
  params: SessionParams,
  targetHost: string,
): Promise<SessionResponse> {
  const instance = await browserClient.create(SiteType.SESSION_CREATE);
  const response = await instance.get(
    `https://${params.server}.${targetHost}/${params.filename}.gif`,
    params.query ? { params: params.query } : undefined,
  );

  return {
    status: response.status,
    headers: response.headers,
    data: response.data,
    location: response.headers["location"],
  };
}

export async function handleRedirectSession(params: SessionParams) {
  const hostURI = getCurrentHostURI(params.request);
  const response = await makeSessionRequest(params, params.targetHost ?? "clarity.ms");

  if (response.status !== 302) {
    params.reply.send(
      params.request.server.httpErrors.internalServerError(
        "Response from an invalid server.",
      ),
    );
    return;
  }

  const convertedURI = response.location?.replace(
    /https:\/\/c\.(clarity\.ms|bing\.com)\/([^"?]+)\.gif(\?[^"]*)?/g,
    `${hostURI}/session/c/$2.gif$3`,
  );

  const headers = convertAxiosHeadersToFastify(response.headers, params.request);
  params.reply.headers(headers);
  params.reply.redirect(convertedURI!, 302);
}

export async function handleDataSession(params: SessionParams) {
  const response = await makeSessionRequest(params, "clarity.ms");

  if (response.status !== 200) {
    params.reply.send(
      params.request.server.httpErrors.internalServerError(
        "Response from an invalid server.",
      ),
    );
    return;
  }

  const headers = convertAxiosHeadersToFastify(response.headers, params.request);
  params.reply.headers(headers);
  params.reply.send(response.data);
}
