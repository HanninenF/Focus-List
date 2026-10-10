import type { TextFormatter } from "@/lib/application/ports/text-formatter";
import { OpenAiCompatibleTextFormatter } from "./openai-compatible-text-formatter";
import { OllamaTextFormatter } from "./ollama-text-formatter";
import { GeminiTextFormatter } from "./gemini-text-formatter";

export function createTextFormatter(): TextFormatter {
  const provider = process.env.LLM_PROVIDER || "openai-compatible";
  if (provider === "openai-compatible") return new OpenAiCompatibleTextFormatter();
  if (provider === "ollama") return new OllamaTextFormatter();
  if (provider === "gemini") return new GeminiTextFormatter();
  throw new Error("Okänd LLM_PROVIDER: " + provider);
}
