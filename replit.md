# RewardsRiver Cash

A FreeCash-style rewards web app for Malawi — users complete offers from the RewardsRiver offerwall to earn points, then cash out via Airtel Money or TNM Mpamba mobile money through PayChangu.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port assigned by workflow)
- `pnpm --filter @workspace/rewards-app run dev` — run the frontend (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Wouter routing
- API: Express 5 with Helmet (security headers) + express-rate-limit
- DB: PostgreSQL (Replit built-in) + Drizzle ORM
- Auth: Supabase Auth (JWT) — server validates tokens via Supabase Admin SDK
- Offerwall: RewardsRiver (HMAC-verified postbacks)
- Payments: PayChangu mobile money disbursement (Airtel Money + TNM Mpamba)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — DB schema (users.ts, transactions.ts, withdrawals.ts)
- `artifacts/api-server/src/routes/` — auth, users, offerwall, withdrawals, leaderboard
- `artifacts/api-server/src/lib/` — supabase.ts, auth.ts (middleware), paychangu.ts
- `artifacts/rewards-app/src/pages/` — home, login, register, dashboard, earn, withdraw, leaderboard, transactions
- `artifacts/rewards-app/src/hooks/use-auth.ts` — localStorage JWT helper

## Architecture decisions

- Supabase Auth handles registration/login JWTs; the Express server validates tokens using the Supabase Admin SDK on every authenticated request. App user profiles are stored in Replit's built-in PostgreSQL via Drizzle.
- Points economy: 100 points = 1 MWK. Minimum withdrawal is 5,000 points (50 MWK).
- RewardsRiver postback endpoint (`GET /api/offerwall/postback`) is HMAC-verified using `REWARDSRIVER_SECRET_KEY` and idempotent via `external_transaction_id` to prevent duplicate credit.
- PayChangu disbursement is fire-and-forget (non-blocking): withdrawal is recorded immediately, then PayChangu is called async. On failure, points are automatically refunded.
- Rate limiting: 200 req/15min globally, 20 req/15min on auth endpoints to prevent brute force.

## Product

- Landing page with hero, how-it-works, offerwall preview, leaderboard teaser
- Registration with email, password, username, and Malawi mobile number
- Dashboard: live points balance, stats (total earned, withdrawn, rank, offers completed)
- Earn page: embedded RewardsRiver offerwall iframe with signed user token
- Withdraw page: cash out to Airtel Money or TNM Mpamba, withdrawal history
- Leaderboard: top 20 earners
- Transaction history: full earn/withdraw log

## Required Secrets

Add these in the Secrets panel before going live:
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
- `PAYCHANGU_SECRET_KEY` — PayChangu merchant secret key
- `REWARDSRIVER_APP_ID` — RewardsRiver offerwall app ID
- `REWARDSRIVER_SECRET_KEY` — RewardsRiver offerwall secret (for HMAC verification)

## Gotchas

- The API server will throw on startup if `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are not set. Add them in Secrets first.
- RewardsRiver postback URL to configure: `https://<your-domain>/api/offerwall/postback`
- PayChangu disbursement endpoint used: `POST https://api.paychangu.com/disbursement`
- Run `pnpm --filter @workspace/db run push` after any schema changes in `lib/db/src/schema/`
- Always run `pnpm run typecheck:libs` after schema changes before typechecking `api-server`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
