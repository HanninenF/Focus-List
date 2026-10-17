import { describe, expect, it } from "vitest";
import type { FocusArea } from "@/src/core/domain/focus-area";
import type { Item } from "@/src/core/domain/item";
import type { TodoRepository } from "@/src/core/ports/todo-repository";
import {
  addTodo,
  deleteTodo,
  isValidFocusId,
  isValidTodoUpdate,
  listItems,
  updateTodos,
  updateTodo,
} from "@/src/application/todos/todo-application-service";

function createRepository(
  focusAreas: FocusArea[] = [{ id: 1, name: "Mitt fokus", createdAt: "now" }],
  items: Item[] = [],
): TodoRepository {
  let nextId = 10;
  return {
    getItem: (id) => items.find((item) => item.id === id),
    getItems: () => items,
    addItem: (title, parentId, focusId, hasCheckbox = true) => {
      const id = nextId++;
      items.push({
        id,
        parentId,
        title,
        focusId,
        hasCheckbox: hasCheckbox ? 1 : 0,
        completed: 0,
        createdAt: "now",
      });
      return id;
    },
    getFocusAreas: () => focusAreas,
    addFocusArea: () => 2,
    setCompleted: (id, completed) => {
      const item = items.find((candidate) => candidate.id === id);
      if (item) item.completed = completed ? 1 : 0;
    },
    setCompletedMany: (ids, completed) => {
      for (const id of ids) {
        const item = items.find((candidate) => candidate.id === id);
        if (item) item.completed = completed ? 1 : 0;
      }
    },
    updateTitle: (id, title) => {
      const item = items.find((candidate) => candidate.id === id);
      if (item) item.title = title;
    },
    setHasCheckbox: (id, hasCheckbox) => {
      const item = items.find((candidate) => candidate.id === id);
      if (item) item.hasCheckbox = hasCheckbox ? 1 : 0;
    },
    removeItem: () => undefined,
  };
}

describe("todo application service", () => {
  it("rejects invalid focus ids before querying the repository", () => {
    const repository = createRepository();

    expect(() => listItems(repository, 0)).toThrow(RangeError);
  });

  it("accepts only positive integer focus ids", () => {
    expect(isValidFocusId(1)).toBe(true);
    expect(isValidFocusId(1.5)).toBe(false);
    expect(isValidFocusId(Number.NaN)).toBe(false);
    expect(isValidFocusId(0)).toBe(false);
  });

  it("rejects invalid focus and parent ids before persistence", () => {
    const repository = createRepository();

    expect(addTodo(repository, "Test", null, Number.NaN, true)).toEqual({
      ok: false,
      reason: "invalid-focus",
    });
    expect(addTodo(repository, "Test", Number.NaN, 1, true)).toEqual({
      ok: false,
      reason: "invalid-parent",
    });
  });

  it("rejects a child under another child", () => {
    const repository = createRepository(undefined, [
      {
        id: 2,
        parentId: 1,
        title: "Child",
        focusId: 1,
        hasCheckbox: 1,
        completed: 0,
        createdAt: "now",
      },
    ]);

    expect(addTodo(repository, "Nested", 2, 1, true)).toEqual({
      ok: false,
      reason: "parent-not-root",
    });
  });

  it("validates updates before applying them", () => {
    const item: Item = {
      id: 3,
      parentId: null,
      title: "Original",
      focusId: 1,
      hasCheckbox: 1,
      completed: 0,
      createdAt: "now",
    };
    const repository = createRepository(undefined, [item]);

    expect(isValidTodoUpdate({ id: 3 })).toBe(false);
    expect(updateTodo(repository, { id: 3, title: "Updated" })).toBe(true);
    expect(item.title).toBe("Updated");
    expect(deleteTodo(repository, 1.5)).toBe(false);
  });

  it("updates multiple items through one repository operation", () => {
    const items: Item[] = [
      {
        id: 3,
        parentId: null,
        title: "First",
        focusId: 1,
        hasCheckbox: 1,
        completed: 0,
        createdAt: "now",
      },
      {
        id: 4,
        parentId: 3,
        title: "Second",
        focusId: 1,
        hasCheckbox: 1,
        completed: 0,
        createdAt: "now",
      },
    ];
    const repository = createRepository(undefined, items);

    expect(updateTodos(repository, [3, 4], true)).toBe(true);
    expect(items.every((item) => item.completed === 1)).toBe(true);
  });
});
