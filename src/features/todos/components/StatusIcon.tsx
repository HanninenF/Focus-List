export function StatusIcon({
  state,
}: Readonly<{ state: "empty" | "started" | "done" }>) {
  if (state === "done")
    return (
      <span className="status-icon done" aria-hidden="true">
        ✓
      </span>
    );
  if (state === "started")
    return (
      <span className="status-icon started" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    );
  return <span className="status-icon" aria-hidden="true" />;
}
