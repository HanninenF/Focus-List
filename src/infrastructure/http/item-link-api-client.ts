import type { ItemLink } from "@/src/core/domain/item-link";
import type { CancellationToken } from "@/src/core/ports/cancellation";
import type {
  ItemLinkApi,
  ItemLinkInput,
} from "@/src/core/ports/item-link-api";
import { ApiError } from "@/src/infrastructure/http/api-error";
import {
  expectArray,
  expectRecord,
  isItemLink,
  readJson,
} from "@/src/infrastructure/http/response-validation";

async function request(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok)
    throw new ApiError(
      `Länkanropet misslyckades (${response.status}).`,
      response.status,
    );
  return response;
}

function createCancellationController(cancellation?: CancellationToken) {
  const controller = new AbortController();
  const unsubscribe = cancellation?.onCancel(() => controller.abort());
  return { controller, unsubscribe };
}

async function getLinks(
  itemId: number,
  cancellation?: CancellationToken,
): Promise<ItemLink[]> {
  const { controller, unsubscribe } =
    createCancellationController(cancellation);
  try {
    return expectArray(
      await readJson(
        await request(`/api/item-links?itemId=${itemId}`, {
          cache: "no-store",
          signal: controller.signal,
        }),
      ),
      isItemLink,
    );
  } finally {
    unsubscribe?.();
  }
}

async function postLink(
  input: ItemLinkInput,
  cancellation?: CancellationToken,
): Promise<ItemLink> {
  const { controller, unsubscribe } =
    createCancellationController(cancellation);
  try {
    const result = expectRecord(
      await readJson(
        await request("/api/item-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal: controller.signal,
        }),
      ),
    );
    if (!isItemLink(result))
      throw new Error("API:t returnerade ogiltig länkdata.");
    return result;
  } finally {
    unsubscribe?.();
  }
}

async function patchLink(
  id: number,
  input: Omit<ItemLinkInput, "itemId">,
  cancellation?: CancellationToken,
): Promise<void> {
  const { controller, unsubscribe } =
    createCancellationController(cancellation);
  try {
    await request("/api/item-links", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...input }),
      signal: controller.signal,
    });
  } finally {
    unsubscribe?.();
  }
}

async function deleteLink(
  id: number,
  cancellation?: CancellationToken,
): Promise<void> {
  const { controller, unsubscribe } =
    createCancellationController(cancellation);
  try {
    await request("/api/item-links", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
      signal: controller.signal,
    });
  } finally {
    unsubscribe?.();
  }
}

export const itemLinkApiClient: ItemLinkApi = {
  getLinks,
  postLink,
  patchLink,
  deleteLink,
};
