import { NextResponse } from "next/server";
import { readPositiveInteger, readRequestObject } from "@/app/api/request-body";
import {
  itemLinkRepository,
  todoRepository,
} from "@/src/application/server-data-services";
import {
  addItemLink,
  deleteItemLink,
  listItemLinks,
  validateLinkInput,
  updateItemLink,
} from "@/src/application/item-links/item-link-application-service";
import type { ItemLinkFailure } from "@/src/application/item-links/item-link-application-service";

export const runtime = "nodejs";

export function GET(request: Request) {
  const itemId = Number(new URL(request.url).searchParams.get("itemId"));
  if (!Number.isInteger(itemId) || itemId <= 0)
    return NextResponse.json(
      { error: "Ogiltigt underinlägg" },
      { status: 400 },
    );
  const item = todoRepository.getItem(itemId);
  if (!item)
    return NextResponse.json(
      { error: "Underinlägget hittades inte" },
      { status: 404 },
    );
  if (item.parentId === null)
    return NextResponse.json(
      { error: "Länkar kan bara tillhöra underinlägg" },
      { status: 400 },
    );
  const result = listItemLinks(itemLinkRepository, itemId, todoRepository);
  if (!result.ok) return failureResponse(result.reason);
  return NextResponse.json(result.value);
}

export async function POST(request: Request) {
  const body = await readRequestObject(request);
  if (!body)
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  const itemId = readPositiveInteger(body.itemId);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (itemId === null || !validateLinkInput(title, url))
    return NextResponse.json(
      { error: "Titel och giltig URL krävs" },
      { status: 400 },
    );
  const result = addItemLink(
    itemLinkRepository,
    itemId,
    title,
    url,
    todoRepository,
  );
  if (!result.ok) return failureResponse(result.reason);
  return NextResponse.json(result.value, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await readRequestObject(request);
  if (!body)
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  const id = readPositiveInteger(body.id);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (id === null || !validateLinkInput(title, url))
    return NextResponse.json(
      { error: "Titel och giltig URL krävs" },
      { status: 400 },
    );
  const result = updateItemLink(itemLinkRepository, id, title, url);
  if (!result.ok) return failureResponse(result.reason);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = await readRequestObject(request);
  if (!body)
    return NextResponse.json({ error: "Ogiltig JSON" }, { status: 400 });
  const id = readPositiveInteger(body.id);
  if (id === null)
    return NextResponse.json(
      { error: "Ogiltigt länkattribut" },
      { status: 400 },
    );
  const result = deleteItemLink(itemLinkRepository, id);
  if (!result.ok) return failureResponse(result.reason);
  return NextResponse.json({ ok: true });
}

function failureResponse(reason: ItemLinkFailure) {
  if (reason === "invalid_id")
    return NextResponse.json(
      { error: "Ogiltigt länkattribut" },
      { status: 400 },
    );
  if (reason === "item_not_found" || reason === "link_not_found")
    return NextResponse.json(
      { error: "Resursen hittades inte" },
      { status: 404 },
    );
  if (reason === "item_is_not_child")
    return NextResponse.json(
      { error: "Länkar kan bara tillhöra underinlägg" },
      { status: 400 },
    );
  return NextResponse.json(
    { error: "Titel och giltig URL krävs" },
    { status: 400 },
  );
}
