"use client";

import { useState } from "react";
import type { ThreadView } from "@/src/core/domain/item";

export function useFocusWorkspaceState() {
  const [newFocusName, setNewFocusName] = useState("");
  const [showNewFocus, setShowNewFocus] = useState(false);
  const [draft, setDraft] = useState("");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [detailDraft, setDetailDraft] = useState("");
  const [detailHasCheckbox, setDetailHasCheckbox] = useState(true);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const [composerParentId, setComposerParentId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingChildId, setEditingChildId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [threadView, setThreadView] = useState<ThreadView>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMatch, setActiveMatch] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState("");
  const [todayLabel, setTodayLabel] = useState("");
  const [actionError, setActionError] = useState("");

  return {
    newFocusName,
    setNewFocusName,
    showNewFocus,
    setShowNewFocus,
    draft,
    setDraft,
    activeId,
    setActiveId,
    detailDraft,
    setDetailDraft,
    detailHasCheckbox,
    setDetailHasCheckbox,
    showMarkdownPreview,
    setShowMarkdownPreview,
    composerParentId,
    setComposerParentId,
    editingId,
    setEditingId,
    editingChildId,
    setEditingChildId,
    editDraft,
    setEditDraft,
    threadView,
    setThreadView,
    searchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    activeMatch,
    setActiveMatch,
    matchCount,
    setMatchCount,
    llmLoading,
    setLlmLoading,
    llmError,
    setLlmError,
    todayLabel,
    setTodayLabel,
    actionError,
    setActionError,
  };
}
