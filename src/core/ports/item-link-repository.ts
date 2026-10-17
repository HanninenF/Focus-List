import type { ItemLink } from "@/src/core/domain/item-link";

export interface ItemLinkRepository {
  getLinks(itemId: number): ItemLink[];
  getLink(id: number): ItemLink | undefined;
  addLink(itemId: number, title: string, url: string): ItemLink;
  updateLink(id: number, title: string, url: string): boolean;
  removeLink(id: number): boolean;
}
