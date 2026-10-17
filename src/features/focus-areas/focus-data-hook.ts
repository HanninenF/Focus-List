"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FocusArea } from "@/src/core/domain/focus-area";
import type { Item } from "@/src/core/domain/item";
import type { CancellationToken } from "@/src/core/ports/cancellation";
import {
  focusAreaService,
  todoService,
} from "@/src/application/client-services";
import { toFocusSlug } from "@/src/shared/utilities/focus-slug";

export function useFocusData(focusName?: string) {
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [dataError, setDataError] = useState("");
  const requestVersion = useRef(0);
  const activeController = useRef<AbortController | null>(null);
  const focusAreasController = useRef<AbortController | null>(null);
  const requestedFocusId = focusName
    ? focusAreas.find((area) => toFocusSlug(area.name) === focusName)?.id
    : undefined;
  const activeFocusId = focusName ? requestedFocusId : focusAreas[0]?.id;

  useEffect(() => {
    const controller = new AbortController();
    focusAreasController.current = controller;
    const cancellation: CancellationToken = {
      onCancel: (listener) => {
        if (controller.signal.aborted) {
          listener();
          return () => undefined;
        }
        controller.signal.addEventListener("abort", listener, { once: true });
        return () => controller.signal.removeEventListener("abort", listener);
      },
    };
    void focusAreaService
      .loadFocusAreas(cancellation)
      .then((nextFocusAreas) => {
        setFocusAreas(nextFocusAreas);
        setDataError("");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setFocusAreas([]);
        setDataError("Fokusområden kunde inte laddas.");
      });
    return () => {
      controller.abort();
      if (focusAreasController.current === controller)
        focusAreasController.current = null;
    };
  }, []);
  const reload = useCallback(async () => {
    const version = ++requestVersion.current;
    activeController.current?.abort();
    if (!activeFocusId) {
      setItems([]);
      return;
    }
    const controller = new AbortController();
    activeController.current = controller;
    const cancellation: CancellationToken = {
      onCancel: (listener) => {
        if (controller.signal.aborted) {
          listener();
          return () => undefined;
        }
        controller.signal.addEventListener("abort", listener, { once: true });
        return () => controller.signal.removeEventListener("abort", listener);
      },
    };
    try {
      const nextItems = await todoService.loadItems(
        activeFocusId,
        cancellation,
      );
      if (version === requestVersion.current) {
        setItems(nextItems);
        setDataError("");
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      if (version === requestVersion.current)
        setDataError("Inläggen kunde inte laddas.");
      throw error;
    }
  }, [activeFocusId]);
  useEffect(() => {
    setItems([]);
    void reload().catch(() => undefined);
    return () => activeController.current?.abort();
  }, [reload]);

  return { focusAreas, items, setItems, activeFocusId, reload, dataError };
}
