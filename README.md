# API MCP 서버

Swagger/OpenAPI 스펙 기반의 Model Context Protocol (MCP) 서버입니다. OpenAPI 문서를 통해 API 목록과 상세 정보를 조회할 수 있는 도구를 제공합니다.

## 기능

### 도구 (Tools)

- **`getApiList`** - API 목록 조회

  - OpenAPI 스펙에서 모든 API 엔드포인트 목록을 조회합니다.
  - 반환 형식: 각 경로별 HTTP 메서드와 `tags`, `operationId`, `summary` 정보

- **`getApiDetail`** - API 상세 조회
  - 특정 API의 상세 정보를 조회합니다.
  - 파라미터: `requestUrl` (string), `httpMethod` (get|post|put|delete|patch)
  - 반환 형식: `parameters`, `requestBody`, `responses` 정보

### 리소스 (Resources)

- **`greeting://{name}`** - 동적 인사말 생성 리소스

## 설치

### NPM 패키지로 설치

```bash
npm install @koseha/api-mcp
```

또는

```bash
npm install @koseha/api-mcp@latest
```

## 사용 방법

### 방법 1: Cursor IDE 에서 사용

Cursor 설정 파일에 추가:

```
{
  "mcpServers": {
    "api-mcp": {
      "command": "node",
      "args": ["./node_modules/@koseha/api-mcp/dist/index.js"]
    }
  }
}

```

### 방법 2: Claude Desktop에서 사용

Claude Desktop 설정 파일에 추가:

**macOS:**

```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**

```
%APPDATA%\Claude\claude_desktop_config.json
```

설정 예시:

```json
{
  "mcpServers": {
    "api-mcp": {
      "command": "npx",
      "args": ["-y", "@koseha/api-mcp"]
    }
  }
}
```

또는 로컬 경로 사용:

```json
{
  "mcpServers": {
    "api-mcp": {
      "command": "node",
      "args": ["/path/to/api-mcp/dist/index.js"]
    }
  }
}
```

### 방법 3: Node.js 프로젝트에서 직접 사용

```javascript
import { spawn } from "child_process";

const mcpServer = spawn("npx", ["-y", "@koseha/api-mcp"], {
  stdio: ["pipe", "pipe", "pipe"],
});

// JSON-RPC 요청 보내기
function sendRequest(method, params) {
  const request = {
    jsonrpc: "2.0",
    id: Date.now(),
    method,
    params: params || {},
  };
  mcpServer.stdin?.write(JSON.stringify(request) + "\n");
}

// API 목록 조회
sendRequest("tools/call", {
  name: "getApiList",
  arguments: {},
});

// API 상세 조회
sendRequest("tools/call", {
  name: "getApiDetail",
  arguments: {
    requestUrl: "/pet/{petId}/uploadImage",
    httpMethod: "post",
  },
});
```

### 방법 4: 로컬 개발 중 사용

#### npm link 사용

현재 프로젝트에서:

```bash
npm link
```

다른 프로젝트에서:

```bash
npm link @koseha/api-mcp
```

#### 상대 경로 사용

다른 프로젝트의 `package.json`에 추가:

```json
{
  "dependencies": {
    "@koseha/api-mcp": "file:../api-mcp"
  }
}
```

## 개발

### 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
npm install
```

### 빌드

```bash
npm run build
```

### 실행

```bash
npm start
```

또는 개발 모드:

```bash
npm run dev
```

## 프로젝트 구조

```
api-mcp/
├── src/
│   ├── index.ts              # MCP 서버 엔트리포인트
│   ├── server.ts             # 서버 생성 로직
│   ├── tools/                # 도구 모듈
│   │   ├── index.ts
│   │   ├── getApiList.tool.ts    # API 목록 조회 도구
│   │   └── getApiDetail.tool.ts  # API 상세 조회 도구
│   ├── resources/            # 리소스 모듈
│   │   ├── index.ts
│   │   └── greeting.resource.ts
│   └── swagger/              # Swagger 로더
│       └── swaggerLoader.ts
├── dist/                     # 빌드된 파일
├── openapi.json             # OpenAPI 스펙 파일
├── package.json
├── tsconfig.json
└── README.md
```

## OpenAPI 스펙 파일

프로젝트 루트의 `openapi.json` 파일을 수정하여 사용할 API 스펙을 설정할 수 있습니다. 기본적으로 5분간 캐시되며, 파일 변경 시 자동으로 다시 로드됩니다.

## 의존성

### 프로덕션 의존성

- `@modelcontextprotocol/sdk`: MCP SDK (^1.25.1)
- `zod`: 스키마 검증 (^4.2.1)

### 개발 의존성

- `typescript`: 타입스크립트 컴파일러 (^5.9.3)
- `@types/node`: Node.js 타입 정의 (^25.0.3)
- `ts-node`: TypeScript 실행 도구 (^10.9.2)

## 버전

현재 버전: **0.0.7**

## 라이선스

ISC

## 참고 자료

- [MCP 공식 문서](https://modelcontextprotocol.io)
- [MCP SDK GitHub](https://github.com/modelcontextprotocol/typescript-sdk)
- [OpenAPI 스펙](https://swagger.io/specification/)

## 기여

이슈나 풀 리퀘스트는 [GitHub 저장소](https://github.com/koseha/api-mcp)에서 환영합니다.
