export function highlightMatches(html: string, query: string) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return html;
  const queryLower = trimmedQuery.toLowerCase();
  const parts: string[] = [];
  let cursor = 0;
  while (cursor < html.length) {
    const tagStart = html.indexOf("<", cursor);
    if (tagStart < 0) {
      parts.push(html.slice(cursor));
      break;
    }
    if (tagStart > cursor) parts.push(html.slice(cursor, tagStart));
    const tagEnd = findTagEnd(html, tagStart);
    if (tagEnd < 0) {
      parts.push(html.slice(tagStart));
      break;
    }
    parts.push(html.slice(tagStart, tagEnd + 1));
    cursor = tagEnd + 1;
  }
  return parts
    .map((part) => {
      if (part.startsWith("<")) return part;
      let result = "";
      let cursor = 0;
      let matchIndex = part.toLowerCase().indexOf(queryLower);
      while (matchIndex >= 0) {
        result += part.slice(cursor, matchIndex);
        result += `<mark class="search-hit">${part.slice(matchIndex, matchIndex + trimmedQuery.length)}</mark>`;
        cursor = matchIndex + trimmedQuery.length;
        matchIndex = part.toLowerCase().indexOf(queryLower, cursor);
      }
      return result + part.slice(cursor);
    })
    .join("");
}

function findTagEnd(html: string, tagStart: number) {
  let quote: '"' | "'" | null = null;
  for (let index = tagStart + 1; index < html.length; index += 1) {
    const character = html[index];
    if (quote) {
      if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === ">") return index;
  }
  return -1;
}

export function makeMarkdownCheckboxesInteractive(html: string) {
  return html.replace(
    /<input\b([^>]*\btype=["']checkbox["'][^>]*)>/gi,
    (_match, attributes: string) => {
      const withoutDisabled = attributes.replace(
        /\sdisabled(?:=(?:""|"disabled"|'disabled'))?/i,
        "",
      );
      return `<input${withoutDisabled} class="markdown-checkbox">`;
    },
  );
}
