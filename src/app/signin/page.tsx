import { SunMark } from "@/components/brand/SunMark";
import { SignInForm } from "@/components/auth/SignInForm";
import { isGoogleAuthEnabled } from "@/auth.config";

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-[420px] rounded-card border border-border bg-surface p-6 md:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <SunMark className="mb-4 h-10 w-16" />
          <h1 className="text-xl font-bold text-foreground">
            5AM Consistency Tracker
          </h1>
          <p className="mt-2 text-sm text-muted">
            Show up at 5. Track the wins that follow.
          </p>
        </div>
        <SignInForm googleEnabled={isGoogleAuthEnabled} />
        <p className="mt-4 text-center text-xs text-muted">
          No password needed. We&apos;ll send a one-time link.
        </p>
      </div>
    </div>
  );
}
