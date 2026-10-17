import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import type { FocusArea } from "@/src/core/domain/focus-area";
import type { Item } from "@/src/core/domain/item";
import type { ItemLink } from "@/src/core/domain/item-link";
import { FocusAreaAlreadyExistsError } from "@/src/core/domain/focus-area-errors";

type DbRow = Record<string, unknown>;

function isDbRow(value: unknown): value is DbRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rows(value: unknown): DbRow[] {
  if (!Array.isArray(value) || !value.every(isDbRow))
    throw new Error("Invalid database rows");
  return value;
}

function row(value: unknown): DbRow | undefined {
  return isDbRow(value) ? value : undefined;
}

function numberValue(source: DbRow, key: string): number {
  const value = source[key];
  if (typeof value !== "number")
    throw new Error(`Invalid database number: ${key}`);
  return value;
}

function stringValue(source: DbRow, key: string): string {
  const value = source[key];
  if (typeof value !== "string")
    throw new Error(`Invalid database string: ${key}`);
  return value;
}

function nullableNumberValue(source: DbRow, key: string): number | null {
  const value = source[key];
  if (value === null) return null;
  return numberValue(source, key);
}

function mapItem(source: DbRow): Item {
  return {
    id: numberValue(source, "id"),
    parentId: nullableNumberValue(source, "parentId"),
    title: stringValue(source, "title"),
    completed: numberValue(source, "completed"),
    hasCheckbox: numberValue(source, "hasCheckbox"),
    focusId: numberValue(source, "focusId"),
    createdAt: stringValue(source, "createdAt"),
  };
}

function mapFocusArea(source: DbRow): FocusArea {
  return {
    id: numberValue(source, "id"),
    name: stringValue(source, "name"),
    createdAt: stringValue(source, "createdAt"),
  };
}

function mapItemLink(source: DbRow): ItemLink {
  return {
    id: numberValue(source, "id"),
    itemId: numberValue(source, "itemId"),
    title: stringValue(source, "title"),
    url: stringValue(source, "url"),
    createdAt: stringValue(source, "createdAt"),
    updatedAt: stringValue(source, "updatedAt"),
  };
}

function initializeSchema(db: DatabaseSync) {
  db.exec(`PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS focus_areas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
  focus_area_id INTEGER REFERENCES focus_areas(id),
  title TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS item_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);

  const columns = rows(db.prepare("PRAGMA table_info(items)").all());
  if (!columns.some((column) => column.name === "has_checkbox"))
    db.exec(
      "ALTER TABLE items ADD COLUMN has_checkbox INTEGER NOT NULL DEFAULT 1",
    );
  if (!columns.some((column) => column.name === "focus_area_id"))
    db.exec(
      "ALTER TABLE items ADD COLUMN focus_area_id INTEGER REFERENCES focus_areas(id)",
    );
}

function ensureDefaultFocus(db: DatabaseSync): number {
  const defaultFocusRow = () =>
    row(
      db.prepare("SELECT id FROM focus_areas WHERE name = ?").get("Mitt fokus"),
    );
  let defaultFocus = defaultFocusRow();
  if (!defaultFocus) {
    try {
      db.prepare("INSERT INTO focus_areas (name) VALUES (?)").run("Mitt fokus");
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !/unique constraint/i.test(error.message)
      )
        throw error;
    }
    defaultFocus = defaultFocusRow();
  }
  if (!defaultFocus)
    throw new Error("Default focus area could not be initialized");
  return numberValue(defaultFocus, "id");
}

function migrateUnassignedItems(db: DatabaseSync, defaultFocusId: number) {
  const unassignedItems = db
    .prepare("SELECT COUNT(*) as count FROM items WHERE focus_area_id IS NULL")
    .get();
  const unassignedCount = row(unassignedItems);
  if (unassignedCount && numberValue(unassignedCount, "count") > 0)
    db.prepare(
      "UPDATE items SET focus_area_id = ? WHERE focus_area_id IS NULL",
    ).run(defaultFocusId);
}

export function createDatabase(
  databasePath = path.join(process.cwd(), "data", "todos.sqlite"),
): DatabaseSync {
  const dataDir = path.dirname(databasePath);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec("PRAGMA busy_timeout = 10000");
  db.exec("PRAGMA foreign_keys = ON");
  initializeSchema(db);
  const defaultFocusId = ensureDefaultFocus(db);
  migrateUnassignedItems(db, defaultFocusId);
  return db;
}

export function getItems(db: DatabaseSync, focusId?: number): Item[] {
  const query =
    "SELECT id, parent_id as parentId, title, completed, has_checkbox as hasCheckbox, focus_area_id as focusId, created_at as createdAt FROM items";
  if (focusId !== undefined)
    return rows(
      db
        .prepare(
          `${query} WHERE focus_area_id = ? ORDER BY created_at DESC, id DESC`,
        )
        .all(focusId),
    ).map((value) => mapItem(value));
  return rows(
    db.prepare(`${query} ORDER BY created_at DESC, id DESC`).all(),
  ).map((value) => mapItem(value));
}
export function getItem(db: DatabaseSync, id: number): Item | undefined {
  const query =
    "SELECT id, parent_id as parentId, title, completed, has_checkbox as hasCheckbox, focus_area_id as focusId, created_at as createdAt FROM items WHERE id = ?";
  const value = row(db.prepare(query).get(id));
  return value ? mapItem(value) : undefined;
}
export function addItem(
  db: DatabaseSync,
  title: string,
  parentId: number | null,
  focusId: number,
  hasCheckbox = true,
) {
  const statement = db.prepare(
    "INSERT INTO items (title, parent_id, focus_area_id, has_checkbox) VALUES (?, ?, ?, ?)",
  );
  statement.run(title.trim(), parentId, focusId, hasCheckbox ? 1 : 0);
  const inserted = row(db.prepare("SELECT last_insert_rowid() as id").get());
  if (!inserted) throw new Error("Inserted item ID was not returned");
  return numberValue(inserted, "id");
}
export function getFocusAreas(db: DatabaseSync): FocusArea[] {
  return rows(
    db
      .prepare(
        "SELECT id, name, created_at as createdAt FROM focus_areas ORDER BY created_at ASC, id ASC",
      )
      .all(),
  ).map((value) => mapFocusArea(value));
}
export function addFocusArea(db: DatabaseSync, name: string) {
  try {
    return Number(
      db.prepare("INSERT INTO focus_areas (name) VALUES (?)").run(name.trim())
        .lastInsertRowid,
    );
  } catch (error) {
    if (error instanceof Error && /unique constraint/i.test(error.message))
      throw new FocusAreaAlreadyExistsError();
    throw error;
  }
}
export function setCompleted(db: DatabaseSync, id: number, completed: boolean) {
  db.prepare("UPDATE items SET completed = ? WHERE id = ?").run(
    completed ? 1 : 0,
    id,
  );
}

export function setCompletedMany(
  db: DatabaseSync,
  ids: number[],
  completed: boolean,
) {
  db.exec("BEGIN");
  try {
    const statement = db.prepare("UPDATE items SET completed = ? WHERE id = ?");
    for (const id of ids) statement.run(completed ? 1 : 0, id);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
export function updateTitle(db: DatabaseSync, id: number, title: string) {
  db.prepare("UPDATE items SET title = ? WHERE id = ?").run(title.trim(), id);
}
export function setHasCheckbox(
  db: DatabaseSync,
  id: number,
  hasCheckbox: boolean,
) {
  db.prepare("UPDATE items SET has_checkbox = ? WHERE id = ?").run(
    hasCheckbox ? 1 : 0,
    id,
  );
}
export function removeItem(db: DatabaseSync, id: number) {
  db.prepare("DELETE FROM items WHERE id = ? OR parent_id = ?").run(id, id);
}

export function getLinks(db: DatabaseSync, itemId: number) {
  return rows(
    db
      .prepare(
        "SELECT id, item_id as itemId, title, url, created_at as createdAt, updated_at as updatedAt FROM item_links WHERE item_id = ? ORDER BY created_at ASC, id ASC",
      )
      .all(itemId),
  ).map((value) => mapItemLink(value));
}

export function getLink(db: DatabaseSync, id: number) {
  const result = db
    .prepare(
      "SELECT id, item_id as itemId, title, url, created_at as createdAt, updated_at as updatedAt FROM item_links WHERE id = ?",
    )
    .get(id);
  const value = row(result);
  return value ? mapItemLink(value) : undefined;
}

export function addLink(
  db: DatabaseSync,
  itemId: number,
  title: string,
  url: string,
) {
  const result = db
    .prepare("INSERT INTO item_links (item_id, title, url) VALUES (?, ?, ?)")
    .run(itemId, title.trim(), url.trim());
  const link = getLink(db, Number(result.lastInsertRowid));
  if (!link) throw new Error("Inserted item link could not be read");
  return link;
}

export function updateLink(
  db: DatabaseSync,
  id: number,
  title: string,
  url: string,
) {
  const result = db
    .prepare(
      "UPDATE item_links SET title = ?, url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    )
    .run(title.trim(), url.trim(), id);
  return result.changes > 0;
}

export function removeLink(db: DatabaseSync, id: number) {
  return db.prepare("DELETE FROM item_links WHERE id = ?").run(id).changes > 0;
}
