# Handoff — IncaCook Admin Backoffice

Snapshot for the next agent/developer to pick up cold.

## What this is

A production admin backoffice for **IncaCook** (anti-food-waste marketplace;
buyer/seller/driver roles). Next.js 16 admin panel (`incacook-admin`) wired to
the `/v1/admin/*` surface of the NestJS backend (`IncaCook-Server`). Started as a
mock prototype; now fully wired, mock-free, and E2E-verified against live.

## Repos, branches, sync

| Repo | Path | Branch | Notes |
|---|---|---|---|
| Admin | `~/Documents/Progix/incacook-admin` | `dev` (= `main` bar 1 commit) | pushed to `origin` |
| Backend | `~/Documents/Progix/IncaCook-Server` | `dev` | pushed to `origin` |

- Admin `main` tracks the finished app (ready for Vercel git auto-deploy once
  repo access is sorted). `dev` is the integration branch; task work merges via
  `task/TASK-XXX` branches (see `.agent-board/`).
- Backend `dev` includes an uncommitted-then-committed **deliveries WIP**
  (`0143684` etc.) that belongs to the repo owner — leave it alone; never stage
  `src/modules/deliveries/*`.

## Status: done

- **Admin panel: 24/24 board tasks** (`.agent-board/board.md`). 15 surfaces:
  overview, geography, users(+strikes/suspend), sellers, drivers, orders(+order
  financials), listings, reports, disputes, KYC, catalog(+claims), subscriptions,
  payouts(balances+withdrawals), zones, notifications, legal. No mock data
  anywhere.
- **Backend endpoints added** (all Admin/Moderator, `?filters&limit&offset`,
  `{items,hasMore}`): `GET /v1/admin/{orders,sellers,listings,drivers,
  subscriptions,wallets,withdrawals}`. All deployed and returning live data.
- **Backend fixes deployed**: CORS reflects request origin (was blocking browser
  clients); Redis cache reads `REDIS_URL` (was flooding `ECONNREFUSED`); catalog
  currency `usd→eur`.
- **Deployed**: admin → Vercel (project `incacook-admin`, team `inca-cook`,
  linked via CLI — folder deploy, not git, because the GitHub repo is owned by
  `Feint517`). Backend → Railway (`incacook-api`, `-146b` host).

## How to run / test

```bash
cd incacook-admin
pnpm install
pnpm dev            # local dev (Turbopack — see gotcha below)
pnpm build && pnpm start   # prod build (use this for browser testing)
pnpm e2e            # Playwright authed E2E: login + all 15 pages vs live
```

- E2E creds + API base live in **`.env.local`** (git-ignored): `E2E_API_BASE_URL`,
  `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`. Test admin:
  `libertadhif+claudeadmin2@gmail.com` / `ClaudeAdmin!2026x` (role ADMIN in the
  prod DB — a real test account, not a fixture).
- The single test seam is `e2e/authed.spec.ts` (+ `auth.setup.ts`, saved session).
  To cover a new page: add its route to the array in `authed.spec.ts`.

## Key gotchas (will bite you)

1. **`NEXT_PUBLIC_API_BASE_URL` is build-time** — changing it needs a rebuild/
   redeploy, not just an env edit.
2. **`next dev` (Turbopack) hydration bug** — the app can stick on "Chargement…"
   due to an HMR websocket failure. Use `next start` (prod build) for browser
   testing.
3. **Stale `next start` server** — after a rebuild, kill the old `:3100` server or
   it serves mismatched chunks (500s on route JS). Clean: `rm -rf .next && pnpm
   build`, then one fresh server.
4. **Live backend transient 500s** — first query after idle 500s (Prisma pooler
   reconnect). Not a bug; E2E has `retries: 2` and the authed project runs
   serially to absorb it.
5. **Prod DB is shared/real** — the panel talks to the production Supabase DB via
   the live API. DB writes (role elevation, etc.) are safety-gated; do them via
   the Supabase SQL editor or with explicit authorisation.
6. **pnpm 10 / Node 22** pinned in `package.json` (`engines`/`packageManager`).

## Remaining work (optional)

- **Reviews moderation** and **chat/conversation moderation** — the last two
  gap-scan surfaces. Each needs a new backend admin endpoint + a page (same
  pattern as drivers/subscriptions: add `GET /v1/admin/...` mirroring
  `admin/sellers`, then wire the page + E2E route).
- **Flip Vercel to git auto-deploy** — once the deployer has access to
  `Feint517/incacook-admin` (collaborator invite or fork). Steps in
  `docs/deployment.md`.
- **Merge `dev → main`** on the admin repo after the last commit (currently 1
  ahead) if you want `main` exactly current.

## Where things live

- Board + per-task specs: `.agent-board/` (`board.md`, `tasks/TASK-0xx.md`).
- Consolidated spec/PRD: `docs/specs/admin-backoffice.md`.
- Manual deploy guide: `docs/deployment.md`.
- API client / auth / query hooks: `lib/api`, `lib/auth`, `lib/query`.
- Backend admin endpoints: `IncaCook-Server/src/modules/admin/*` (+ `catalog`,
  `moderation`, `compliance/legal-documents`, `zones`, `wallets`).
