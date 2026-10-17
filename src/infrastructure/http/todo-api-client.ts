import type { Item } from "@/src/core/domain/item";
import type { CancellationToken } from "@/src/core/ports/cancellation";
import type {
  TodoApi,
  TodoCreateInput,
  TodoBatchUpdateInput,
  TodoUpdateInput,
} from "@/src/core/ports/todo-api";
import { ApiError } from "@/src/infrastructure/http/api-error";
import {
  expectArray,
  isItem,
  readJson,
} from "@/src/infrastructure/http/response-validation";

async function request(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok)
    throw new ApiError(
      `Todo-anropet misslyckades (${response.status}).`,
      response.status,
    );
  return response;
}

async function getItems(
  focusId: number,
  cancellation?: CancellationToken,
): Promise<Item[]> {
  const controller = new AbortController();
  const unsubscribe = cancellation?.onCancel(() => controller.abort());
  try {
    return expectArray(
      await readJson(
        await request(`/api/items?focusId=${focusId}`, {
          cache: "no-store",
          signal: controller.signal,
        }),
      ),
      isItem,
    );
  } finally {
    unsubscribe?.();
  }
}

async function postItem(input: TodoCreateInput): Promise<void> {
  await request("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

async function patchItem(input: TodoUpdateInput): Promise<void> {
  await request("/api/items", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

async function patchItems(input: TodoBatchUpdateInput): Promise<void> {
  await request("/api/items", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function deleteItem(id: number): Promise<void> {
  await request("/api/items", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
}

export const todoApiClient: TodoApi = {
  getItems,
  postItem,
  patchItem,
  patchItems,
  deleteItem,
};
