import { NextResponse } from "next/server";
import { formatTodoText } from "@/lib/application/format-todo-text";
import { createTextFormatter } from "@/lib/infrastructure/llm";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { text?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "Text saknas" }, { status: 400 });
  if (text.length > 12000) return NextResponse.json({ error: "Texten är för lång för AI-formatering." }, { status: 413 });

  try {
    const formattedText = await formatTodoText(text, createTextFormatter());
    return NextResponse.json({ text: formattedText });
  } catch (error) {
    const message = error instanceof Error ? error.message : "LLM-tjänsten kunde inte användas.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
