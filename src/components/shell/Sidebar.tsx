"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SunMark } from "@/components/brand/SunMark";

const links = [
  { href: "/today", label: "Today" },
  { href: "/week", label: "Week" },
  { href: "/stats", label: "Stats" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[220px] shrink-0 border-r border-border bg-background lg:flex lg:flex-col">
      <div className="flex items-center gap-3 px-5 py-6">
        <SunMark className="h-8 w-8 text-accent" />
        <div>
          <p className="text-sm font-bold text-foreground">5AM</p>
          <p className="text-xs text-muted">Consistency Tracker</p>
        </div>
      </div>
      <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 px-3 pb-6">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex min-h-12 items-center rounded-xl px-3 text-sm font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "bg-surface text-accent"
                  : "text-muted hover:bg-surface hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
