import Link from "next/link";
import { PageHeader } from "@/components/shell/PageHeader";

export default function HistoryPage() {
  return (
    <div>
      <PageHeader
        title="History"
        actions={
          <Link
            href="/settings"
            className="inline-flex min-h-12 items-center rounded-input border border-border px-4 text-sm font-semibold text-foreground hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Settings
          </Link>
        }
      />
      <p className="text-muted">
        History list and CSV export arrive in Phase 3.
      </p>
    </div>
  );
}
