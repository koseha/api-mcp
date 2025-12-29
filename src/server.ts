/**
 * MCPServer 생성
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function createServer() {
  return new McpServer({
    name: "api-mcp",
    version: "0.0.2",
  });
}
