/**
 * 모든 Tool 등록
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerGetApiList } from "./getApiList.tool.js";
import { registerGetApiDetail } from "./getApiDetail.tool.js";

export function registerTools(server: McpServer) {
  registerGetApiList(server);
  registerGetApiDetail(server);
}
