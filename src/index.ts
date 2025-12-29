/**
 * MCP 서버 엔트리포인트
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createServer } from "./server.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";

async function main() {
  const server = createServer();
  registerTools(server);
  registerResources(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // 👇 이 줄이 핵심
  process.stdin.resume();
}

main().catch((err) => {
  process.stderr.write(err.stack + "\n");
  process.exit(1);
});
