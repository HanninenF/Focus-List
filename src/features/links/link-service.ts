import type { ItemLink } from "@/src/core/domain/item-link";
import type {
  ItemLinkApi,
  ItemLinkInput,
} from "@/src/core/ports/item-link-api";
import type { CancellationToken } from "@/src/core/ports/cancellation";

export function createItemLinkService(api: ItemLinkApi) {
  return {
    loadLinks: (
      itemId: number,
      cancellation?: CancellationToken,
    ): Promise<ItemLink[]> => api.getLinks(itemId, cancellation),
    createLink: (
      input: ItemLinkInput,
      cancellation?: CancellationToken,
    ): Promise<ItemLink> => api.postLink(input, cancellation),
    updateLink: (
      id: number,
      input: Omit<ItemLinkInput, "itemId">,
      cancellation?: CancellationToken,
    ): Promise<void> => api.patchLink(id, input, cancellation),
    removeLink: (id: number, cancellation?: CancellationToken): Promise<void> =>
      api.deleteLink(id, cancellation),
  };
}
