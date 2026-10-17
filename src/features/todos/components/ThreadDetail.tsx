"use client";

import type { Item } from "@/src/core/domain/item";
import { MarkdownText } from "@/src/features/markdown/components/MarkdownText";
import { Tip } from "@/src/shared/ui/Tip";
import React from "react";

type ThreadDetailProps = Readonly<{
  id: string;
  item: Item;
  childItems: Item[];
  searchQuery: string;
  onNewChild: () => void;
  onRemove: (id: number) => void;
  onToggleChild: (item: Item) => void;
  onToggleMarkdownCheckbox: (
    item: Item,
    index: number,
    checked: boolean,
  ) => void;
  onStartChildEdit: (item: Item) => void;
  onManageLinks: (item: Item) => void;
}>;

export function ThreadDetail({
  id,
  item,
  childItems,
  searchQuery,
  onNewChild,
  onRemove,
  onToggleChild,
  onToggleMarkdownCheckbox,
  onStartChildEdit,
  onManageLinks,
}: ThreadDetailProps): React.JSX.Element {
  return (
    <div className="thread-detail" id={id}>
      <div className="detail-line">
        <span className="line-dot" />
        <span className="detail-hint">
          UNDERINLÄGG <b>{childItems.length}</b>
        </span>
      </div>
      <div className="thread-detail-actions">
        <Tip title="Skapa underinlägg">
          <button
            type="button"
            className="open-composer"
            onClick={(event) => {
              event.currentTarget.blur();
              onNewChild();
            }}
          >
            ＋ Nytt underinlägg
          </button>
        </Tip>
        <Tip title="Ta bort hela tråden">
          <button
            type="button"
            className="delete-thread"
            onClick={() => onRemove(item.id)}
          >
            Ta bort tråd
          </button>
        </Tip>
      </div>
      {childItems.map((child) => (
        <div className="child-row" key={child.id}>
          {child.hasCheckbox ? (
            <Tip
              title={
                child.completed ? "Markera som pågående" : "Markera som klar"
              }
            >
              <button
                className={`child-check ${child.completed ? "checked" : ""}`}
                type="button"
                aria-label={
                  child.completed
                    ? "Markera underinlägget som pågående"
                    : "Markera underinlägget som klart"
                }
                onClick={() => onToggleChild(child)}
              >
                {child.completed ? "✓" : ""}
              </button>
            </Tip>
          ) : (
            <span className="child-bullet">—</span>
          )}
          <MarkdownText
            value={child.title}
            className={child.completed ? "child-done" : ""}
            highlightQuery={searchQuery}
            onCheckboxToggle={(index, checked) =>
              onToggleMarkdownCheckbox(child, index, checked)
            }
          />
          <div className="item-actions">
            <Tip title="Redigera underinlägg">
              <button
                type="button"
                className="edit-item"
                onClick={() => onStartChildEdit(child)}
                aria-label="Redigera underinlägg"
              >
                ✎
              </button>
            </Tip>
            <Tip title="Hantera länkar">
              <button
                type="button"
                className="links-item"
                onClick={(event) => {
                  event.currentTarget.blur();
                  onManageLinks(child);
                }}
                aria-label="Hantera länkar för underinlägg"
              >
                🔗 Länkar
              </button>
            </Tip>
            <Tip title="Ta bort underinlägg">
              <button
                type="button"
                className="remove"
                onClick={() => onRemove(child.id)}
                aria-label="Ta bort underinlägg"
              >
                ×
              </button>
            </Tip>
          </div>
        </div>
      ))}
    </div>
  );
}
