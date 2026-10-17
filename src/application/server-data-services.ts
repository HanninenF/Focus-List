import { createDatabase } from "@/src/infrastructure/database/sqlite-todo-repository";
import { createItemLinkRepository } from "@/src/infrastructure/database/item-link-repository";
import { createTodoRepository } from "@/src/infrastructure/database/todo-repository";

const database = createDatabase();

export const todoRepository = createTodoRepository(database);
export const itemLinkRepository = createItemLinkRepository(database);
