"use client";

import { cn } from "@/lib/utils";

export type WinRowStatus = "DONE" | "MINIMUM" | "MISSED" | "OPEN";

type WinRowProps = {
  name: string;
  detail: string;
  status: WinRowStatus;
  onCycle?: () => void;
  className?: string;
};

const statusCopy: Record<WinRowStatus, string> = {
  DONE: "Done",
  MINIMUM: "Minimum",
  MISSED: "Missed",
  OPEN: "Open",
};

function StatusIcon({ status }: { status: WinRowStatus }) {
  if (status === "DONE") {
    return (
      <span
        aria-hidden
        className="flex h-7 w-7 items-center justify-center rounded-full bg-done text-sm font-bold text-accent-foreground"
      >
        ✓
      </span>
    );
  }
  if (status === "MINIMUM") {
    return (
      <span
        aria-hidden
        className="flex h-7 w-7 items-center justify-center rounded-full bg-minimum text-sm font-bold text-accent-foreground"
      >
        ~
      </span>
    );
  }
  if (status === "MISSED") {
    return (
      <span
        aria-hidden
        className="flex h-7 w-7 items-center justify-center rounded-full bg-missed text-sm font-bold text-foreground"
      >
        ×
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className="h-7 w-7 rounded-full border border-dashed border-muted"
    />
  );
}

export function WinRow({
  name,
  detail,
  status,
  onCycle,
  className,
}: WinRowProps) {
  const labelColor =
    status === "DONE"
      ? "text-done"
      : status === "MINIMUM"
        ? "text-minimum"
        : status === "MISSED"
          ? "text-missed"
          : "text-muted";

  return (
    <button
      type="button"
      onClick={onCycle}
      className={cn(
        "flex min-h-12 w-full items-center gap-3 rounded-win bg-surface px-4 py-3 text-left transition-colors",
        "hover:bg-surface/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className,
      )}
      aria-label={`${name}: ${statusCopy[status]}. ${detail}`}
    >
      <StatusIcon status={status} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">
          {name}
        </span>
        <span className="block text-sm text-muted">{detail}</span>
      </span>
      <span className={cn("text-sm font-semibold", labelColor)}>
        {statusCopy[status]}
      </span>
    </button>
  );
}
