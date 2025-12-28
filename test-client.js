import { spawn } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import * as readline from "readline";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// MCP 서버 프로세스 시작
const serverPath = join(__dirname, "dist/index.js");
const server = spawn("node", [serverPath], {
    stdio: ["pipe", "pipe", "pipe"],
});
let requestId = 0;
let initialized = false;
// Readline 인터페이스 생성
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
});
// JSON-RPC 요청 보내기
function sendRequest(method, params) {
    const id = ++requestId;
    const request = {
        jsonrpc: "2.0",
        id,
        method,
        params: params || {},
    };
    const message = JSON.stringify(request) + "\n";
    server.stdin?.write(message);
    return id;
}
// 응답 수신 처리
let buffer = "";
server.stdout?.on("data", (data) => {
    buffer += data.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
        if (line.trim()) {
            try {
                const response = JSON.parse(line);
                if (response.id) {
                    // 요청에 대한 응답
                    if (response.result) {
                        console.log("\n✅ 응답:");
                        console.log(JSON.stringify(response.result, null, 2));
                    }
                    else if (response.error) {
                        console.log("\n❌ 오류:");
                        console.log(JSON.stringify(response.error, null, 2));
                    }
                    console.log("");
                    rl.prompt();
                }
            }
            catch (e) {
                // 파싱 오류는 무시 (서버 로그 등)
            }
        }
    }
});
server.stderr?.on("data", (data) => {
    const message = data.toString().trim();
    if (message && !message.includes("MCP server is running")) {
        console.error("서버:", message);
    }
});
// 초기화
async function initialize() {
    console.log("🔄 서버 초기화 중...\n");
    sendRequest("initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {
            tools: {},
            resources: {},
        },
        clientInfo: {
            name: "test-client",
            version: "1.0.0",
        },
    });
    // 초기화 완료 알림
    setTimeout(() => {
        sendRequest("notifications/initialized");
        initialized = true;
        showHelp();
        rl.prompt();
    }, 500);
}
// 도움말 표시
function showHelp() {
    console.log("\n" + "=".repeat(60));
    console.log("MCP 서버 테스트 클라이언트");
    console.log("=".repeat(60));
    console.log("\n사용 가능한 명령:");
    console.log("  tools/list                    - 도구 목록 조회");
    console.log("  tools/call add 5 3            - add 도구 호출 (5 + 3)");
    console.log("  resources/list                - 리소스 목록 조회");
    console.log("  resources/read greeting://World  - 리소스 읽기");
    console.log("  help                          - 도움말");
    console.log("  exit                          - 종료");
    console.log("\n" + "=".repeat(60) + "\n");
}
// 명령 처리
async function handleCommand(input) {
    const trimmed = input.trim();
    if (!trimmed) {
        rl.prompt();
        return;
    }
    if (trimmed === "exit") {
        console.log("종료합니다...");
        server.kill();
        rl.close();
        process.exit(0);
        return;
    }
    if (trimmed === "help") {
        showHelp();
        rl.prompt();
        return;
    }
    if (!initialized) {
        console.log("⏳ 서버가 아직 초기화되지 않았습니다. 잠시만 기다려주세요...\n");
        rl.prompt();
        return;
    }
    const parts = trimmed.split(/\s+/);
    const command = parts[0] + (parts[1] ? `/${parts[1]}` : "");
    try {
        if (command === "tools/list") {
            console.log("\n📤 요청: tools/list");
            sendRequest("tools/list");
        }
        else if (command === "tools/call") {
            if (parts.length < 4) {
                console.log("❌ 사용법: tools/call <도구이름> <인자1> <인자2>");
                console.log("   예: tools/call add 5 3\n");
                rl.prompt();
                return;
            }
            const toolName = parts[2];
            const args = {};
            if (toolName === "add") {
                args.a = parseFloat(parts[3]);
                args.b = parseFloat(parts[4] || "0");
                if (isNaN(args.a) || isNaN(args.b)) {
                    console.log("❌ 숫자를 입력해주세요.\n");
                    rl.prompt();
                    return;
                }
            }
            console.log(`\n📤 요청: tools/call (${toolName})`);
            console.log(`   인자:`, JSON.stringify(args, null, 2));
            sendRequest("tools/call", {
                name: toolName,
                arguments: args,
            });
        }
        else if (command === "resources/list") {
            console.log("\n📤 요청: resources/list");
            sendRequest("resources/list");
        }
        else if (command === "resources/read") {
            if (parts.length < 3) {
                console.log("❌ 사용법: resources/read <URI>");
                console.log("   예: resources/read greeting://World\n");
                rl.prompt();
                return;
            }
            const uri = parts.slice(2).join(" ");
            console.log(`\n📤 요청: resources/read (${uri})`);
            sendRequest("resources/read", { uri });
        }
        else {
            console.log(`\n❌ 알 수 없는 명령: ${trimmed}`);
            console.log("   'help'를 입력하여 사용 가능한 명령을 확인하세요.\n");
            rl.prompt();
        }
    }
    catch (error) {
        console.log(`\n❌ 오류: ${error.message}\n`);
        rl.prompt();
    }
}
// 시작
console.log("MCP 서버 테스트 클라이언트 시작...\n");
initialize();
rl.on("line", handleCommand);
rl.on("close", () => {
    console.log("\n종료합니다...");
    server.kill();
    process.exit(0);
});
// 프로세스 종료 처리
process.on("SIGINT", () => {
    console.log("\n\n종료합니다...");
    server.kill();
    rl.close();
    process.exit(0);
});
