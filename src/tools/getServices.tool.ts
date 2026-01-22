/**
 * Tool: 서비스 목록 조회
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { loadSwagger } from "../swagger/swaggerLoader.js";

/**
 * Swagger 문서에서 모든 고유한 tags 추출
 */
function extractApiGroups(swagger: any): string[] {
  const tags = new Set<string>();

  // tags 배열에서 추출
  if (Array.isArray(swagger.tags)) {
    swagger.tags.forEach((tag: any) => {
      if (typeof tag === "string") {
        tags.add(tag);
      } else if (tag?.name) {
        tags.add(tag.name);
      }
    });
  }

  // paths에서 tags 추출
  if (swagger.paths && typeof swagger.paths === "object") {
    for (const path of Object.values(swagger.paths)) {
      if (path && typeof path === "object") {
        for (const method of Object.values(path)) {
          if (
            method &&
            typeof method === "object" &&
            Array.isArray(method.tags)
          ) {
            method.tags.forEach((tag: string) => tags.add(tag));
          }
        }
      }
    }
  }

  return Array.from(tags).sort();
}

export function registerGetServices(server: McpServer) {
  server.registerTool(
    "getServices",
    {
      title: "서비스 목록 조회",
      description: "서비스 목록을 조회합니다.",
    },
    async () => {
      const swagger = await loadSwagger();
      const apiGroups = extractApiGroups(swagger);

      return {
        content: [{ type: "text", text: JSON.stringify(apiGroups, null, 2) }],
      };
    }
  );
}
