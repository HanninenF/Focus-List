import type { TextFormatter } from "@/lib/application/ports/text-formatter";

function getConfig() {
  return {
    apiKey: process.env.GEMINI_API_KEY,
    apiUrl: process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta",
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
  };
}

type GeminiResponse = { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };

export class GeminiTextFormatter implements TextFormatter {
  async formatTodoText({ text, instructions }: { text: string; instructions: string }) {
    const { apiKey, apiUrl, model } = getConfig();
    if (!apiKey) throw new Error("GEMINI_API_KEY saknas. Skapa en Gemini-nyckel och lägg den i .env.local.");
    const endpoint = `${apiUrl.replace(/\/$/, "")}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: instructions + "\n\nAnvändarens text:\n" + text }] }], generationConfig: { temperature: 0.2 } }),
      });
    } catch {
      throw new Error("Gemini kunde inte nås. Kontrollera internetanslutningen.");
    }
    if (!response.ok) {
      const details = await response.text();
      throw new Error("Gemini-anropet misslyckades (" + response.status + "): " + details.slice(0, 300));
    }
    const data = await response.json() as GeminiResponse;
    const result = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (!result) throw new Error("Gemini returnerade inget textförslag.");
    return result;
  }
}
