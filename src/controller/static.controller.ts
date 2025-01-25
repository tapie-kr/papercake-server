import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import CacheManager from "@/common/cache";

export default async function staticController(fastify: FastifyInstance) {
  const cacheManager = new CacheManager();

  fastify.get(
    "/static/:version/tracker.js",
    async (
      request: FastifyRequest<{ Params: { version: string } }>,
      reply: FastifyReply,
    ) => {
      const { version } = request.params;

      try {
        const { content, headers, cached } =
          await cacheManager.getOrFetchClarityScript(version);

        if (headers["set-cookie"]) {
          const cookies = headers["set-cookie"] as string | string[];
          const cookieArray = typeof cookies === "string" ? [cookies] : cookies;

          reply.header(
            "Set-Cookie",
            cookieArray.map((cookie) =>
              cookie.replace(/Domain=[^;]+;/i, `Domain=${request.hostname};`),
            ),
          );
        }

        reply
          .code(200)
          .type("application/javascript")
          .header("X-Cache", cached ? "HIT" : "MISS");
        return content;
      } catch (error) {
        request.log.error(error);
        reply.code(500);
        return { error: "Failed to fetch Clarity script" };
      }
    },
  );
}
