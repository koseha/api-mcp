/**
 * OpenAPI Operation을 변환하는 유틸리티
 */

import type {
  OpenAPISpec,
  OpenAPIOperation,
  ResolvedParameter,
  ResolvedRequestBody,
  ResolvedResponse,
  ResolvedSchema,
  ApiDetailResult,
} from "./types.js";
import { resolveSchema } from "./schemaResolver.js";

/**
 * 스키마를 간소화된 형태로 변환
 */
function transformSchema(schema: any): ResolvedSchema | null {
  if (!schema) return null;

  return {
    type: schema.type || null,
    format: schema.format || null,
    enum: schema.enum || null,
    properties: schema.properties || null,
    items: schema.items || null,
    required: schema.required || null,
  };
}

/**
 * Parameters를 변환
 */
function transformParameters(
  parameters: any[] | undefined,
  swagger: OpenAPISpec
): ResolvedParameter[] {
  if (!parameters || !Array.isArray(parameters)) {
    return [];
  }

  return parameters.map((param) => {
    let resolvedSchema: any = null;

    if (param.schema) {
      resolvedSchema = resolveSchema(param.schema, swagger);
    }

    return {
      name: param.name,
      in: param.in,
      required: param.required || false,
      description: param.description || null,
      schema: transformSchema(resolvedSchema),
    };
  });
}

/**
 * RequestBody를 변환
 */
function transformRequestBody(
  requestBody: any,
  swagger: OpenAPISpec
): ResolvedRequestBody | null {
  if (!requestBody?.content) {
    return null;
  }

  const jsonContent = requestBody.content["application/json"];
  if (!jsonContent?.schema) {
    return null;
  }

  const resolvedSchema = resolveSchema(jsonContent.schema, swagger);

  return {
    required: resolvedSchema.required || [],
    type: resolvedSchema.type || "object",
    properties: resolvedSchema.properties || {},
    description: requestBody.description || null,
  };
}

/**
 * Response를 변환 (200 응답 우선)
 */
function transformResponse(
  responses: Record<string, any> | undefined,
  swagger: OpenAPISpec
): ResolvedResponse | null {
  if (!responses?.["200"]?.content?.["application/json"]?.schema) {
    return null;
  }

  const schema = responses["200"].content["application/json"].schema;
  const resolvedSchema = resolveSchema(schema, swagger);

  return {
    type: resolvedSchema.type || "object",
    properties: resolvedSchema.properties || undefined,
    items: resolvedSchema.items || undefined,
  };
}

/**
 * OpenAPI Operation을 API 상세 정보로 변환
 */
export function transformApiDetail(
  operation: OpenAPIOperation,
  swagger: OpenAPISpec
): ApiDetailResult {
  const result: ApiDetailResult = {};

  // Parameters 변환
  const parameters = transformParameters(operation.parameters, swagger);
  if (parameters.length > 0) {
    result.parameters = parameters;
  }

  // RequestBody 변환
  const requestBody = transformRequestBody(operation.requestBody, swagger);
  if (requestBody) {
    result.requestBody = requestBody;
  }

  // Response 변환
  const responses = transformResponse(operation.responses, swagger);
  if (responses) {
    result.responses = responses;
  }

  return result;
}
