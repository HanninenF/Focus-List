"use client";

import { useEffect } from "react";
import type { Item, ThreadView } from "@/src/core/domain/item";
import {
  itemMatchesQuery,
  normalizeSearchQuery,
} from "@/src/features/search/search-service";

type ThreadSearchOptions = Readonly<{
  items: Item[];
  roots: Item[];
  searchQuery: string;
  threadView: ThreadView;
  activeId: number | null;
  activeMatch: number;
  matchCount: number;
  setActiveMatch: (value: number | ((current: number) => number)) => void;
  setActiveId: (value: number | null) => void;
  setMatchCount: (value: number) => void;
}>;

export function useThreadSearch(options: ThreadSearchOptions) {
  useEffect(() => {
    options.setActiveMatch(0);
  }, [options.searchQuery, options.setActiveMatch]);

  useEffect(() => {
    const query = normalizeSearchQuery(options.searchQuery);
    if (!query) return;
    const match = options.roots.find((item) =>
      itemMatchesQuery(item, options.items, query),
    );
    if (match) options.setActiveId(match.id);
  }, [options.items, options.roots, options.searchQuery, options.setActiveId]);

  useEffect(() => {
    const matches = Array.from(
      document.querySelectorAll<HTMLElement>(".search-hit"),
    );
    options.setMatchCount(matches.length);
    matches.forEach((match, index) =>
      match.classList.toggle(
        "search-hit-active",
        index === options.activeMatch,
      ),
    );
    if (matches.length)
      matches[
        Math.min(options.activeMatch, matches.length - 1)
      ]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }, [
    options.activeId,
    options.activeMatch,
    options.items,
    options.searchQuery,
    options.threadView,
    options.setMatchCount,
  ]);

  function moveToMatch(direction: 1 | -1) {
    if (options.matchCount)
      options.setActiveMatch(
        (current) =>
          (current + direction + options.matchCount) % options.matchCount,
      );
  }

  return { moveToMatch };
}
