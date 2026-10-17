import { createTextFormatter } from "@/src/infrastructure/llm";

const textFormatter = createTextFormatter();

export function getTextFormatter() {
  return textFormatter;
}
