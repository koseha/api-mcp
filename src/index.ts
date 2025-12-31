/**
 * MCP 서버 엔트리포인트
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createServer } from "./server.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";

async function main() {
  // OPENAPI_URL 환경 변수 검증
  if (!process.env.OPENAPI_URL) {
    const error = new Error(
      "OPENAPI_URL 환경 변수가 설정되지 않았습니다. 서버를 시작할 수 없습니다.\n" +
        "환경 변수를 설정한 후 다시 시도해주세요.\n" +
        "예: export OPENAPI_URL=https://api.example.com/openapi.json"
    );
    process.stderr.write(error.message + "\n");
    process.exit(1);
  }

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
