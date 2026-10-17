import type { Item } from "@/src/core/domain/item";
import type { CancellationToken } from "@/src/core/ports/cancellation";
import type {
  TodoApi,
  TodoCreateInput,
  TodoBatchUpdateInput,
  TodoUpdateInput,
} from "@/src/core/ports/todo-api";

export function createTodoService(api: TodoApi) {
  return {
    loadItems: (
      focusId: number,
      cancellation?: CancellationToken,
    ): Promise<Item[]> => api.getItems(focusId, cancellation),
    createItem: (input: TodoCreateInput): Promise<void> => api.postItem(input),
    updateItem: (input: TodoUpdateInput): Promise<void> => api.patchItem(input),
    updateItems: (input: TodoBatchUpdateInput): Promise<void> =>
      api.patchItems(input),
    removeItem: (id: number): Promise<void> => api.deleteItem(id),
  };
}

export type TodoService = ReturnType<typeof createTodoService>;
