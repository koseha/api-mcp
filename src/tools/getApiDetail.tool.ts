/**
 * Tool: API 상세 조회
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { loadSwagger } from "../swagger/swaggerLoader.js";

export function registerGetApiDetail(server: McpServer) {
  server.registerTool(
    "getApiDetail",
    {
      title: "API 상세 조회",
      description: "API 상세를 조회합니다.",
      inputSchema: {
        requestUrl: z.string(),
        httpMethod: z.enum(["get", "post", "put", "delete", "patch"]),
      },
    },
    async ({ requestUrl, httpMethod }) => {
      if (!requestUrl || !httpMethod) {
        return {
          content: [
            { type: "text", text: "requestUrl 또는 httpMethod가 없습니다." },
          ],
        };
      }
      const swagger = await loadSwagger();
      const api = swagger.paths[requestUrl][httpMethod];
      return {
        content: [{ type: "text", text: JSON.stringify(api) }],
      };
    }
  );
}
