import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AlertBannerProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function AlertBanner({ title, children, className }: AlertBannerProps) {
  return (
    <aside
      role="status"
      className={cn(
        "rounded-card border border-warning-border bg-warning px-4 py-3 text-warning-foreground",
        className,
      )}
    >
      <p className="font-semibold">{title}</p>
      <div className="mt-1 text-sm opacity-95">{children}</div>
    </aside>
  );
}
