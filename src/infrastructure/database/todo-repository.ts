import type { TodoRepository } from "@/src/core/ports/todo-repository";
import { addFocusArea, addItem, getFocusAreas, getItems, removeItem, setCompleted, setHasCheckbox, updateTitle } from "@/lib/db";

export const todoRepository: TodoRepository = {
  getItems,
  addItem,
  getFocusAreas,
  addFocusArea,
  setCompleted,
  updateTitle,
  setHasCheckbox,
  removeItem,
};
