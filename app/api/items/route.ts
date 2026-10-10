import { NextResponse } from "next/server";
import { addItem, getItems, removeItem, setCompleted, setHasCheckbox, updateTitle } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const focusId = Number(url.searchParams.get("focusId"));
  return NextResponse.json(getItems(Number.isFinite(focusId) && focusId > 0 ? focusId : undefined));
}

export async function POST(request: Request) {
  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "Titel saknas" }, { status: 400 });
  const parentId = body.parentId === null || body.parentId === undefined ? null : Number(body.parentId);
  const focusId = Number(body.focusId);
  if (!Number.isFinite(focusId)) return NextResponse.json({ error: "Fokusområde saknas" }, { status: 400 });
  const id = addItem(title, Number.isFinite(parentId) ? parentId : null, focusId, body.hasCheckbox !== false);
  return NextResponse.json({ id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const id = Number(body.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Ogiltigt id" }, { status: 400 });
  if (typeof body.completed === "boolean") setCompleted(id, body.completed);
  if (typeof body.title === "string" && body.title.trim()) updateTitle(id, body.title);
  if (typeof body.hasCheckbox === "boolean") setHasCheckbox(id, body.hasCheckbox);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const id = Number(body.id);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Ogiltigt id" }, { status: 400 });
  removeItem(id);
  return NextResponse.json({ ok: true });
}
