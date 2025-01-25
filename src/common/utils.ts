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

export { parseENVList, isValidProjectId, getCurrentHostURI };
