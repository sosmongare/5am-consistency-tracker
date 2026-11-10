import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  subtext?: ReactNode;
  className?: string;
};

export function StatCard({ label, value, subtext, className }: StatCardProps) {
  return (
    <article
      className={cn(
        "rounded-card border border-border bg-surface p-5",
        className,
      )}
    >
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {subtext ? <div className="mt-1 text-sm text-muted">{subtext}</div> : null}
    </article>
  );
}
