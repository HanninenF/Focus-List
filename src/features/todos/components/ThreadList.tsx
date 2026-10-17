"use client";

import type { Item } from "@/src/core/domain/item";
import { MarkdownText } from "@/src/features/markdown/components/MarkdownText";
import { StatusIcon } from "@/src/features/todos/components/StatusIcon";
import { ThreadDetail } from "@/src/features/todos/components/ThreadDetail";
import { Tip } from "@/src/shared/ui/Tip";

type FormSubmitEvent = Readonly<{ preventDefault: () => void }>;
type ThreadListProps = Readonly<{
  roots: Item[];
  activeId: number | null;
  editingId: number | null;
  editDraft: string;
  searchQuery: string;
  childrenOf: (id: number) => Item[];
  isRootDone: (id: number) => boolean;
  isRootStarted: (id: number) => boolean;
  onSelect: (id: number | null) => void;
  onToggleRoot: (item: Item) => void;
  onToggleChild: (item: Item) => void;
  onToggleMarkdownCheckbox: (
    item: Item,
    index: number,
    checked: boolean,
  ) => void;
  onStartEdit: (item: Item) => void;
  onStartChildEdit: (item: Item) => void;
  onSaveEdit: (event: FormSubmitEvent, id: number) => void;
  onSetEditingId: (id: number | null) => void;
  onSetEditDraft: (value: string) => void;
  onRemove: (id: number) => void;
  onNewChild: (id: number) => void;
  onManageLinks: (item: Item) => void;
}>;

export function ThreadList({
  roots,
  activeId,
  editingId,
  editDraft,
  searchQuery,
  childrenOf,
  isRootDone,
  isRootStarted,
  onSelect,
  onToggleRoot,
  onToggleChild,
  onToggleMarkdownCheckbox,
  onStartEdit,
  onStartChildEdit,
  onSaveEdit,
  onSetEditingId,
  onSetEditDraft,
  onRemove,
  onNewChild,
  onManageLinks,
}: ThreadListProps) {
  return (
    <div className="thread-list">
      {roots.map((item) => {
        const children = childrenOf(item.id);
        const done = isRootDone(item.id);
        const started = isRootStarted(item.id);
        let status: "empty" | "started" | "done" = "empty";
        if (done) status = "done";
        else if (started) status = "started";
        return (
          <article
            className={`thread ${activeId === item.id ? "selected" : ""} ${done ? "is-done" : ""}`}
            key={item.id}
          >
            {editingId === item.id ? (
              <form
                className="edit-row"
                onSubmit={(event) => onSaveEdit(event, item.id)}
              >
                <input
                  value={editDraft}
                  onChange={(event) => onSetEditDraft(event.target.value)}
                />
                <Tip title="Spara ändring">
                  <button type="submit">Spara</button>
                </Tip>
                <Tip title="Avbryt redigering">
                  <button type="button" onClick={() => onSetEditingId(null)}>
                    Avbryt
                  </button>
                </Tip>
              </form>
            ) : (
              <div className="thread-row">
                <button
                  type="button"
                  className="thread-row-toggle"
                  onClick={() =>
                    onSelect(activeId === item.id ? null : item.id)
                  }
                  aria-expanded={activeId === item.id}
                  aria-controls={`thread-detail-${item.id}`}
                  aria-label={activeId === item.id ? "Dölj tråd" : "Visa tråd"}
                  aria-describedby={`thread-title-${item.id}`}
                />
                <div className="thread-row-content">
                  <Tip
                    title={
                      done
                        ? "Markera tråden som pågående"
                        : "Markera tråden som klar"
                    }
                  >
                    <button
                      type="button"
                      className="check-wrap"
                      aria-label={
                        done
                          ? "Markera tråden som pågående"
                          : "Markera tråden som klar"
                      }
                      onClick={() => onToggleRoot(item)}
                    >
                      <StatusIcon state={status} />
                    </button>
                  </Tip>
                  <MarkdownText
                    value={item.title}
                    id={`thread-title-${item.id}`}
                    className="thread-title"
                    highlightQuery={searchQuery}
                    onCheckboxToggle={(index, checked) =>
                      onToggleMarkdownCheckbox(item, index, checked)
                    }
                  />
                  <span className="child-count">
                    {children.length
                      ? `${children.filter((child) => child.completed).length}/${children.length}`
                      : ""}
                  </span>
                  <span className="chevron" aria-hidden="true">
                    {activeId === item.id ? "⌃" : "⌄"}
                  </span>
                  <Tip title="Redigera tråd">
                    <button
                      type="button"
                      className="edit-item"
                      onClick={() => onStartEdit(item)}
                      aria-label="Redigera tråd"
                    >
                      ✎
                    </button>
                  </Tip>
                </div>
              </div>
            )}
            {activeId === item.id && (
              <ThreadDetail
                id={`thread-detail-${item.id}`}
                item={item}
                childItems={children}
                searchQuery={searchQuery}
                onNewChild={() => onNewChild(item.id)}
                onRemove={onRemove}
                onToggleChild={onToggleChild}
                onToggleMarkdownCheckbox={onToggleMarkdownCheckbox}
                onStartChildEdit={onStartChildEdit}
                onManageLinks={onManageLinks}
              />
            )}
          </article>
        );
      })}
      {!roots.length && (
        <div className="empty-state">
          <span>✦</span>
          <p>Listan är tom.</p>
          <small>Lägg till något litet att börja med.</small>
        </div>
      )}
    </div>
  );
}
