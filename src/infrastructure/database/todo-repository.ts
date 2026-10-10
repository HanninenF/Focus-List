import type { TodoRepository } from "@/src/core/ports/todo-repository";
import { addFocusArea, addItem, getFocusAreas, getItems, removeItem, setCompleted, setHasCheckbox, updateTitle } from "@/src/infrastructure/database/sqlite-todo-repository";

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
