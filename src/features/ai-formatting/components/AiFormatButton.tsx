"use client";

type AiFormatButtonProps = Readonly<{
  loading: boolean;
  disabled: boolean;
  onFormat: () => void;
}>;

export function AiFormatButton({
  loading,
  disabled,
  onFormat,
}: AiFormatButtonProps) {
  return (
    <button
      type="button"
      className="ai-format-button"
      onClick={onFormat}
      disabled={loading || disabled}
    >
      {loading ? "Bearbetar…" : "✦ AI-förslag"}
    </button>
  );
}
