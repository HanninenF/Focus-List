"use client";

import { useRef } from "react";
import type { Item } from "@/src/core/domain/item";
import { toggleChecklistItem } from "@/src/features/todos/todo-rules";
import { todoService } from "@/src/application/client-services";

type FormSubmitEvent = Readonly<{ preventDefault: () => void }>;

type TodoActionsOptions = Readonly<{
  activeFocusId?: number;
  draft: string;
  detailDraft: string;
  detailHasCheckbox: boolean;
  editDraft: string;
  activeId: number | null;
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setDraft: (value: string) => void;
  setDetailDraft: (value: string) => void;
  setDetailHasCheckbox: (value: boolean) => void;
  setShowMarkdownPreview: (value: boolean) => void;
  setComposerParentId: (value: number | null) => void;
  setEditingId: (value: number | null) => void;
  setEditingChildId: (value: number | null) => void;
  setEditDraft: (value: string) => void;
  setActiveId: (value: number | null) => void;
  reload: () => Promise<void>;
  isRootDone: (id: number) => boolean;
  setActionError: (value: string) => void;
}>;

export function useTodoActions(options: TodoActionsOptions) {
  const optimisticId = useRef(0);
  const childrenOf = (id: number) =>
    options.items.filter((item) => item.parentId === id);

  async function createTodo(
    event: FormSubmitEvent,
    parentId: number | null = null,
  ) {
    event.preventDefault();
    const value = parentId === null ? options.draft : options.detailDraft;
    if (!value.trim() || !options.activeFocusId) return;
    options.setActionError("");
    const tempId = -++optimisticId.current;
    const optimisticItem: Item = {
      id: tempId,
      parentId,
      title: value.trim(),
      completed: 0,
      hasCheckbox: parentId === null || options.detailHasCheckbox ? 1 : 0,
      focusId: options.activeFocusId,
      createdAt: new Date().toISOString(),
    };
    options.setItems((current) => [optimisticItem, ...current]);
    if (parentId === null) options.setDraft("");
    else options.setDetailDraft("");
    if (parentId !== null) {
      options.setDetailHasCheckbox(true);
      options.setShowMarkdownPreview(false);
      options.setComposerParentId(null);
    }
    try {
      await todoService.createItem({
        title: value,
        parentId,
        focusId: options.activeFocusId,
        hasCheckbox: parentId === null ? true : options.detailHasCheckbox,
      });
    } catch {
      options.setItems((current) =>
        current.filter((item) => item.id !== tempId),
      );
      options.setActionError("Inlägget kunde inte skapas.");
      return;
    }
    try {
      await options.reload();
    } catch {
      options.setActionError("Listan kunde inte uppdateras.");
    }
  }

  async function toggleChild(item: Item) {
    options.setActionError("");
    try {
      await todoService.updateItem({ id: item.id, completed: !item.completed });
      await options.reload();
    } catch {
      options.setActionError("Underinlägget kunde inte uppdateras.");
      await options.reload().catch(() => undefined);
    }
  }

  async function toggleRoot(item: Item) {
    options.setActionError("");
    const next = !options.isRootDone(item.id);
    const children = childrenOf(item.id).filter(
      (child) => child.hasCheckbox === 1,
    );
    try {
      if (children.length)
        await todoService.updateItems({
          ids: children.map((child) => child.id),
          completed: next,
        });
      else await todoService.updateItem({ id: item.id, completed: next });
      await options.reload();
    } catch {
      options.setActionError("Trådens status kunde inte uppdateras helt.");
      await options.reload().catch(() => undefined);
    }
  }

  async function remove(id: number) {
    options.setActionError("");
    try {
      await todoService.removeItem(id);
      if (options.activeId === id) options.setActiveId(null);
      await options.reload();
    } catch {
      options.setActionError("Inlägget kunde inte tas bort.");
    }
  }

  async function saveEdit(event: FormSubmitEvent, id: number) {
    event.preventDefault();
    if (!options.editDraft.trim()) return;
    options.setActionError("");
    try {
      await todoService.updateItem({ id, title: options.editDraft });
      options.setEditingId(null);
      options.setEditingChildId(null);
      options.setEditDraft("");
      await options.reload();
    } catch {
      options.setActionError("Ändringen kunde inte sparas.");
    }
  }

  async function toggleMarkdownCheckbox(
    item: Item,
    index: number,
    checked: boolean,
  ) {
    const nextTitle = toggleChecklistItem(item.title, index, checked);
    if (nextTitle === item.title) return;
    options.setActionError("");
    options.setItems((current) =>
      current.map((currentItem) =>
        currentItem.id === item.id
          ? { ...currentItem, title: nextTitle }
          : currentItem,
      ),
    );
    try {
      await todoService.updateItem({ id: item.id, title: nextTitle });
    } catch {
      options.setActionError("Checklistan kunde inte uppdateras.");
      await options.reload().catch(() => undefined);
    }
  }

  function startEdit(item: Item) {
    options.setEditingId(item.id);
    options.setEditDraft(item.title);
  }
  function startChildEdit(item: Item) {
    options.setEditingChildId(item.id);
    options.setEditDraft(item.title);
  }

  return {
    createTodo,
    toggleChild,
    toggleRoot,
    remove,
    saveEdit,
    toggleMarkdownCheckbox,
    startEdit,
    startChildEdit,
  };
}
