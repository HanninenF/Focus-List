import type { DatabaseSync } from "node:sqlite";
import type { ItemLinkRepository } from "@/src/core/ports/item-link-repository";
import {
  addLink,
  getLink,
  getLinks,
  removeLink,
  updateLink,
} from "@/src/infrastructure/database/sqlite-todo-repository";

export function createItemLinkRepository(
  database: DatabaseSync,
): ItemLinkRepository {
  return {
    getLinks: (itemId) => getLinks(database, itemId),
    getLink: (id) => getLink(database, id),
    addLink: (itemId, title, url) => addLink(database, itemId, title, url),
    updateLink: (id, title, url) => updateLink(database, id, title, url),
    removeLink: (id) => removeLink(database, id),
  };
}
