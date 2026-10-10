export type { Item } from "@/src/core/domain/item";
export type { FocusArea } from "@/src/core/domain/focus-area";
export { addFocusArea, addItem, getFocusAreas, getItems, removeItem, setCompleted, setHasCheckbox, updateTitle } from "@/src/infrastructure/database/sqlite-todo-repository";
