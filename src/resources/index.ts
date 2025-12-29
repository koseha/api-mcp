/**
 * 모든 Resource 등록
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerGreetingResource } from "./greeting.resource.js";

export function registerResources(server: McpServer) {
  registerGreetingResource(server);
}
