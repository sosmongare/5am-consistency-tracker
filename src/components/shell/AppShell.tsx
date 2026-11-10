import type { ReactNode } from "react";
import { BottomNav } from "@/components/shell/BottomNav";
import { Sidebar } from "@/components/shell/Sidebar";

type AppShellProps = {
  children: ReactNode;
  /** Hide bottom nav (e.g. Settings on phone). */
  hideBottomNav?: boolean;
};

export function AppShell({ children, hideBottomNav = false }: AppShellProps) {
  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <Sidebar />
      <div className="flex min-h-dvh flex-1 flex-col">
        <main
          className={
            hideBottomNav
              ? "mx-auto w-full flex-1 px-5 py-5 md:max-w-[640px] md:px-6 lg:max-w-[1100px] lg:px-8 lg:py-8"
              : "mx-auto w-full flex-1 px-5 py-5 pb-24 md:max-w-[640px] md:px-6 lg:max-w-[1100px] lg:px-8 lg:pb-8 lg:py-8"
          }
        >
          {children}
        </main>
        {hideBottomNav ? null : <BottomNav />}
      </div>
    </div>
  );
}
