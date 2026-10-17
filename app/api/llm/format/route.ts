import { NextResponse } from "next/server";
import { readRequestObject } from "@/app/api/request-body";
import { formatTodoText } from "@/src/features/ai-formatting/format-todo-text";
import { getTextFormatter } from "@/src/application/server-llm-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readRequestObject(request);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text)
    return NextResponse.json({ error: "Text saknas" }, { status: 400 });
  if (text.length > 12000)
    return NextResponse.json(
      { error: "Texten är för lång för AI-formatering." },
      { status: 413 },
    );

  try {
    const formattedText = await formatTodoText(text, getTextFormatter());
    return NextResponse.json({ text: formattedText });
  } catch (error) {
    console.error("LLM formatting failed", error);
    return NextResponse.json(
      { error: "AI-formateringen kunde inte genomföras." },
      { status: 502 },
    );
  }
}
