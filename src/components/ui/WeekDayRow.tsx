import { ScorePips } from "@/components/ui/ScorePips";
import { cn } from "@/lib/utils";

type WeekDayRowProps = {
  label: string;
  wakeTime: string;
  score: number | null;
  max: number;
  isToday?: boolean;
  isFuture?: boolean;
  className?: string;
};

export function WeekDayRow({
  label,
  wakeTime,
  score,
  max,
  isToday = false,
  isFuture = false,
  className,
}: WeekDayRowProps) {
  return (
    <div
      className={cn(
        "flex min-h-12 items-center gap-3 rounded-win bg-surface px-4 py-3",
        isToday && "ring-1 ring-accent",
        isFuture && "opacity-50",
        className,
      )}
    >
      <span className="w-16 text-sm font-semibold text-foreground">{label}</span>
      <span className="w-12 text-sm text-muted">{wakeTime}</span>
      <ScorePips score={score ?? 0} max={max} className="flex-1 justify-center" />
      <span className="w-10 text-right text-sm font-semibold text-foreground">
        {score === null ? "–" : `${score}/${max}`}
      </span>
    </div>
  );
}
