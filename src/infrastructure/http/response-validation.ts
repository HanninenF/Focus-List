import type { FocusArea } from "@/src/core/domain/focus-area";
import type { Item } from "@/src/core/domain/item";
import type { ItemLink } from "@/src/core/domain/item-link";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function isFocusArea(value: unknown): value is FocusArea {
  if (!isRecord(value)) return false;
  const id = value.id;
  return (
    typeof id === "number" &&
    Number.isInteger(id) &&
    id > 0 &&
    typeof value.name === "string" &&
    typeof value.createdAt === "string"
  );
}

export function isItem(value: unknown): value is Item {
  if (!isRecord(value)) return false;
  const id = value.id;
  const parentId = value.parentId;
  const focusId = value.focusId;
  return (
    typeof id === "number" &&
    Number.isInteger(id) &&
    id > 0 &&
    (typeof parentId === "number" || parentId === null) &&
    (parentId === null || (Number.isInteger(parentId) && parentId > 0)) &&
    typeof value.title === "string" &&
    (value.completed === 0 || value.completed === 1) &&
    (value.hasCheckbox === 0 || value.hasCheckbox === 1) &&
    typeof focusId === "number" &&
    Number.isInteger(focusId) &&
    focusId > 0 &&
    typeof value.createdAt === "string"
  );
}

export function isItemLink(value: unknown): value is ItemLink {
  if (!isRecord(value)) return false;
  const id = value.id;
  const itemId = value.itemId;
  const url = value.url;
  let isHttpUrl = false;
  if (typeof url === "string") {
    try {
      const parsed = new URL(url);
      isHttpUrl = parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      isHttpUrl = false;
    }
  }
  return (
    typeof id === "number" &&
    Number.isInteger(id) &&
    id > 0 &&
    typeof itemId === "number" &&
    Number.isInteger(itemId) &&
    itemId > 0 &&
    typeof value.title === "string" &&
    isHttpUrl &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

export function expectArray<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
): T[] {
  if (!Array.isArray(value) || !value.every(guard))
    throw new Error("API:t returnerade ogiltig data.");
  return value;
}

export function expectRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new Error("API:t returnerade ogiltig data.");
  return value;
}
