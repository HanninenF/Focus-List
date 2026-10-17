import type { Item } from "@/src/core/domain/item";
import { childrenOf } from "@/src/core/domain/item-tree";

export function normalizeSearchQuery(query: string) {
  return query.trim().toLowerCase();
}

export function itemMatchesQuery(
  item: Item,
  items: Item[],
  query: string,
): boolean {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return true;
  return (
    item.title.toLowerCase().includes(normalizedQuery) ||
    childrenOf(items, item.id).some((child) =>
      child.title.toLowerCase().includes(normalizedQuery),
    )
  );
}
