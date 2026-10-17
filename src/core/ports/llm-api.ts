export interface LlmApi {
  requestFormattedText(text: string): Promise<string>;
}
