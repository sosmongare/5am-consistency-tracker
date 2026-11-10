import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import type { Provider } from "next-auth/providers";

const googleConfigured =
  Boolean(process.env.AUTH_GOOGLE_ID) &&
  Boolean(process.env.AUTH_GOOGLE_SECRET);

const providers: Provider[] = [
  Nodemailer({
    server: {
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT ?? 1025),
      auth:
        process.env.EMAIL_SERVER_USER || process.env.EMAIL_SERVER_PASSWORD
          ? {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD,
            }
          : undefined,
    },
    from: process.env.EMAIL_FROM ?? "5am@localhost",
  }),
];

if (googleConfigured) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  );
}

/**
 * Edge-safe Auth.js config used by middleware.
 * Prisma adapter and Node-only events live in auth.ts.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isSignedIn = Boolean(auth);

      const isPublic =
        pathname.startsWith("/signin") ||
        pathname.startsWith("/api/auth") ||
        pathname === "/favicon.ico";

      if (isPublic) {
        return true;
      }

      return isSignedIn;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;

export const isGoogleAuthEnabled = googleConfigured;
