/**
 * OpenAPI 스펙 관련 타입 정의
 */

export interface OpenAPISpec {
  openapi: string;
  info: any;
  paths: Record<string, Record<string, OpenAPIOperation>>;
  components?: {
    schemas?: Record<string, any>;
    requestBodies?: Record<string, any>;
    responses?: Record<string, any>;
    parameters?: Record<string, any>;
  };
}

export interface OpenAPIOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
  responses?: Record<string, OpenAPIResponse>;
  security?: any[];
}

export interface OpenAPIParameter {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  description?: string;
  required?: boolean;
  schema?: any;
}

export interface OpenAPIRequestBody {
  description?: string;
  required?: boolean;
  content: Record<string, { schema?: any }>;
}

export interface OpenAPIResponse {
  description?: string;
  content?: Record<string, { schema?: any }>;
}

export interface ResolvedParameter {
  name: string;
  in: string;
  required: boolean;
  description: string | null;
  schema: ResolvedSchema | null;
}

export interface ResolvedSchema {
  type: string | null;
  format?: string | null;
  enum?: any[] | null;
  properties?: Record<string, any> | null;
  items?: any | null;
  required?: string[] | null;
}

export interface ResolvedRequestBody {
  required: string[];
  type: string;
  properties: Record<string, any>;
  description: string | null;
}

export interface ResolvedResponse {
  type: string;
  properties?: Record<string, any>;
  items?: any;
}

export interface ApiDetailResult {
  parameters?: ResolvedParameter[];
  requestBody?: ResolvedRequestBody;
  responses?: ResolvedResponse;
}



