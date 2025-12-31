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
      const api = swagger.paths?.[requestUrl]?.[httpMethod];

      if (!api) {
        return {
          content: [{ type: "text", text: "해당 API를 찾을 수 없습니다." }],
        };
      }

      // parameters 변환
      const parameters = (api.parameters || []).map((param: any) => ({
        name: param.name,
        in: param.in,
        required: param.required || false,
        schema: {
          type: param.schema?.type || null,
          format: param.schema?.format || null,
          enum: param.schema?.enum || null,
        },
      }));

      // requestBody 변환
      let requestBody: any = null;
      if (api.requestBody?.content) {
        const jsonContent = api.requestBody.content["application/json"];
        if (jsonContent?.schema) {
          const schema = jsonContent.schema;
          requestBody = {
            required: schema.required || [],
            type: schema.type || "object",
            properties: schema.properties || {},
          };
        }
      }

      // responses 변환 (200 응답의 schema 추출)
      let responses: any = null;
      if (api.responses?.["200"]?.content?.["application/json"]?.schema) {
        const schema = api.responses["200"].content["application/json"].schema;
        responses = {
          type: schema.type || "object",
          properties: schema.properties || {},
        };
      }

      const result: any = {};
      if (parameters.length > 0) {
        result.parameters = parameters;
      }
      if (requestBody) {
        result.requestBody = requestBody;
      }
      if (responses) {
        result.responses = responses;
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
