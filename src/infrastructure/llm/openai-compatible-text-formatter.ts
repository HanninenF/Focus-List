import type { TextFormatter } from "@/src/core/ports/text-formatter";
import type { LlmProviderConfig } from "./config";
type OpenAiResponse = {
  choices: Array<{ message: { content: string } }>;
};
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isOpenAiResponse(value: unknown): value is OpenAiResponse {
  if (!isRecord(value) || !Array.isArray(value.choices)) return false;
  const choice = value.choices[0];
  if (!isRecord(choice) || !isRecord(choice.message)) return false;
  return typeof choice.message.content === "string";
}
const LLM_TIMEOUT_MS = 60_000;
export class OpenAiCompatibleTextFormatter implements TextFormatter {
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
        "LLM_API_KEY saknas. Konfigurera LLM_API_KEY innan AI-formatering används.",
      );
    let response: Response;
    try {
      response = await fetch(apiUrl, {
        signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiKey,
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content: "Du skriver tydlig och korrekt svensk Markdown.",
            },
            {
              role: "user",
              content: instructions + "\n\nAnvändarens text:\n" + text,
            },
          ],
        }),
      });
    } catch {
      throw new Error("LLM-tjänsten kunde inte nås. Kontrollera anslutningen.");
    }
    if (!response.ok)
      throw new Error(
        "LLM-anropet misslyckades (" +
          response.status +
          "): " +
          (await response.text()).slice(0, 300),
      );
    const data: unknown = await response.json();
    if (!isOpenAiResponse(data))
      throw new Error("LLM-tjänsten returnerade ett ogiltigt svar.");
    const result = data.choices?.[0]?.message?.content?.trim();
    if (!result) throw new Error("LLM-tjänsten returnerade inget textförslag.");
    return result;
  }
}
