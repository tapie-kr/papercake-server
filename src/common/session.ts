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
  copyCookies?: string[];
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
  const headers = Object.entries(params.request.headers)
    .filter(([key]) => key.toLowerCase() !== "cookie")
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  const instance = await browserClient.create(SiteType.SESSION_CREATE, {
    headers: {
      // ...headers,
      ...(params.request.headers.cookie && params.copyCookies?.length
        ? {
            cookie: params.request.headers.cookie
              .split(";")
              .map((cookie) => cookie.trim())
              .filter((cookie) =>
                params.copyCookies?.some((key) => cookie.startsWith(`${key}=`)),
              )
              .join("; "),
          }
        : {}),
    },
  });

  const requestConfig = params.query ? { params: params.query } : {};

  const response = await instance.get(
    `https://${params.server}.${targetHost}/${params.filename}.gif`,
    requestConfig,
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
  const response = await makeSessionRequest(
    {
      ...params,
      copyCookies: ["MUID", "SM"],
    },
    params.targetHost ?? "clarity.ms",
  );

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

  const headers = convertAxiosHeadersToFastify(
    response.headers,
    params.request,
  );
  params.reply.headers(headers);
  params.reply.redirect(convertedURI!, 302);
}

export async function handleDataSession(params: SessionParams) {
  const response = await makeSessionRequest(
    {
      ...params,
      copyCookies: ["MUID", "SM"],
    },
    "clarity.ms",
  );

  if (response.status !== 200) {
    params.reply.send(
      params.request.server.httpErrors.internalServerError(
        "Response from an invalid server.",
      ),
    );
  }

  const headers = convertAxiosHeadersToFastify(
    response.headers,
    params.request,
  );
  return {
    headers: headers,
    data: response.data,
  };
}
