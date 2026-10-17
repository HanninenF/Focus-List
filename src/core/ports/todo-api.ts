import type { Item } from "@/src/core/domain/item";
import type { CancellationToken } from "@/src/core/ports/cancellation";

export type TodoCreateInput = Readonly<{
  title: string;
  parentId: number | null;
  focusId: number;
  hasCheckbox: boolean;
}>;
export type TodoUpdateInput = Readonly<{
  id: number;
  title?: string;
  completed?: boolean;
  hasCheckbox?: boolean;
}>;
export type TodoBatchUpdateInput = Readonly<{
  ids: number[];
  completed: boolean;
}>;

export interface TodoApi {
  getItems(focusId: number, cancellation?: CancellationToken): Promise<Item[]>;
  postItem(input: TodoCreateInput): Promise<void>;
  patchItem(input: TodoUpdateInput): Promise<void>;
  patchItems(input: TodoBatchUpdateInput): Promise<void>;
  deleteItem(id: number): Promise<void>;
}
