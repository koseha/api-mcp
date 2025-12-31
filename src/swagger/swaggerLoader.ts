/**
 * openapi.json HTTP 요청으로 읽기 + TTL 캐시
 */
const OPENAPI_URL = process.env.OPENAPI_URL!;

export async function loadSwagger() {
  const openapiUrl = OPENAPI_URL;

  try {
    const response = await fetch(openapiUrl);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText} - ${openapiUrl}`
      );
    }

    const fileContent = await response.text();
    return JSON.parse(fileContent);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OpenAPI 문서를 불러오는 중 오류 발생: ${error.message}`);
    }
    throw error;
  }
}
