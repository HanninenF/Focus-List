import type { Item } from "@/src/core/domain/item";
import { childrenOf } from "@/src/core/domain/item-tree";

export { childrenOf, rootItems } from "@/src/core/domain/item-tree";

export function isRootDone(items: Item[], id: number) {
  const checkboxChildren = childrenOf(items, id).filter(
    (child) => child.hasCheckbox === 1,
  );
  return checkboxChildren.length > 0
    ? checkboxChildren.every((child) => child.completed === 1)
    : items.find((item) => item.id === id)?.completed === 1;
}

export function isRootStarted(items: Item[], id: number) {
  const checkboxChildren = childrenOf(items, id).filter(
    (child) => child.hasCheckbox === 1,
  );
  return (
    checkboxChildren.some((child) => child.completed === 1) &&
    !checkboxChildren.every((child) => child.completed === 1)
  );
}

export function toggleChecklistItem(
  title: string,
  index: number,
  checked: boolean,
) {
  let matchIndex = 0;
  return title
    .split("\n")
    .map((line) => {
      const leadingLength = line.length - line.trimStart().length;
      const leading = line.slice(0, leadingLength);
      const content = line.slice(leadingLength);
      const marker = ["- ", "* ", "+ "].find((candidate) =>
        content.startsWith(candidate),
      );
      const checkboxStart = marker ? marker.length : -1;
      const checkbox =
        checkboxStart >= 0
          ? content.slice(checkboxStart, checkboxStart + 3)
          : "";
      if (
        !marker ||
        !checkbox.startsWith("[") ||
        !checkbox.endsWith("]") ||
        ![" ", "x", "X"].includes(checkbox[1])
      )
        return line;
      const isTarget = matchIndex === index;
      const nextChecked = isTarget
        ? checked
        : checkbox[1].toLowerCase() === "x";
      matchIndex += 1;
      return `${leading}${content.slice(0, checkboxStart)}[${nextChecked ? "x" : " "}]${content.slice(checkboxStart + 3)}`;
    })
    .join("\n");
}
