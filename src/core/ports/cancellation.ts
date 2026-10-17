export interface CancellationToken {
  onCancel(listener: () => void): () => void;
}
