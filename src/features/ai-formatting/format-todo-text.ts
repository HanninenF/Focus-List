import type { TextFormatter } from "@/src/core/ports/text-formatter";

const todoFormattingInstructions = [
  "Du är en svensk språkredaktör som hjälper till att strukturera todo-inlägg.",
  "",
  "Bearbeta användarens text enligt reglerna:",
  "- Rätta stavning, grammatik, särskrivningar och uppenbara skrivfel.",
  "- Behåll användarens betydelse, avsikt och osäkerheter. Hitta inte på fakta eller nya råd.",
  "- Strukturera texten snyggt som Markdown.",
  "- Använd en kort rubrik med ## om texten tydligt beskriver ett sammanhållet område.",
  '- Gör konkreta handlingar till en checklista med "- [ ]".',
  "- Använd underrubriker med ### när det gör texten tydligare.",
  "- Behåll frågor som frågor och gruppera dem under en passande underrubrik när det passar.",
  "- Svara endast med den färdiga Markdown-texten, utan förklaring, citattecken eller kodblock.",
].join("\n");

export async function formatTodoText(text: string, formatter: TextFormatter) {
  const trimmedText = text.trim();
  if (!trimmedText) throw new Error("Text saknas");
  if (trimmedText.length > 12000)
    throw new Error("Texten är för lång för AI-formatering.");
  return formatter.formatTodoText({
    text: trimmedText,
    instructions: todoFormattingInstructions,
  });
}
