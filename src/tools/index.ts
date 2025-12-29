/**
 * 모든 Tool 등록
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerAddTool } from "./add.tool.js";
import { registerGetApiList } from "./getApiList.tool.js";

export function registerTools(server: McpServer) {
  registerAddTool(server);
  registerGetApiList(server);
}
