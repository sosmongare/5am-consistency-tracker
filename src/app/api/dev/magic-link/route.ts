import { NextResponse } from "next/server";
import { readDevMagicLink } from "@/lib/dev-magic-link";

/** Dev-only: return the latest console magic link for the given email. */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const email = new URL(request.url).searchParams.get("email") ?? undefined;
  const stored = readDevMagicLink(email);
  if (!stored) {
    return NextResponse.json({ url: null });
  }

  return NextResponse.json({ url: stored.url, email: stored.email });
}
