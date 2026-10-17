import type { LlmApi } from "@/src/core/ports/llm-api";

export function createAiFormattingService(api: LlmApi) {
  return {
    formatTextWithAi: (text: string): Promise<string> =>
      api.requestFormattedText(text),
  };
}

export type AiFormattingService = ReturnType<typeof createAiFormattingService>;
