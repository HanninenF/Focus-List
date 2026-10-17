import { NextResponse } from "next/server";
import {
  isPositiveInteger,
  readRequestObject,
  readPositiveInteger,
} from "@/app/api/request-body";
import { todoRepository } from "@/src/application/server-data-services";
import {
  addTodo,
  deleteTodo,
  isValidTodoUpdate,
  listItems,
  isValidFocusId,
  updateTodo,
  updateTodos,
} from "@/src/application/todos/todo-application-service";

export const runtime = "nodejs";

export function GET(request: Request) {
  const url = new URL(request.url);
  const rawFocusId = url.searchParams.get("focusId");
  if (rawFocusId !== null) {
    const focusId = Number(rawFocusId);
    if (!isValidFocusId(focusId))
      return NextResponse.json(
        { error: "Ogiltigt fokusområde" },
        { status: 400 },
      );
    return NextResponse.json(listItems(todoRepository, focusId));
  }
  return NextResponse.json(listItems(todoRepository));
}

export async function POST(request: Request) {
  const body = await readRequestObject(request);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const hasParentId = body?.parentId !== null && body?.parentId !== undefined;
  const parentId = hasParentId ? readPositiveInteger(body?.parentId) : null;
  const focusId = readPositiveInteger(body?.focusId) ?? 0;
  if (hasParentId && parentId === null)
    return NextResponse.json({ error: "Ogiltigt parent-id" }, { status: 400 });
  const hasCheckbox = body?.hasCheckbox === undefined ? true : body.hasCheckbox;
  if (typeof hasCheckbox !== "boolean")
    return NextResponse.json(
      { error: "hasCheckbox måste vara en boolean" },
      { status: 400 },
    );
  const result = addTodo(todoRepository, title, parentId, focusId, hasCheckbox);
  if (!result.ok) {
    const status =
      result.reason === "focus-not-found" ||
      result.reason === "parent-not-found"
        ? 404
        : 400;
    const message =
      result.reason === "invalid-title"
        ? "Titel saknas"
        : result.reason === "invalid-parent"
          ? "Ogiltigt parent-id"
          : result.reason === "invalid-focus"
            ? "Fokusområde saknas"
            : result.reason;
    return NextResponse.json({ error: message }, { status });
  }
  return NextResponse.json({ id: result.id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await readRequestObject(request);
  const id = readPositiveInteger(body?.id);
  if (Array.isArray(body?.ids) && typeof body?.completed === "boolean") {
    const ids: number[] = [];
    for (const value of body.ids) {
      if (!isPositiveInteger(value))
        return NextResponse.json({ error: "Ogiltigt id" }, { status: 400 });
      ids.push(value);
    }
    if (!updateTodos(todoRepository, ids, body.completed))
      return NextResponse.json(
        { error: "Ett eller flera inlägg hittades inte" },
        { status: 400 },
      );
    return NextResponse.json({ ok: true });
  }
  if (id === null)
    return NextResponse.json({ error: "Ogiltigt id" }, { status: 400 });
  const completed =
    typeof body?.completed === "boolean" ? body.completed : undefined;
  const title = typeof body?.title === "string" ? body.title.trim() : undefined;
  const checkbox =
    typeof body?.hasCheckbox === "boolean" ? body.hasCheckbox : undefined;
  const input = {
    id,
    completed,
    title,
    hasCheckbox: checkbox,
  };
  if (!isValidTodoUpdate(input))
    return NextResponse.json(
      { error: "Minst ett giltigt fält måste uppdateras" },
      { status: 400 },
    );
  const updated = updateTodo(todoRepository, input);
  if (!updated)
    return NextResponse.json(
      { error: "Inlägget hittades inte" },
      { status: 404 },
    );
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = await readRequestObject(request);
  const id = readPositiveInteger(body?.id);
  if (id === null)
    return NextResponse.json({ error: "Ogiltigt id" }, { status: 400 });
  if (!deleteTodo(todoRepository, id))
    return NextResponse.json(
      { error: "Inlägget hittades inte" },
      { status: 404 },
    );
  return NextResponse.json({ ok: true });
}
