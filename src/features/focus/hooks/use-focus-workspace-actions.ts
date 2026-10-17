"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  aiFormattingService,
  focusAreaService,
} from "@/src/application/client-services";
import { toFocusSlug } from "@/src/shared/utilities/focus-slug";

type FormSubmitEvent = Readonly<{ preventDefault: () => void }>;

type WorkspaceActionsOptions = Readonly<{
  newFocusName: string;
  setNewFocusName: (value: string) => void;
  setShowNewFocus: (value: boolean) => void;
  setActionError: (value: string) => void;
  setLlmLoading: (value: boolean) => void;
  setLlmError: (value: string) => void;
  setShowMarkdownPreview: (value: boolean) => void;
  llmLoading: boolean;
}>;

export function useFocusWorkspaceActions(options: WorkspaceActionsOptions) {
  const router = useRouter();
  const {
    newFocusName,
    setNewFocusName,
    setShowNewFocus,
    setActionError,
    setLlmLoading,
    setLlmError,
    setShowMarkdownPreview,
    llmLoading,
  } = options;

  const createFocusArea = useCallback(
    async (event: FormSubmitEvent) => {
      event.preventDefault();
      if (!newFocusName.trim()) return;
      setActionError("");
      try {
        await focusAreaService.createFocusArea(newFocusName);
      } catch {
        setActionError("Fokusområdet kunde inte skapas.");
        return;
      }
      router.push(`/focus/${toFocusSlug(newFocusName)}`);
      setNewFocusName("");
      setShowNewFocus(false);
    },
    [newFocusName, router, setActionError, setNewFocusName, setShowNewFocus],
  );

  const formatDraftWithLlm = useCallback(
    async (value: string, setValue: (value: string) => void) => {
      if (!value.trim() || llmLoading) return;
      setLlmLoading(true);
      setLlmError("");
      try {
        setValue(await aiFormattingService.formatTextWithAi(value));
        setShowMarkdownPreview(false);
      } catch (error) {
        setLlmError(
          error instanceof Error
            ? error.message
            : "AI-formateringen misslyckades.",
        );
      } finally {
        setLlmLoading(false);
      }
    },
    [llmLoading, setLlmError, setLlmLoading, setShowMarkdownPreview],
  );

  return { createFocusArea, formatDraftWithLlm };
}
