import type { ItemLinkRepository } from "@/src/core/ports/item-link-repository";
import type { TodoRepository } from "@/src/core/ports/todo-repository";
import type { ItemLink } from "@/src/core/domain/item-link";

export type ItemLinkFailure =
  | "invalid_input"
  | "invalid_id"
  | "item_not_found"
  | "item_is_not_child"
  | "link_not_found";

export type ItemLinkResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: ItemLinkFailure };

export function validateLinkInput(title: string, url: string) {
  if (!title.trim() || !url.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidItemLinkId(id: number) {
  return Number.isInteger(id) && id > 0;
}

function getChildItem(repository: TodoRepository, itemId: number) {
  if (!isValidItemLinkId(itemId))
    return { ok: false, reason: "invalid_id" } as const;
  const item = repository.getItem(itemId);
  if (!item) return { ok: false, reason: "item_not_found" } as const;
  if (item.parentId === null)
    return { ok: false, reason: "item_is_not_child" } as const;
  return { ok: true, item } as const;
}

export function listItemLinks(
  repository: ItemLinkRepository,
  itemId: number,
  todoRepository: TodoRepository,
): ItemLinkResult<ItemLink[]> {
  const item = getChildItem(todoRepository, itemId);
  if (!item.ok) return item;
  return { ok: true, value: repository.getLinks(itemId) };
}

export function addItemLink(
  repository: ItemLinkRepository,
  itemId: number,
  title: string,
  url: string,
  todoRepository: TodoRepository,
): ItemLinkResult<ItemLink> {
  if (!validateLinkInput(title, url))
    return { ok: false, reason: "invalid_input" };
  const item = getChildItem(todoRepository, itemId);
  if (!item.ok) return item;
  return { ok: true, value: repository.addLink(itemId, title, url) };
}

export function updateItemLink(
  repository: ItemLinkRepository,
  id: number,
  title: string,
  url: string,
): ItemLinkResult<undefined> {
  if (!isValidItemLinkId(id)) return { ok: false, reason: "invalid_id" };
  if (!validateLinkInput(title, url))
    return { ok: false, reason: "invalid_input" };
  if (!repository.getLink(id)) return { ok: false, reason: "link_not_found" };
  repository.updateLink(id, title, url);
  return { ok: true, value: undefined };
}

export function deleteItemLink(
  repository: ItemLinkRepository,
  id: number,
): ItemLinkResult<undefined> {
  if (!isValidItemLinkId(id)) return { ok: false, reason: "invalid_id" };
  if (!repository.getLink(id)) return { ok: false, reason: "link_not_found" };
  repository.removeLink(id);
  return { ok: true, value: undefined };
}
