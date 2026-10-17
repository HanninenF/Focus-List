"use client";

import { useEffect, useMemo, useState } from "react";
import { FocusHeader } from "@/src/features/focus/components/FocusHeader";
import { Sidebar } from "@/src/features/focus/components/Sidebar";
import { ProgressSummary } from "@/src/features/focus/components/ProgressSummary";
import { ComposerDialogs } from "@/src/features/focus/components/ComposerDialogs";
import { LinksDialog } from "@/src/features/links/components/LinksDialog";
import { useFocusData } from "@/src/features/focus-areas/focus-data-hook";
import { useFocusWorkspaceState } from "@/src/features/focus/hooks/use-focus-workspace-state";
import {
  rootItems,
  childrenOf as getChildrenOf,
  isRootDone as getIsRootDone,
  isRootStarted as getIsRootStarted,
} from "@/src/features/todos/todo-rules";
import { ThreadList } from "@/src/features/todos/components/ThreadList";
import { NewItemForm } from "@/src/features/todos/components/NewItemForm";
import { useTodoActions } from "@/src/features/todos/hooks/use-todo-actions";
import { itemMatchesQuery } from "@/src/features/search/search-service";
import { useThreadSearch } from "@/src/features/search/use-thread-search";
import { useWeather } from "@/src/features/weather/weather-hook";
import { weatherIcon } from "@/src/features/weather/weather-icon";
import { focusNameFromSlug } from "@/src/shared/utilities/focus-slug";
import { Tip } from "@/src/shared/ui/Tip";
import { useFocusWorkspaceActions } from "@/src/features/focus/hooks/use-focus-workspace-actions";

export default function FocusWorkspace({
  focusName,
}: Readonly<{ focusName?: string }>) {
  const { focusAreas, items, setItems, activeFocusId, reload, dataError } =
    useFocusData(focusName);
  const state = useFocusWorkspaceState();
  const [linksItem, setLinksItem] = useState<{ id: number } | null>(null);
  const weather = useWeather();
  const workspaceActions = useFocusWorkspaceActions({
    newFocusName: state.newFocusName,
    setNewFocusName: state.setNewFocusName,
    setShowNewFocus: state.setShowNewFocus,
    setActionError: state.setActionError,
    setLlmLoading: state.setLlmLoading,
    setLlmError: state.setLlmError,
    setShowMarkdownPreview: state.setShowMarkdownPreview,
    llmLoading: state.llmLoading,
  });
  const currentFocus = focusAreas.find((area) => area.id === activeFocusId);
  const displayedFocusName = currentFocus?.name ?? focusNameFromSlug(focusName);
  const roots = useMemo(() => rootItems(items), [items]);
  const childrenOf = (id: number) => getChildrenOf(items, id);
  const isRootDone = (id: number) => getIsRootDone(items, id);
  const isRootStarted = (id: number) => getIsRootStarted(items, id);

  useEffect(() => {
    state.setTodayLabel(
      new Intl.DateTimeFormat("sv-SE", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
        .format(new Date())
        .toUpperCase(),
    );
  }, []);
  const { moveToMatch } = useThreadSearch({
    items,
    roots,
    searchQuery: state.searchQuery,
    threadView: state.threadView,
    activeId: state.activeId,
    activeMatch: state.activeMatch,
    matchCount: state.matchCount,
    setActiveMatch: state.setActiveMatch,
    setActiveId: state.setActiveId,
    setMatchCount: state.setMatchCount,
  });

  const actions = useTodoActions({
    activeFocusId,
    draft: state.draft,
    detailDraft: state.detailDraft,
    detailHasCheckbox: state.detailHasCheckbox,
    editDraft: state.editDraft,
    activeId: state.activeId,
    items,
    setItems,
    setDraft: state.setDraft,
    setDetailDraft: state.setDetailDraft,
    setDetailHasCheckbox: state.setDetailHasCheckbox,
    setShowMarkdownPreview: state.setShowMarkdownPreview,
    setComposerParentId: state.setComposerParentId,
    setEditingId: state.setEditingId,
    setEditingChildId: state.setEditingChildId,
    setEditDraft: state.setEditDraft,
    setActiveId: state.setActiveId,
    reload,
    isRootDone,
    setActionError: state.setActionError,
  });
  const visibleRoots = roots
    .filter(
      (item) =>
        state.threadView === "all" ||
        (state.threadView === "active"
          ? !isRootDone(item.id)
          : isRootDone(item.id)),
    )
    .filter((item) => itemMatchesQuery(item, items, state.searchQuery));
  return (
    <main className="app-shell">
      <Sidebar
        displayedFocusName={displayedFocusName}
        currentFocus={currentFocus}
        focusAreas={focusAreas}
        roots={roots}
        threadView={state.threadView}
        showNewFocus={state.showNewFocus}
        newFocusName={state.newFocusName}
        onToggleNewFocus={() => state.setShowNewFocus(!state.showNewFocus)}
        onNewFocusNameChange={state.setNewFocusName}
        onCreateFocus={workspaceActions.createFocusArea}
        onThreadViewChange={state.setThreadView}
        isRootDone={isRootDone}
      />
      <section className="content">
        <FocusHeader
          todayLabel={state.todayLabel}
          weather={weather}
          weatherIcon={weatherIcon}
          searchOpen={state.searchOpen}
          searchQuery={state.searchQuery}
          matchCount={state.matchCount}
          activeMatch={state.activeMatch}
          onSearchOpen={() => {
            state.setSearchOpen(!state.searchOpen);
            if (state.searchOpen) state.setSearchQuery("");
          }}
          onSearchChange={state.setSearchQuery}
          onSearchKeyDown={(event) => {
            if (event.key === "Escape") {
              state.setSearchQuery("");
              state.setSearchOpen(false);
            }
          }}
          onMoveMatch={moveToMatch}
          onCloseSearch={() => {
            state.setSearchQuery("");
            state.setSearchOpen(false);
          }}
        />
        <ProgressSummary
          focusName={displayedFocusName}
          roots={roots}
          isRootDone={isRootDone}
        />
        <NewItemForm
          value={state.draft}
          onChange={state.setDraft}
          onSubmit={(event) => actions.createTodo(event)}
        />
        <div className="list-head">
          <span>
            TRÅDAR <b>{visibleRoots.length}</b>
          </span>
          <Tip title="Byt trådvy">
            <button
              type="button"
              onClick={() =>
                state.setThreadView(
                  state.threadView === "all" ? "active" : "all",
                )
              }
            >
              {state.threadView === "all" ? "Dölj klara" : "Visa alla"}　⌄
            </button>
          </Tip>
        </div>
        <ThreadList
          roots={visibleRoots}
          activeId={state.activeId}
          editingId={state.editingId}
          editDraft={state.editDraft}
          searchQuery={state.searchQuery}
          childrenOf={childrenOf}
          isRootDone={isRootDone}
          isRootStarted={isRootStarted}
          onSelect={state.setActiveId}
          onToggleRoot={actions.toggleRoot}
          onToggleChild={actions.toggleChild}
          onToggleMarkdownCheckbox={actions.toggleMarkdownCheckbox}
          onStartEdit={actions.startEdit}
          onStartChildEdit={actions.startChildEdit}
          onSaveEdit={actions.saveEdit}
          onSetEditingId={state.setEditingId}
          onSetEditDraft={state.setEditDraft}
          onRemove={actions.remove}
          onNewChild={(id) => {
            state.setDetailDraft("");
            state.setDetailHasCheckbox(true);
            state.setShowMarkdownPreview(false);
            state.setComposerParentId(id);
          }}
          onManageLinks={(item) => setLinksItem({ id: item.id })}
        />
        <footer className="tip">
          <span>✦</span>
          <p>
            <strong>Tips:</strong> Klicka på en tråd för att bryta ner den i
            mindre steg.
          </p>
        </footer>
        {(dataError || state.actionError) && (
          <p className="llm-error" role="alert">
            {dataError || state.actionError}
          </p>
        )}
        <ComposerDialogs
          composerParentId={state.composerParentId}
          editingChildId={state.editingChildId}
          detailDraft={state.detailDraft}
          detailHasCheckbox={state.detailHasCheckbox}
          editDraft={state.editDraft}
          showMarkdownPreview={state.showMarkdownPreview}
          llmLoading={state.llmLoading}
          llmError={state.llmError}
          onCloseComposer={() => state.setComposerParentId(null)}
          onCloseEdit={() => state.setEditingChildId(null)}
          onDetailDraftChange={state.setDetailDraft}
          onDetailHasCheckboxChange={state.setDetailHasCheckbox}
          onEditDraftChange={state.setEditDraft}
          onTogglePreview={() =>
            state.setShowMarkdownPreview(!state.showMarkdownPreview)
          }
          onCreate={(event) =>
            actions.createTodo(event, state.composerParentId)
          }
          onSaveEdit={(event) =>
            state.editingChildId !== null &&
            actions.saveEdit(event, state.editingChildId)
          }
          onFormatDetail={() =>
            workspaceActions.formatDraftWithLlm(
              state.detailDraft,
              state.setDetailDraft,
            )
          }
          onFormatEdit={() =>
            workspaceActions.formatDraftWithLlm(
              state.editDraft,
              state.setEditDraft,
            )
          }
        />
        <LinksDialog
          itemId={linksItem?.id ?? null}
          onClose={() => setLinksItem(null)}
        />
      </section>
    </main>
  );
}
