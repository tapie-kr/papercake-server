import "dotenv/config";
import { FastifyRequest } from "fastify";

function parseENVList(input: string): string[] {
  return input.split(",").map((id) => id.trim());
}

const ALLOW_PROJECT_ID = parseENVList(
  process.env["ALLOW_PROJECT_ID"] as string,
);

function isValidProjectId(projectId: string): boolean {
  return ALLOW_PROJECT_ID.includes(projectId);
}

function getCurrentHostURI(request: FastifyRequest): string {
  const protocol = request.protocol;
  const hostname = request.hostname;
  const port = request.server.addresses()[0].port;

  return port === 80 || port === 443
    ? `${protocol}://${hostname}`
    : `${protocol}://${hostname}:${port}`;
}

export function convertAxiosHeadersToFastify(
  headers: Record<string, any>,
  request: FastifyRequest,
  excludeKeys: string[] = ["location"],
): Record<string, string | string[]> {
  return Object.entries(headers).reduce(
    (acc, [key, value]) => {
      if (key === "set-cookie" && Array.isArray(value)) {
        acc[key] = value.map((cookie) =>
          cookie.replace(/domain=[^;]+/gi, `domain=${request.hostname}`),
        );
      } else if (!excludeKeys.includes(key)) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, string | string[]>,
  );
}

export { parseENVList, isValidProjectId, getCurrentHostURI };
