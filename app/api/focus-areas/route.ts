import { NextResponse } from "next/server";
import { todoRepository } from "@/src/infrastructure/database/todo-repository";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(todoRepository.getFocusAreas());
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Namn saknas" }, { status: 400 });
  try {
    const id = todoRepository.addFocusArea(name);
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Fokusområdet finns redan" }, { status: 409 });
  }
}
