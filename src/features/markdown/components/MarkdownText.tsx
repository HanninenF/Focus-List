"use client";

import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import { highlightMatches, makeMarkdownCheckboxesInteractive } from "@/src/features/markdown/markdown-service";

export function MarkdownText({ value, className = "", highlightQuery = "", onCheckboxToggle }: { value: string; className?: string; highlightQuery?: string; onCheckboxToggle?: (index: number, checked: boolean) => void }) {
  let html = DOMPurify.sanitize(String(marked.parse(value, { breaks: true })));
  if (onCheckboxToggle) html = makeMarkdownCheckboxesInteractive(html);
  html = highlightMatches(html, highlightQuery);
  return <div className={`markdown ${className}`} onClick={(event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== "checkbox" || !onCheckboxToggle) return;
    event.stopPropagation();
    const checkboxes = Array.from(event.currentTarget.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
    const index = checkboxes.indexOf(target);
    if (index >= 0) onCheckboxToggle(index, target.checked);
  }} dangerouslySetInnerHTML={{ __html: html }} />;
}
