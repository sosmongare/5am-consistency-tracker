"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";

type SignInFormProps = {
  googleEnabled: boolean;
};

export function SignInForm({ googleEnabled }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function onEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);
    try {
      const result = await signIn("nodemailer", {
        email,
        redirect: false,
        callbackUrl: "/today",
      });
      if (result?.error) {
        setStatus("error");
        setMessage("Could not send the sign-in link. Try again.");
        return;
      }
      setStatus("sent");
      setMessage(
        "Check Mailpit at http://localhost:8025 for your sign-in link.",
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
    </div>
  );
}
