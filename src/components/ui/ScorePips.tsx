import { cn } from "@/lib/utils";

type ScorePipsProps = {
  score: number;
  max: number;
  className?: string;
};

export function ScorePips({ score, max, className }: ScorePipsProps) {
  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="img"
      aria-label={`Score ${score} of ${max}`}
    >
      {Array.from({ length: max }, (_, index) => {
        const filled = index < score;
        return (
          <span
            key={index}
            aria-hidden
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              filled
                ? "bg-accent"
                : "border border-dashed border-muted bg-transparent",
            )}
          />
        );
      })}
    </div>
  );
}
