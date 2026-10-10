import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import type { FocusArea } from "@/src/core/domain/focus-area";
import type { Item } from "@/src/core/domain/item";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, "todos.sqlite"));
db.exec("PRAGMA busy_timeout = 10000");
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
)`);

const columns = db.prepare("PRAGMA table_info(items)").all() as unknown as Array<{ name: string }>;
if (!columns.some((column) => column.name === "has_checkbox")) db.exec("ALTER TABLE items ADD COLUMN has_checkbox INTEGER NOT NULL DEFAULT 1");
if (!columns.some((column) => column.name === "focus_area_id")) db.exec("ALTER TABLE items ADD COLUMN focus_area_id INTEGER REFERENCES focus_areas(id)");

let defaultFocus = db.prepare("SELECT id FROM focus_areas WHERE name = ?").get("Mitt fokus") as unknown as { id: number } | undefined;
if (!defaultFocus) {
  try { db.prepare("INSERT INTO focus_areas (name) VALUES (?)").run("Mitt fokus"); } catch { /* En annan route kan ha skapat fokusområdet samtidigt. */ }
  defaultFocus = db.prepare("SELECT id FROM focus_areas WHERE name = ?").get("Mitt fokus") as unknown as { id: number };
}
const unassignedItems = db.prepare("SELECT COUNT(*) as count FROM items WHERE focus_area_id IS NULL").get() as unknown as { count: number };
if (unassignedItems.count > 0) db.prepare("UPDATE items SET focus_area_id = ? WHERE focus_area_id IS NULL").run(defaultFocus.id);

export function getItems(focusId?: number): Item[] {
  const query = "SELECT id, parent_id as parentId, title, completed, has_checkbox as hasCheckbox, focus_area_id as focusId, created_at as createdAt FROM items";
  if (focusId) return db.prepare(`${query} WHERE focus_area_id = ? ORDER BY created_at DESC, id DESC`).all(focusId) as unknown as Item[];
  return db.prepare(`${query} ORDER BY created_at DESC, id DESC`).all() as unknown as Item[];
}
export function addItem(title: string, parentId: number | null, focusId: number, hasCheckbox = true) {
  const statement = db.prepare("INSERT INTO items (title, parent_id, focus_area_id, has_checkbox) VALUES (?, ?, ?, ?)");
  statement.run(title.trim(), parentId, focusId, hasCheckbox ? 1 : 0);
  const row = db.prepare("SELECT last_insert_rowid() as id").get() as unknown as { id: number };
  return Number(row.id);
}
export function getFocusAreas(): FocusArea[] {
  return db.prepare("SELECT id, name, created_at as createdAt FROM focus_areas ORDER BY created_at ASC, id ASC").all() as unknown as FocusArea[];
}
export function addFocusArea(name: string) { return Number(db.prepare("INSERT INTO focus_areas (name) VALUES (?)").run(name.trim()).lastInsertRowid); }
export function setCompleted(id: number, completed: boolean) { db.prepare("UPDATE items SET completed = ? WHERE id = ?").run(completed ? 1 : 0, id); }
export function updateTitle(id: number, title: string) { db.prepare("UPDATE items SET title = ? WHERE id = ?").run(title.trim(), id); }
export function setHasCheckbox(id: number, hasCheckbox: boolean) { db.prepare("UPDATE items SET has_checkbox = ? WHERE id = ?").run(hasCheckbox ? 1 : 0, id); }
export function removeItem(id: number) { db.prepare("DELETE FROM items WHERE id = ? OR parent_id = ?").run(id, id); }
