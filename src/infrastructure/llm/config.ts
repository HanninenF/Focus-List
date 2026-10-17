export type LlmProvider = "openai-compatible" | "ollama" | "gemini";

export type LlmProviderConfig = Readonly<{
  apiKey?: string;
  apiUrl: string;
  model: string;
}>;

export type LlmFactoryConfig = Readonly<{
  provider: LlmProvider;
  apiKey?: string;
  apiUrl?: string;
  model?: string;
}>;
