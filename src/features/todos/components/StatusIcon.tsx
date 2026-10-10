export function StatusIcon({ state }: { state: "empty" | "started" | "done" }) {
  if (state === "done") return <span className="status-icon done" aria-label="Klar">✓</span>;
  if (state === "started") return <span className="status-icon started" aria-label="Påbörjad"><i /><i /><i /></span>;
  return <span className="status-icon" aria-label="Inte påbörjad" />;
}
