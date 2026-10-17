import type { DatabaseSync } from "node:sqlite";
import type { TodoRepository } from "@/src/core/ports/todo-repository";
import {
  addFocusArea,
  addItem,
  getFocusAreas,
  getItem,
  getItems,
  removeItem,
  setCompleted,
  setCompletedMany,
  setHasCheckbox,
  updateTitle,
} from "@/src/infrastructure/database/sqlite-todo-repository";

export function createTodoRepository(database: DatabaseSync): TodoRepository {
  return {
    getItem: (id) => getItem(database, id),
    getItems: (focusId) => getItems(database, focusId),
    addItem: (title, parentId, focusId, hasCheckbox) =>
      addItem(database, title, parentId, focusId, hasCheckbox),
    getFocusAreas: () => getFocusAreas(database),
    addFocusArea: (name) => addFocusArea(database, name),
    setCompleted: (id, completed) => setCompleted(database, id, completed),
    setCompletedMany: (ids, completed) =>
      setCompletedMany(database, ids, completed),
    updateTitle: (id, title) => updateTitle(database, id, title),
    setHasCheckbox: (id, hasCheckbox) =>
      setHasCheckbox(database, id, hasCheckbox),
    removeItem: (id) => removeItem(database, id),
  };
}
