import type { Item } from "@/src/core/domain/item";

type ProgressSummaryProps = Readonly<{
  focusName: string;
  roots: Item[];
  isRootDone: (id: number) => boolean;
}>;

export function ProgressSummary({
  focusName,
  roots,
  isRootDone,
}: ProgressSummaryProps) {
  const completedCount = roots.filter((item) => isRootDone(item.id)).length;
  const progress = roots.length ? (completedCount / roots.length) * 100 : 0;

  return (
    <div className="intro">
      <div>
        <h2>{focusName}</h2>
        <p>Små steg blir stora framsteg.</p>
      </div>
      <div className="progress">
        <span>DINA FRAMSTEG</span>
        <strong>
          {completedCount}
          <em> / {roots.length || 0}</em>
        </strong>
        <div className="progress-bar">
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
