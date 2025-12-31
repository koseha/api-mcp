/**
 * Tool: API 목록 조회
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { loadSwagger } from "../swagger/swaggerLoader.js";

export function registerGetApiList(server: McpServer) {
  server.registerTool(
    "getApiList",
    {
      title: "API 목록 조회",
      description: "API 목록을 조회합니다.",
    },
    async () => {
      const swagger = await loadSwagger();
      // paths → list 가공
      const result: Record<
        string,
        Record<
          string,
          { tags?: string[]; operationId?: string; summary?: string }
        >
      > = {};

      for (const [path, methods] of Object.entries(swagger.paths || {})) {
        if (!methods || typeof methods !== "object") continue;

        result[path] = {};
        for (const [method, operation] of Object.entries(methods)) {
          if (typeof operation === "object" && operation !== null) {
            result[path][method] = {
              tags: operation.tags,
              operationId: operation.operationId,
              summary: operation.summary,
            };
          }
        }
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
