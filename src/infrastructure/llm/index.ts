import type { TextFormatter } from "@/src/core/ports/text-formatter";
import { GeminiTextFormatter } from "./gemini-text-formatter";
import { OllamaTextFormatter } from "./ollama-text-formatter";
import { OpenAiCompatibleTextFormatter } from "./openai-compatible-text-formatter";
import type { LlmFactoryConfig, LlmProviderConfig } from "./config";

function environmentConfig(): LlmFactoryConfig {
  const provider = process.env.LLM_PROVIDER || "openai-compatible";
  if (
    provider !== "openai-compatible" &&
    provider !== "ollama" &&
    provider !== "gemini"
  )
    throw new Error("Okänd LLM_PROVIDER: " + provider);
  return {
    provider,
    apiKey:
      provider === "gemini"
        ? process.env.GEMINI_API_KEY
        : process.env.LLM_API_KEY,
    apiUrl:
      provider === "gemini"
        ? process.env.GEMINI_API_URL
        : process.env.LLM_API_URL,
    model:
      provider === "gemini" ? process.env.GEMINI_MODEL : process.env.LLM_MODEL,
  };
}

export function createTextFormatter(
  config: LlmFactoryConfig = environmentConfig(),
): TextFormatter {
  const providerConfig: LlmProviderConfig = {
    apiKey: config.apiKey,
    apiUrl:
      config.apiUrl ||
      (config.provider === "gemini"
        ? "https://generativelanguage.googleapis.com/v1beta"
        : config.provider === "ollama"
          ? "http://127.0.0.1:11434/api/generate"
          : "https://api.openai.com/v1/chat/completions"),
    model:
      config.model ||
      (config.provider === "gemini"
        ? "gemini-2.5-flash-lite"
        : config.provider === "ollama"
          ? "llama3.2:3b"
          : "gpt-4o-mini"),
  };
  if (config.provider === "openai-compatible")
    return new OpenAiCompatibleTextFormatter(providerConfig);
  if (config.provider === "ollama")
    return new OllamaTextFormatter(providerConfig);
  return new GeminiTextFormatter(providerConfig);
}
