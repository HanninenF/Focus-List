import type { Item } from "@/src/core/domain/item";

export function childrenOf(items: Item[], id: number) {
  return items.filter((item) => item.parentId === id);
}

export function isRootDone(items: Item[], id: number) {
  const checkboxChildren = childrenOf(items, id).filter((child) => child.hasCheckbox === 1);
  return checkboxChildren.length > 0
    ? checkboxChildren.every((child) => child.completed === 1)
    : items.find((item) => item.id === id)?.completed === 1;
}

export function isRootStarted(items: Item[], id: number) {
  const checkboxChildren = childrenOf(items, id).filter((child) => child.hasCheckbox === 1);
  return checkboxChildren.some((child) => child.completed === 1) && !checkboxChildren.every((child) => child.completed === 1);
}

export function rootItems(items: Item[]) {
  return items.filter((item) => item.parentId === null);
}
