import { Tip } from "@/src/shared/ui/Tip";

type NewItemFormProps = Readonly<{
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}>;

export function NewItemForm({ value, onChange, onSubmit }: NewItemFormProps) {
  return (
    <form className="new-item" onSubmit={onSubmit}>
      <span>＋</span>
      <input
        aria-label="Ny tråd"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Vad vill du få gjort?"
      />
      <Tip title="Lägg till ny tråd">
        <button type="submit">Lägg till</button>
      </Tip>
    </form>
  );
}
