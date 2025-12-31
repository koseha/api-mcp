/**
 * OpenAPI $ref 참조 해결 유틸리티
 */

import type { OpenAPISpec } from "./types.js";

/**
 * $ref 경로를 실제 객체 경로로 변환
 * @example "#/components/schemas/Pet" -> swagger.components.schemas.Pet
 */
function resolveRefPath(ref: string, swagger: OpenAPISpec): any {
  if (!ref.startsWith("#/")) {
    return null; // 외부 참조는 지원하지 않음
  }

  const path = ref.substring(2).split("/"); // "#/components/schemas/Pet" -> ["components", "schemas", "Pet"]
  let result: any = swagger;

  for (const key of path) {
    if (result && typeof result === "object" && key in result) {
      result = result[key];
    } else {
      return null;
    }
  }

  return result;
}

/**
 * 스키마 객체의 모든 $ref를 재귀적으로 해결
 * @param schema - 해결할 스키마 객체
 * @param swagger - 전체 OpenAPI 스펙
 * @param visited - 순환 참조 방지를 위한 방문한 $ref 경로 Set
 */
export function resolveSchema(
  schema: any,
  swagger: OpenAPISpec,
  visited: Set<string> = new Set()
): any {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    return schema;
  }

  // $ref가 있으면 해결
  if (schema.$ref) {
    const refPath = schema.$ref;

    // 순환 참조 방지
    if (visited.has(refPath)) {
      return { $ref: refPath, _circular: true };
    }

    visited.add(refPath);
    const resolved = resolveRefPath(refPath, swagger);

    if (resolved) {
      // 해결된 스키마를 재귀적으로 처리 (중첩된 $ref도 해결)
      const resolvedSchema = resolveSchema(resolved, swagger, visited);
      visited.delete(refPath);
      return resolvedSchema;
    }

    visited.delete(refPath);
    return schema;
  }

  // 배열인 경우 items 처리
  if (schema.type === "array" && schema.items) {
    return {
      ...schema,
      items: resolveSchema(schema.items, swagger, visited),
    };
  }

  // 객체인 경우 properties와 allOf, anyOf, oneOf 처리
  if (
    schema.type === "object" ||
    schema.properties ||
    schema.allOf ||
    schema.anyOf ||
    schema.oneOf
  ) {
    const resolved: any = { ...schema };

    if (schema.properties) {
      resolved.properties = {};
      for (const [key, value] of Object.entries(schema.properties)) {
        resolved.properties[key] = resolveSchema(value, swagger, visited);
      }
    }

    if (schema.allOf) {
      resolved.allOf = schema.allOf.map((item: any) =>
        resolveSchema(item, swagger, visited)
      );
    }

    if (schema.anyOf) {
      resolved.anyOf = schema.anyOf.map((item: any) =>
        resolveSchema(item, swagger, visited)
      );
    }

    if (schema.oneOf) {
      resolved.oneOf = schema.oneOf.map((item: any) =>
        resolveSchema(item, swagger, visited)
      );
    }

    return resolved;
  }

  return schema;
}


