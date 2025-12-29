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
      return {
        content: [{ type: "text", text: JSON.stringify(swagger.paths) }],
      };
    }
  );
}
