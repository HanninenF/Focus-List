"use client";

import { useRouter } from "next/navigation";
import type { Item, ThreadView } from "@/src/core/domain/item";
import type { FocusArea } from "@/src/core/domain/focus-area";
import { Tip } from "@/src/shared/ui/Tip";
import { toFocusSlug } from "@/src/shared/utilities/focus-slug";

type SidebarProps = Readonly<{
  displayedFocusName: string;
  currentFocus?: FocusArea;
  focusAreas: FocusArea[];
  roots: Item[];
  threadView: ThreadView;
  showNewFocus: boolean;
  newFocusName: string;
  onToggleNewFocus: () => void;
  onNewFocusNameChange: (value: string) => void;
  onCreateFocus: (event: React.FormEvent<HTMLFormElement>) => void;
  onThreadViewChange: (view: ThreadView) => void;
  isRootDone: (id: number) => boolean;
}>;

export function Sidebar({
  displayedFocusName,
  currentFocus,
  focusAreas,
  roots,
  threadView,
  showNewFocus,
  newFocusName,
  onToggleNewFocus,
  onNewFocusNameChange,
  onCreateFocus,
  onThreadViewChange,
  isRootDone,
}: SidebarProps) {
  const router = useRouter();
  const activeRoots = roots.filter((item) => !isRootDone(item.id));
  const completedRoots = roots.filter((item) => isRootDone(item.id));

  return (
    <aside className="sidebar">
      <div className="brand">
        <Tip title="Starta nytt fokusområde" placement="right">
          <button
            type="button"
            className="brand-mark"
            onClick={onToggleNewFocus}
          >
            ＋
          </button>
        </Tip>
        <span>{displayedFocusName}</span>
      </div>
      <div className="focus-switcher">
        <label htmlFor="focus-area-select">FOKUSOMRÅDE</label>
        <Tip title="Byt fokusområde">
          <select
            id="focus-area-select"
            value={currentFocus?.name ?? ""}
            onChange={(event) =>
              router.push(`/focus/${toFocusSlug(event.target.value)}`)
            }
          >
            {focusAreas.map((area) => (
              <option value={area.name} key={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </Tip>
        {showNewFocus && (
          <form className="new-focus-form" onSubmit={onCreateFocus}>
            <input
              aria-label="Namn på nytt fokusområde"
              value={newFocusName}
              onChange={(event) => onNewFocusNameChange(event.target.value)}
              placeholder="t.ex. Musik"
            />
            <Tip title="Spara fokusområde">
              <button type="submit">Skapa</button>
            </Tip>
          </form>
        )}
      </div>
      <div className="sidebar-label">VY</div>
      <Tip title="Visa alla trådar" placement="right">
        <button
          type="button"
          className={`nav-item ${threadView === "all" ? "active" : ""}`}
          onClick={() => onThreadViewChange("all")}
        >
          <span>☷</span> Alla trådar <b>{roots.length}</b>
        </button>
      </Tip>
      <Tip title="Visa pågående trådar" placement="right">
        <button
          type="button"
          className={`nav-item ${threadView === "active" ? "active" : ""}`}
          onClick={() => onThreadViewChange("active")}
        >
          <span>◷</span> Pågående <b>{activeRoots.length}</b>
        </button>
      </Tip>
      <Tip title="Visa klara trådar" placement="right">
        <button
          type="button"
          className={`nav-item ${threadView === "completed" ? "active" : ""}`}
          onClick={() => onThreadViewChange("completed")}
        >
          <span>✓</span> Klara <b>{completedRoots.length}</b>
        </button>
      </Tip>
      <div className="sidebar-footer">
        <span className="avatar">F</span>
        <div>
          <strong>Fredrik</strong>
          <small>Min arbetsyta</small>
        </div>
        <span className="dots">•••</span>
      </div>
    </aside>
  );
}
