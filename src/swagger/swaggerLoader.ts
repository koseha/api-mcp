/**
 * openapi.json 파일 읽기 + TTL 캐시
 */
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let cache: any = null;
let cachedAt = 0;
const TTL = 5 * 60 * 1000;

export async function loadSwagger() {
  if (cache && Date.now() - cachedAt < TTL) {
    return cache;
  }

  const openapiPath = join(__dirname, "../../openapi.json");
  const fileContent = await readFile(openapiPath, "utf-8");
  cache = JSON.parse(fileContent);
  cachedAt = Date.now();
  return cache;
}
