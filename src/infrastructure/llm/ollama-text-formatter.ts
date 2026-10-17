import type { TextFormatter } from "@/src/core/ports/text-formatter";
import type { LlmProviderConfig } from "./config";
type OllamaResponse = { response: string };
function isOllamaResponse(value: unknown): value is OllamaResponse {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const response = Reflect.get(value, "response");
  return typeof response === "string";
}
const LLM_TIMEOUT_MS = 60_000;
export class OllamaTextFormatter implements TextFormatter {
  constructor(private readonly config: LlmProviderConfig) {}

  async formatTodoText({
    text,
    instructions,
  }: {
    text: string;
    instructions: string;
  }) {
    const { apiUrl, model } = this.config;
    let response: Response;
    try {
      response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          stream: false,
          prompt: instructions + "\n\nAnvändarens text:\n" + text,
          options: { temperature: 0.2 },
        }),
      });
    } catch {
      throw new Error(
        "Ollama kunde inte nås. Starta Ollama och kontrollera att modellen finns lokalt.",
      );
    }
    if (!response.ok)
      throw new Error(
        "Ollama-anropet misslyckades (" +
          response.status +
          "): " +
          (await response.text()).slice(0, 300),
      );
    const data: unknown = await response.json();
    if (!isOllamaResponse(data))
      throw new Error("Ollama returnerade ett ogiltigt svar.");
    const result = data.response?.trim();
    if (!result) throw new Error("Ollama returnerade inget textförslag.");
    return result;
  }
}
