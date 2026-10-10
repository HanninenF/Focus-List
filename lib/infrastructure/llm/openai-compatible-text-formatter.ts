import type { TextFormatter } from "@/lib/application/ports/text-formatter";

function getConfig() {
  return {
    apiKey: process.env.LLM_API_KEY,
    apiUrl: (process.env.LLM_API_URL || "https://api.openai.com/v1/chat/completions").replace(/\/$/, ""),
    model: process.env.LLM_MODEL || "gpt-4o-mini",
  };
}

export class OpenAiCompatibleTextFormatter implements TextFormatter {
  async formatTodoText({ text, instructions }: { text: string; instructions: string }) {
    const { apiKey, apiUrl, model } = getConfig();
    if (!apiKey) throw new Error("LLM_API_KEY saknas. Konfigurera LLM_API_KEY innan AI-formatering används.");

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: "system", content: "Du skriver tydlig och korrekt svensk Markdown." },
          { role: "user", content: instructions + "\n\nAnvändarens text:\n" + text },
        ],
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error("LLM-anropet misslyckades (" + response.status + "): " + details.slice(0, 300));
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const result = data.choices?.[0]?.message?.content?.trim();
    if (!result) throw new Error("LLM-tjänsten returnerade inget textförslag.");
    return result;
  }
}
