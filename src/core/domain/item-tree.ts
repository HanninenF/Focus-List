import type { Item } from "@/src/core/domain/item";

export function childrenOf(items: Item[], id: number) {
  return items.filter((item) => item.parentId === id);
}

export function rootItems(items: Item[]) {
  return items.filter((item) => item.parentId === null);
}
