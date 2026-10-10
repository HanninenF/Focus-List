export async function formatTextWithAi(text: string) {
  const response = await fetch("/api/llm/format", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const result = await response.json() as { text?: string; error?: string };
  if (!response.ok || !result.text) throw new Error(result.error || "AI-formateringen misslyckades.");
  return result.text;
}
