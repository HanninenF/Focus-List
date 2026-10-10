export function highlightMatches(html: string, query: string) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return html;
  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matcher = new RegExp(`(${escapedQuery})`, "gi");
  return html.split(/(<[^>]+>)/g).map((part) => part.startsWith("<") ? part : part.replace(matcher, "<mark class=\"search-hit\">$1</mark>")).join("");
}

export function makeMarkdownCheckboxesInteractive(html: string) {
  return html.replace(/<input\b([^>]*\btype=["']checkbox["'][^>]*)>/gi, (_match, attributes: string) => {
    const withoutDisabled = attributes.replace(/\sdisabled(?:=(?:""|"disabled"|'disabled'))?/i, "");
    return `<input${withoutDisabled} class="markdown-checkbox">`;
  });
}

export function toggleChecklistItem(title: string, index: number, checked: boolean) {
  const checklistPattern = /(^|\n)(\s*[-*+]\s+)\[([ xX])\](?=\s)/g;
  let matchIndex = 0;
  return title.replace(checklistPattern, (_match, lineStart: string, prefix: string, currentState: string) => {
    const isTarget = matchIndex === index;
    const nextChecked = isTarget ? checked : currentState.toLowerCase() === "x";
    matchIndex += 1;
    return `${lineStart}${prefix}[${nextChecked ? "x" : " "}]`;
  });
}
