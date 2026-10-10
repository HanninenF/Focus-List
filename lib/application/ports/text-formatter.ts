export type FormatTodoTextRequest = {
  text: string;
  instructions: string;
};

export interface TextFormatter {
  formatTodoText(request: FormatTodoTextRequest): Promise<string>;
}
