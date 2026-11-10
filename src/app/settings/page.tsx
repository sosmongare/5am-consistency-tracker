import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { PageHeader } from "@/components/shell/PageHeader";

export default function SettingsPage() {
  return (
    <AppShell hideBottomNav>
      <PageHeader
        title="Settings"
        actions={
          <Link
            href="/history"
            className="inline-flex min-h-12 items-center text-sm font-semibold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            ← Back
          </Link>
        }
      />
      <p className="text-muted">
        Settings editors arrive in Phase 4. On phone this screen uses Back
        instead of the bottom nav; on desktop Settings stays in the sidebar.
      </p>
    </AppShell>
  );
}
