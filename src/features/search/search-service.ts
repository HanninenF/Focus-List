import type { Item } from "@/src/core/domain/item";
import { childrenOf } from "@/src/features/todos/todo-rules";

export function normalizeSearchQuery(query: string) {
  return query.trim().toLocaleLowerCase();
}

export function itemMatchesQuery(item: Item, items: Item[], query: string) {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return true;
  return item.title.toLocaleLowerCase().includes(normalizedQuery)
    || childrenOf(items, item.id).some((child) => child.title.toLocaleLowerCase().includes(normalizedQuery));
}
