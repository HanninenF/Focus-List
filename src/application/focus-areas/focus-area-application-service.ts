import type { TodoRepository } from "@/src/core/ports/todo-repository";

export function listFocusAreas(repository: TodoRepository) {
  return repository.getFocusAreas();
}

export function addFocusArea(repository: TodoRepository, name: string) {
  if (!isValidFocusAreaName(name))
    throw new RangeError("Focus area name cannot be empty");
  return repository.addFocusArea(name);
}

export function isValidFocusAreaName(name: string) {
  return name.trim().length > 0;
}
