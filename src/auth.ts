import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import type { Provider } from "next-auth/providers";
import { prisma } from "@/lib/db";
import { storeDevMagicLink } from "@/lib/dev-magic-link";
import { ensureUserDefaults } from "@/lib/user-bootstrap";
import { authConfig, isGoogleAuthEnabled } from "@/auth.config";

const emailFrom = process.env.EMAIL_FROM ?? "5am@localhost";
const smtpHost = process.env.EMAIL_SERVER_HOST?.trim();

const providers: Provider[] = [
  Nodemailer({
    id: "email",
    name: "Email",
    from: emailFrom,
    server: smtpHost
      ? {
          host: smtpHost,
          port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
          secure: false,
          auth:
            process.env.EMAIL_SERVER_USER || process.env.EMAIL_SERVER_PASSWORD
              ? {
                  user: process.env.EMAIL_SERVER_USER,
                  pass: process.env.EMAIL_SERVER_PASSWORD,
                }
              : undefined,
        }
      : {
          // Unused when sendVerificationRequest is overridden for console mode
          host: "localhost",
          port: 1025,
          secure: false,
        },
    async sendVerificationRequest({ identifier, url }) {
      if (!smtpHost) {
        storeDevMagicLink(identifier, url);
        console.log("\n=== 5AM magic link (dev) ===");
        console.log(`To: ${identifier}`);
        console.log(`URL: ${url}`);
        console.log("============================\n");
        return;
      }

      const nodemailer = await import("nodemailer");
      const transport = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
        secure: false,
        auth:
          process.env.EMAIL_SERVER_USER || process.env.EMAIL_SERVER_PASSWORD
            ? {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
              }
            : undefined,
      });

      await transport.sendMail({
        to: identifier,
        from: emailFrom,
        subject: "Sign in to 5AM Consistency Tracker",
        text: `Sign in: ${url}`,
        html: `<p><a href="${url}">Sign in to 5AM Consistency Tracker</a></p><p>${url}</p>`,
      });
    },
  }),
];

if (isGoogleAuthEnabled) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
  events: {
    async createUser({ user }) {
      if (user.id) {
        await ensureUserDefaults(user.id);
      }
    },
  },
});
