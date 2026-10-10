import type { TextFormatter } from "@/lib/application/ports/text-formatter";

function getConfig() {
  return {
    apiUrl: (process.env.LLM_API_URL || "http://127.0.0.1:11434/api/generate").replace(/\/$/, ""),
    model: process.env.LLM_MODEL || "llama3.2:3b",
  };
}

type OllamaResponse = { response?: string };

export class OllamaTextFormatter implements TextFormatter {
  async formatTodoText({ text, instructions }: { text: string; instructions: string }) {
    const { apiUrl, model } = getConfig();
    let response: Response;
    try {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, stream: false, prompt: instructions + "\n\nAnvändarens text:\n" + text, options: { temperature: 0.2 } }),
      });
    } catch {
      throw new Error("Ollama kunde inte nås. Starta Ollama och kontrollera att modellen finns lokalt.");
    }
    if (!response.ok) {
      const details = await response.text();
      throw new Error("Ollama-anropet misslyckades (" + response.status + "): " + details.slice(0, 300));
    }
    const data = await response.json() as OllamaResponse;
    const result = data.response?.trim();
    if (!result) throw new Error("Ollama returnerade inget textförslag.");
    return result;
  }
}
