import type { TextFormatter } from "@/src/core/ports/text-formatter";
import type { LlmProviderConfig } from "./config";
type GeminiResponse = {
  candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
};
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isGeminiResponse(value: unknown): value is GeminiResponse {
  if (!isRecord(value) || !Array.isArray(value.candidates)) return false;
  const candidate = value.candidates[0];
  if (!isRecord(candidate) || !isRecord(candidate.content)) return false;
  if (!Array.isArray(candidate.content.parts)) return false;
  return candidate.content.parts.every(
    (part) => isRecord(part) && typeof part.text === "string",
  );
}
const LLM_TIMEOUT_MS = 60_000;
export class GeminiTextFormatter implements TextFormatter {
  constructor(private readonly config: LlmProviderConfig) {}

  async formatTodoText({
    text,
    instructions,
  }: {
    text: string;
    instructions: string;
  }) {
    const { apiKey, apiUrl, model } = this.config;
    if (!apiKey)
      throw new Error(
        "GEMINI_API_KEY saknas. Skapa en Gemini-nyckel och lägg den i .env.local.",
      );
    const endpoint = `${apiUrl.replace(/\/$/, "")}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    let response: Response;
    try {
      response = await fetch(endpoint, {
        signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: instructions + "\n\nAnvändarens text:\n" + text },
              ],
            },
          ],
          generationConfig: { temperature: 0.2 },
        }),
      });
    } catch {
      throw new Error(
        "Gemini kunde inte nås. Kontrollera internetanslutningen.",
      );
    }
    if (!response.ok)
      throw new Error(
        "Gemini-anropet misslyckades (" +
          response.status +
          "): " +
          (await response.text()).slice(0, 300),
      );
    const data: unknown = await response.json();
    if (!isGeminiResponse(data))
      throw new Error("Gemini returnerade ett ogiltigt svar.");
    const result = data.candidates?.[0]?.content?.parts
      .map((part) => part.text)
      .join("")
      .trim();
    if (!result) throw new Error("Gemini returnerade inget textförslag.");
    return result;
  }
}
