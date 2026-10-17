import type { LlmApi } from "@/src/core/ports/llm-api";
import { ApiError } from "@/src/infrastructure/http/api-error";
import {
  expectRecord,
  readJson,
} from "@/src/infrastructure/http/response-validation";

const LLM_TIMEOUT_MS = 65_000;

async function requestFormattedText(text: string): Promise<string> {
  const response = await fetch("/api/llm/format", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });
  const result = expectRecord(await readJson(response));
  const textResult = typeof result.text === "string" ? result.text : "";
  const errorResult = typeof result.error === "string" ? result.error : "";
  if (!response.ok || !textResult)
    throw new ApiError(
      errorResult || "AI-formateringen misslyckades.",
      response.status,
    );
  return textResult;
}

export const llmApiClient: LlmApi = { requestFormattedText };
