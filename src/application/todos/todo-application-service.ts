import type { TodoRepository } from "@/src/core/ports/todo-repository";
import type { TodoUpdateInput } from "@/src/core/ports/todo-api";

export function listItems(repository: TodoRepository, focusId?: number) {
  if (focusId !== undefined && !isValidFocusId(focusId))
    throw new RangeError("focusId must be a positive integer");
  return repository.getItems(focusId);
}

export function isValidFocusId(focusId: number) {
  return Number.isInteger(focusId) && focusId > 0;
}

export function addTodo(
  repository: TodoRepository,
  title: string,
  parentId: number | null,
  focusId: number,
  hasCheckbox: boolean,
):
  | { ok: true; id: number }
  | {
      ok: false;
      reason:
        | "invalid-title"
        | "invalid-focus"
        | "invalid-parent"
        | "focus-not-found"
        | "parent-not-found"
        | "parent-not-root"
        | "parent-focus-mismatch";
    } {
  if (!title.trim()) return { ok: false, reason: "invalid-title" };
  if (!isValidFocusId(focusId)) return { ok: false, reason: "invalid-focus" };
  if (parentId !== null && (!Number.isInteger(parentId) || parentId <= 0))
    return { ok: false, reason: "invalid-parent" };
  if (!repository.getFocusAreas().some((focusArea) => focusArea.id === focusId))
    return { ok: false, reason: "focus-not-found" };

  if (parentId !== null) {
    const parent = repository.getItem(parentId);
    if (!parent) return { ok: false, reason: "parent-not-found" };
    if (parent.parentId !== null)
      return { ok: false, reason: "parent-not-root" };
    if (parent.focusId !== focusId)
      return { ok: false, reason: "parent-focus-mismatch" };
  }

  return {
    ok: true,
    id: repository.addItem(title, parentId, focusId, hasCheckbox),
  };
}

export function updateTodo(repository: TodoRepository, input: TodoUpdateInput) {
  if (!isValidTodoUpdate(input)) return false;
  if (!repository.getItem(input.id)) return false;
  if (typeof input.completed === "boolean")
    repository.setCompleted(input.id, input.completed);
  if (typeof input.title === "string" && input.title.trim())
    repository.updateTitle(input.id, input.title);
  if (typeof input.hasCheckbox === "boolean")
    repository.setHasCheckbox(input.id, input.hasCheckbox);
  return true;
}

export function updateTodos(
  repository: TodoRepository,
  ids: number[],
  completed: boolean,
) {
  const uniqueIds = new Set(ids);
  if (
    ids.length === 0 ||
    ids.some((id) => !Number.isInteger(id) || id <= 0) ||
    uniqueIds.size !== ids.length ||
    ids.some((id) => !repository.getItem(id))
  )
    return false;
  repository.setCompletedMany(ids, completed);
  return true;
}

export function isValidTodoUpdate(input: TodoUpdateInput) {
  return (
    Number.isInteger(input.id) &&
    input.id > 0 &&
    (typeof input.completed === "boolean" ||
      (typeof input.title === "string" && input.title.trim().length > 0) ||
      typeof input.hasCheckbox === "boolean")
  );
}

export function deleteTodo(repository: TodoRepository, id: number) {
  if (!Number.isInteger(id) || id <= 0) return false;
  if (!repository.getItem(id)) return false;
  repository.removeItem(id);
  return true;
}
