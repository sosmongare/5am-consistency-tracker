"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";

type SignInFormProps = {
  googleEnabled: boolean;
  showDevMagicLink: boolean;
};

export function SignInForm({
  googleEnabled,
  showDevMagicLink,
}: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [magicUrl, setMagicUrl] = useState<string | null>(null);

  async function onEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);
    setMagicUrl(null);
    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/today",
      });
      if (result?.error) {
        setStatus("error");
        setMessage(
          "Could not send the sign-in link. Check that Postgres is running and try again.",
        );
        return;
      }

      let resolvedUrl: string | null = null;
      if (showDevMagicLink) {
        // Auth may finish writing the link a moment after the response.
        for (let attempt = 0; attempt < 8; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          const response = await fetch(
            `/api/dev/magic-link?email=${encodeURIComponent(email)}`,
          );
          if (response.ok) {
            const data = (await response.json()) as { url: string | null };
            if (data.url) {
              resolvedUrl = data.url;
              break;
            }
          }
        }
      }

      setMagicUrl(resolvedUrl);
      setStatus("sent");
      setMessage(
        resolvedUrl
          ? "Dev mode: open the link below to sign in."
          : "Sign-in link requested. If nothing appears below, check the server terminal or try again.",
      );
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onEmailSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-muted" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-12 w-full rounded-input border border-border bg-background px-3 text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex min-h-12 w-full items-center justify-center rounded-input bg-accent px-4 text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Email me a sign-in link"}
        </button>
      </form>

      {googleEnabled ? (
        <>
          <p className="text-center text-sm text-muted">or</p>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/today" })}
            className="flex min-h-12 w-full items-center justify-center rounded-input border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:border-accent"
          >
            Continue with Google
          </button>
        </>
      ) : null}

      {message ? (
        <p
          role="status"
          className={
            status === "error"
              ? "text-sm text-warning-foreground"
              : "text-sm text-muted"
          }
        >
          {message}
        </p>
      ) : null}

      {magicUrl ? (
        <a
          href={magicUrl}
          className="block break-all rounded-input border border-accent/40 bg-surface px-4 py-3 text-sm font-semibold text-accent hover:underline"
        >
          Open magic link
        </a>
      ) : null}
    </div>
  );
}
