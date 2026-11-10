# 5AM Consistency Tracker

Responsive web app that helps one person build a 5 AM wake-up habit and track daily wins, streaks, and weekly reviews.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma
- Auth.js (email magic link + optional Google)
- Zod, date-fns-tz, Vitest

Docker Compose will return in a later phase for packaging. For now, run Postgres on the host.

## Prerequisites

- Node.js 22+
- PostgreSQL 16+ running locally

## Environment

Copy `.env.example` to `.env`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | Auth.js secret (long random string) |
| `AUTH_URL` | App URL, e.g. `http://localhost:3000` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Optional Google OAuth |
| `EMAIL_SERVER_*` / `EMAIL_FROM` | Optional SMTP. If unset, magic-link URLs print to the server console in development |

## Local development

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

- App: http://localhost:3000
- Without SMTP, request a sign-in link and copy the URL from the terminal running `npm run dev`

## Tests

```bash
npm test
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm test` | Vitest (scoring) |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Prisma migrate (dev) |
| `npm run db:seed` | Seed demo user + defaults |
| `npm run db:studio` | Prisma Studio |

## Phase status

- Phase 1: schema, auth, theme, shell, scoring tests
- Phase 2 (current): Sign in, Today, Week + persistence
- Phase 3+: Stats, History, Settings, PWA/push, polish/CI, Docker packaging
