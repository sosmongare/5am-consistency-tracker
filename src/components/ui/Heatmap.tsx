import { cn } from "@/lib/utils";

export type HeatmapCell = "up" | "missed" | "empty";

type HeatmapProps = {
  /** 7 rows (Mon–Sun) × N columns (weeks). */
  cells: HeatmapCell[][];
  className?: string;
};

export function Heatmap({ cells, className }: HeatmapProps) {
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className="overflow-x-auto"
        role="img"
        aria-label="5 AM wake-up heatmap. Green means up by target, red means missed, empty means not logged."
      >
        <div className="inline-grid gap-1" style={{ gridTemplateColumns: `auto repeat(${cells[0]?.length ?? 0}, minmax(0, 1fr))` }}>
          {cells.map((row, rowIndex) => (
            <div key={dayLabels[rowIndex]} className="contents">
              <span className="pr-2 text-xs text-muted">{dayLabels[rowIndex]}</span>
              {row.map((cell, colIndex) => (
                <span
                  key={`${rowIndex}-${colIndex}`}
                  aria-hidden
                  className={cn(
                    "h-3.5 w-3.5 rounded-sm",
                    cell === "up" && "bg-done",
                    cell === "missed" && "bg-missed",
                    cell === "empty" && "border border-border bg-transparent",
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <ul className="flex flex-wrap gap-3 text-xs text-muted">
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-done" aria-hidden />
          Up by 5 AM
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-missed" aria-hidden />
          Missed
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-border" aria-hidden />
          Not logged
        </li>
      </ul>
    </div>
  );
}
