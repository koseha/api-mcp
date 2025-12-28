# API MCP 서버

Model Context Protocol (MCP) 서버입니다. 다른 프로젝트나 MCP 클라이언트에서 도구와 리소스를 제공합니다.

## 기능

- **도구 (Tools)**: `add` - 두 숫자를 더하는 도구
- **리소스 (Resources)**: `greeting://{name}` - 동적 인사말 생성 리소스

## 다른 프로젝트에서 사용하기

### 방법 1: NPM 패키지로 배포하기

#### 1단계: 패키지 빌드

```bash
npm run build
```

#### 2단계: NPM에 배포 (선택사항)

```bash
npm publish
```

또는 로컬 레지스트리나 private registry 사용

#### 3단계: 다른 프로젝트에서 설치

```bash
cd ../다른-프로젝트
npm install api-mcp
```

#### 4단계: 실행 파일로 사용

다른 프로젝트에서 직접 실행:

```javascript
import { spawn } from 'child_process';
import { join } from 'path';

const mcpServer = spawn('npx', ['api-mcp'], {
  stdio: ['pipe', 'pipe', 'pipe']
});
```

### 방법 2: 로컬 패키지로 사용 (개발 중)

#### 1단계: npm link 설정

현재 프로젝트에서:

```bash
npm link
```

#### 2단계: 다른 프로젝트에서 링크

다른 프로젝트에서:

```bash
cd ../다른-프로젝트
npm link api-mcp
```

이제 다른 프로젝트에서 `npx api-mcp` 명령어를 사용할 수 있습니다.

### 방법 3: 상대 경로로 사용

다른 프로젝트의 `package.json`에 추가:

```json
{
  "dependencies": {
    "api-mcp": "file:../api-mcp"
  }
}
```

그런 다음:

```bash
npm install
```

### 방법 4: MCP 클라이언트에서 사용 (Claude Desktop 등)

#### Claude Desktop 설정

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) 또는 
`%APPDATA%\Claude\claude_desktop_config.json` (Windows) 파일에 추가:

```json
{
  "mcpServers": {
    "api-mcp": {
      "command": "node",
      "args": ["C:/Users/saems/Desktop/project/mcps/api-mcp/dist/index.js"]
    }
  }
}
```

또는 글로벌 설치 후:

```json
{
  "mcpServers": {
    "api-mcp": {
      "command": "npx",
      "args": ["-y", "api-mcp"]
    }
  }
}
```

### 방법 5: Node.js 프로젝트에서 직접 사용

다른 Node.js 프로젝트에서:

```javascript
// client.js
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MCP 서버 경로 (상대 또는 절대 경로)
const serverPath = join(__dirname, '../api-mcp/dist/index.js');

const mcpServer = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// JSON-RPC 요청 보내기
function sendRequest(method, params) {
  const request = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params: params || {}
  };
  mcpServer.stdin?.write(JSON.stringify(request) + '\n');
}

// 응답 수신
let buffer = '';
mcpServer.stdout?.on('data', (data) => {
  buffer += data.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';
  
  for (const line of lines) {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        console.log('응답:', response);
      } catch (e) {
        // 파싱 오류 무시
      }
    }
  }
});

// 초기화
sendRequest('initialize', {
  protocolVersion: '2024-11-05',
  capabilities: {
    tools: {},
    resources: {}
  },
  clientInfo: {
    name: 'my-client',
    version: '1.0.0'
  }
});

// 도구 호출 예시
setTimeout(() => {
  sendRequest('tools/call', {
    name: 'add',
    arguments: { a: 5, b: 3 }
  });
}, 1000);
```

## 개발

### 빌드

```bash
npm run build
```

### 실행

```bash
npm start
```

### 테스트 클라이언트 실행

```bash
node test-client.js
```

## 프로젝트 구조

```
api-mcp/
├── src/
│   ├── index.ts          # MCP 서버 메인 파일
│   └── tools/
│       └── listEndpoints.ts
├── dist/
│   └── index.js          # 빌드된 파일
├── package.json
└── README.md
```

## 의존성

- `@modelcontextprotocol/sdk`: MCP SDK
- `zod`: 스키마 검증
- `typescript`: 타입스크립트 컴파일러

## 참고 자료

- [MCP 공식 문서](https://modelcontextprotocol.io)
- [MCP SDK GitHub](https://github.com/modelcontextprotocol/typescript-sdk)


