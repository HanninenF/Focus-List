"use client";

import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { useEffect, useRef } from "react";
import {
  highlightMatches,
  makeMarkdownCheckboxesInteractive,
} from "@/src/features/markdown/markdown-service";

type MarkdownTextProps = Readonly<{
  value: string;
  className?: string;
  id?: string;
  highlightQuery?: string;
  onCheckboxToggle?: (index: number, checked: boolean) => void;
}>;

export function MarkdownText({
  value,
  className = "",
  id,
  highlightQuery = "",
  onCheckboxToggle,
}: MarkdownTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const parsed = marked.parse(value, { breaks: true });
  let html = DOMPurify.sanitize(typeof parsed === "string" ? parsed : "");
  if (onCheckboxToggle) html = makeMarkdownCheckboxesInteractive(html);
  html = highlightMatches(html, highlightQuery);
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onCheckboxToggle) return;
    const checkboxes = Array.from(
      container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
    );
    const handlers = checkboxes.map((checkbox, index) => {
      const itemText = checkbox.parentElement?.textContent
        ?.replace(/\s+/g, " ")
        .trim();
      checkbox.setAttribute(
        "aria-label",
        itemText ? `Markera: ${itemText}` : `Markdown-checkbox ${index + 1}`,
      );
      const handler = () => onCheckboxToggle(index, checkbox.checked);
      checkbox.addEventListener("change", handler);
      return () => checkbox.removeEventListener("change", handler);
    });
    return () => handlers.forEach((remove) => remove());
  }, [html, onCheckboxToggle]);
  return (
    <div
      ref={containerRef}
      id={id}
      className={`markdown ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
