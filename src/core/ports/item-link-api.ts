import type { ItemLink } from "@/src/core/domain/item-link";
import type { CancellationToken } from "@/src/core/ports/cancellation";

export type ItemLinkInput = Readonly<{
  itemId: number;
  title: string;
  url: string;
}>;

export interface ItemLinkApi {
  getLinks(
    itemId: number,
    cancellation?: CancellationToken,
  ): Promise<ItemLink[]>;
  postLink(
    input: ItemLinkInput,
    cancellation?: CancellationToken,
  ): Promise<ItemLink>;
  patchLink(
    id: number,
    input: Omit<ItemLinkInput, "itemId">,
    cancellation?: CancellationToken,
  ): Promise<void>;
  deleteLink(id: number, cancellation?: CancellationToken): Promise<void>;
}
