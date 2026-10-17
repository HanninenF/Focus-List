import { describe, expect, it } from "vitest";
import type { Item } from "@/src/core/domain/item";
import type { ItemLink } from "@/src/core/domain/item-link";
import type { ItemLinkRepository } from "@/src/core/ports/item-link-repository";
import type { TodoRepository } from "@/src/core/ports/todo-repository";
import {
  addItemLink,
  deleteItemLink,
  isValidItemLinkId,
  listItemLinks,
  updateItemLink,
  validateLinkInput,
} from "@/src/application/item-links/item-link-application-service";

const child: Item = {
  id: 2,
  parentId: 1,
  title: "Child",
  focusId: 1,
  hasCheckbox: 1,
  completed: 0,
  createdAt: "now",
};

function createRepositories() {
  const links: ItemLink[] = [];
  const itemLinkRepository: ItemLinkRepository = {
    getLinks: (itemId) => links.filter((link) => link.itemId === itemId),
    getLink: (id) => links.find((link) => link.id === id),
    addLink: (itemId, title, url) => {
      const id = links.length + 1;
      links.push({
        id,
        itemId,
        title,
        url,
        createdAt: "now",
        updatedAt: "now",
      });
      return links[links.length - 1];
    },
    updateLink: (id, title, url) => {
      const link = links.find((candidate) => candidate.id === id);
      if (!link) return false;
      link.title = title;
      link.url = url;
      return true;
    },
    removeLink: (id) => {
      const index = links.findIndex((link) => link.id === id);
      if (index < 0) return false;
      links.splice(index, 1);
      return true;
    },
  };
  const todoRepository = {
    getItem: (id: number) => (id === child.id ? child : undefined),
  } as TodoRepository;
  return { itemLinkRepository, todoRepository };
}

describe("item link validation", () => {
  it("accepts HTTP and HTTPS links", () => {
    expect(validateLinkInput("Docs", "https://example.com/docs")).toBe(true);
    expect(validateLinkInput("Docs", "http://example.com/docs")).toBe(true);
  });

  it("rejects unsafe protocols and empty values", () => {
    expect(validateLinkInput("Docs", "javascript:alert(1)")).toBe(false);
    expect(validateLinkInput("", "https://example.com")).toBe(false);
    expect(validateLinkInput("Docs", "")).toBe(false);
  });

  it("enforces child ownership and supports link CRUD", () => {
    const { itemLinkRepository, todoRepository } = createRepositories();
    expect(
      addItemLink(
        itemLinkRepository,
        child.id,
        "Docs",
        "https://example.com",
        todoRepository,
      ),
    ).toEqual({
      ok: true,
      value: expect.objectContaining({ id: 1, title: "Docs" }),
    });
    expect(listItemLinks(itemLinkRepository, child.id, todoRepository)).toEqual(
      {
        ok: true,
        value: expect.arrayContaining([
          expect.objectContaining({ title: "Docs" }),
        ]),
      },
    );
    expect(
      updateItemLink(
        itemLinkRepository,
        1,
        "Updated",
        "https://updated.example.com",
      ),
    ).toEqual({
      ok: true,
      value: undefined,
    });
    expect(deleteItemLink(itemLinkRepository, 1)).toEqual({
      ok: true,
      value: undefined,
    });
  });

  it("rejects links for roots and invalid IDs", () => {
    const { itemLinkRepository, todoRepository } = createRepositories();
    expect(listItemLinks(itemLinkRepository, 1, todoRepository)).toEqual({
      ok: false,
      reason: "item_not_found",
    });
    expect(isValidItemLinkId(0)).toBe(false);
    expect(deleteItemLink(itemLinkRepository, 0)).toEqual({
      ok: false,
      reason: "invalid_id",
    });
  });
});
