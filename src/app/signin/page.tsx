import { SunMark } from "@/components/brand/SunMark";
import { SignInForm } from "@/components/auth/SignInForm";
import { isGoogleAuthEnabled } from "@/auth.config";

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <SunMark className="mb-5 h-12 w-20" />
          <h1 className="text-2xl font-bold text-foreground">
            5AM Consistency Tracker
          </h1>
          <p className="mt-2 text-sm text-muted">
            Show up at 5. Track the wins that follow.
          </p>
        </div>
        <SignInForm
          googleEnabled={isGoogleAuthEnabled}
          showDevMagicLink={!process.env.EMAIL_SERVER_HOST}
        />
        <p className="mt-6 text-center text-xs text-muted">
          No password needed. We&apos;ll send a one-time link.
        </p>
      </div>
    </div>
  );
}
