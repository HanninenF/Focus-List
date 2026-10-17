import type { FocusArea } from "@/src/core/domain/focus-area";
import type { Item } from "@/src/core/domain/item";

export interface TodoRepository {
  getItem(id: number): Item | undefined;
  getItems(focusId?: number): Item[];
  addItem(
    title: string,
    parentId: number | null,
    focusId: number,
    hasCheckbox?: boolean,
  ): number;
  getFocusAreas(): FocusArea[];
  addFocusArea(name: string): number;
  setCompleted(id: number, completed: boolean): void;
  setCompletedMany(ids: number[], completed: boolean): void;
  updateTitle(id: number, title: string): void;
  setHasCheckbox(id: number, hasCheckbox: boolean): void;
  removeItem(id: number): void;
}
