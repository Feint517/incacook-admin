# Spec — IncaCook Admin Backoffice

Status: Implemented (retrospective spec, synthesised from the build)
Scope: `incacook-admin` (Next.js 16 admin panel) + the `/v1/admin/*` surface of
`IncaCook-Server` (NestJS) it consumes.

## Problem Statement

IncaCook is an anti-food-waste local food marketplace (buyer / seller / driver
roles) with a NestJS backend and a Flutter mobile app. The backend already
exposes a rich moderation, financial, compliance and catalog surface, but
operators (Admin / Moderator staff) had **no way to actually use it**: the only
admin UI was a mock-data prototype with no authentication and no connection to
the backend. Everything an operator needs to run the marketplace — reviewing
KYC, resolving disputes, moderating reports, managing the supply catalog,
overseeing payouts, defining delivery zones, broadcasting notifications — could
only be done by hand-crafting API calls or editing the database directly. That
is slow, error-prone, and unsafe.

## Solution

A production backoffice: a Next.js admin panel, gated behind a real
Admin/Moderator login, that wires every operator workflow to the live
`/v1/admin/*` backend. Operators sign in and get a single dashboard from which
they can see the whole platform and take every moderation/financial/config
action the backend supports — with real data, loading/empty/error states, and
no fake numbers anywhere. Where the backend lacked an admin surface for a
workflow that clearly needed one (drivers, subscriptions, payouts, delivery
zones), the endpoint was added so the panel could cover it.

## User Stories

Actors: **Admin** (full access), **Moderator** (moderation subset), and the
**operator** (either) as the generic backoffice user.

### Authentication & access
1. As an operator, I want to log in with my email/password, so that only staff can reach the backoffice.
2. As an operator, I want unauthenticated visits to any dashboard route to redirect me to the login page, so that no admin surface leaks to anonymous users.
3. As an operator, I want a valid non-admin account (buyer/seller/driver) to be rejected with a clear message, so that only Admin/Moderator roles get in.
4. As an operator, I want my session restored on refresh and silently refreshed on token expiry, so that I'm not logged out mid-task.
5. As an operator, I want a logout control that clears my session, so that I can end my session on shared machines.

### Overview & geography
6. As an operator, I want a dashboard with real KPIs (users, orders, revenue, listings), so that I can gauge platform health at a glance.
7. As an operator, I want revenue/category/city breakdowns and recurring-vs-mono user counts, so that I can understand where activity concentrates.
8. As an operator, I want to filter the overview by period (today / 7d / 30d / all), so that I can compare recent activity.
9. As an operator, I want a France map of per-city activity (orders/revenue), so that I can see geographic distribution.

### Users & moderation
10. As an operator, I want to search and page a list of all users, so that I can find any account.
11. As an operator, I want to open a user and see their profile/role/status, so that I can investigate.
12. As a moderator, I want to view a user's strike history, so that I can judge repeat behaviour.
13. As a moderator, I want to add a strike (with reason/severity), so that I can penalise policy violations.
14. As a moderator, I want to suspend and unsuspend a user, so that I can stop abuse and later reinstate.

### Sellers, drivers, listings
15. As an operator, I want a sellers list with rating, sales, revenue, active listings and subscription tier, so that I can assess seller health.
16. As an operator, I want a drivers list with vehicle, KYC status, online/offline, deliveries, rating, zones and Stripe onboarding, so that I can oversee the delivery fleet.
17. As an operator, I want to filter drivers by KYC status and online state, so that I can find drivers needing attention.
18. As an operator, I want a listings list across all statuses (active/sold-out/expired/paused) with report and order counts, so that I can moderate the catalog of dishes.

### Orders & financials
19. As an operator, I want a global orders list filterable by status/city/seller with search, so that I can locate any order.
20. As an operator, I want an order's status timeline and parties (buyer/seller/driver), so that I can understand its state.
21. As an operator, I want an order's money split (subtotal, fulfillment fee, commission, seller/driver earnings, buyer total) and wallet ledger, so that I can audit the finances of a specific order.

### Moderation surfaces
22. As a moderator, I want a reports queue filterable by status/type, so that I can triage user reports.
23. As a moderator, I want to move a report to resolved/rejected with an admin note, so that I can close it.
24. As a moderator, I want a disputes queue and detail, so that I can adjudicate order disputes.
25. As a moderator, I want to approve-refund / reject / resolve / confirm-allergen / confirm-chargeback-fraud on a dispute, so that I can apply the right outcome.
26. As a moderator, I want a KYC review queue with document previews, so that I can verify seller/driver identity.
27. As a moderator, I want to approve or reject (with reason) a KYC document, so that I can gate onboarding.

### Catalog (B2B supply)
28. As an operator, I want to manage supply-catalog products (create/edit/delete), so that sellers have supplies to buy in the seller app.
29. As an operator, I want to view catalog orders, so that I can see B2B purchasing.
30. As a moderator, I want a catalog-claims (SAV) queue with refund/replacement/reject/resolve actions, so that I can resolve seller complaints about supplies.

### Revenue & payouts
31. As an operator, I want a seller-subscriptions list (status, plan, provider Stripe/RevenueCat, period end, trial), so that I can oversee recurring revenue.
32. As an operator, I want to filter subscriptions by status, so that I can find past-due/expired subscriptions.
33. As an operator, I want per-user wallet balances (available/pending/held/paid-out) for sellers and drivers, so that I can see who is owed what.
34. As an operator, I want a withdrawals/payout history (amount, status, Stripe transfer id), so that I can audit money movement.

### Config & communication
35. As an operator, I want to create/edit/deactivate delivery zones (name, city, order, coordinates), so that drivers can pick operating zones at signup.
36. As an operator, I want to broadcast a push notification to a targeted audience (all/role/category/city/recurring/etc.), so that I can communicate with users.
37. As an operator, I want to manage legal documents (CGU/CGV): list, create a draft, edit, and publish a version, so that legal terms can change without an app release.

### Cross-cutting
38. As an operator, I want every list to show distinct loading, empty and error states (with a correlation id on errors), so that I can tell "no data" from "it broke".
39. As an operator, I want the whole panel in French, so that it matches the operating language.
40. As an operator, I want the panel to render fast from a hosted URL and talk to the live API, so that I can use it from anywhere.

## Implementation Decisions

- **Architecture.** The admin panel is a client-rendered Next.js App-Router app.
  Every page builds static; data is fetched in the browser from the IncaCook
  backend. There is no Next.js server-side data fetching or API routes — the
  backend is the single source of truth.
- **One API client.** All backend access goes through a single typed `lib/api`
  client that decodes the standard success/error envelope
  (`{ success, data, meta, pagination }` / `{ error: { code, message, correlationId, ... } }`)
  and throws a typed `ApiError`. No component calls `fetch` directly.
- **Auth layer.** A session/token store (localStorage, in-memory mirror) with a
  single-flight 401→refresh→replay, an `AuthProvider`/`useAuth`, and a client
  route guard on the dashboard group. Role is read from `GET /v1/users/me`; only
  `ADMIN`/`MODERATOR` pass. Login posts to `/v1/auth/signin`.
- **Shared data layer.** Two hooks the pages build on: `useAdminQuery`
  (server pagination via offset/limit + envelope `hasMore`, debounced search,
  abort-on-change, error mapping) and `useAdminMutation` (action calls). Both
  route through the auth layer so every read/write inherits the bearer +
  single-flight refresh. A shared `DataTable` provides server pagination and the
  loading/empty/error states.
- **Surfaces.** Fifteen routes: overview, geography, users (+ strikes/suspend),
  sellers, drivers, orders (+ order financials), listings, reports, disputes,
  KYC, catalog + catalog-claims, subscriptions, payouts (balances + withdrawals),
  zones, notifications, legal. Each maps to a `/v1/admin/*` (or `/v1/zones`)
  endpoint.
- **Backend additions.** Where no admin endpoint existed for a needed workflow,
  read-only list endpoints were added mirroring the existing `admin/users`
  conventions (Admin/Moderator guard, `?filters&limit&offset`,
  `{ items, limit, offset, hasMore }` envelope hoisted by the server's transform
  interceptor): `GET /v1/admin/{orders, sellers, listings, drivers,
  subscriptions, wallets, withdrawals}`. `admin/wallets` aggregates balances from
  the `WalletEntry` ledger (no balance table exists); `admin/withdrawals` reads
  `WITHDRAWAL`-type ledger entries.
- **Pagination contracts vary by endpoint.** Some admin lists return a bare
  array (client pages / next-only), some return the `{items,hasMore}` envelope
  (server pagination). Pages detect which and adapt; there is no assumed `total`.
- **Data honesty.** Fields the backend does not expose are dropped from the UI,
  never fabricated (e.g. seller hygiene/quality/packaging scores; listing
  `portionsTotal`; order line-item breakdown). Derived fields (listing status,
  subscription tier, provider) are computed from real columns.
- **Backend fixes made in support.** CORS reflects the request origin (was
  emitting no `Access-Control-Allow-Origin` under `*` + credentials, blocking all
  browser clients); Redis cache reads `REDIS_URL` (was defaulting to
  `localhost`, flooding `ECONNREFUSED` in prod); supply-catalog product/order
  currency defaults to EUR (was `usd`).
- **Deployment.** The panel deploys as a static Next build behind a single
  build-time var `NEXT_PUBLIC_API_BASE_URL` (the backend origin; the app appends
  `/v1`). CORS reflects any origin, so any deploy domain works unchanged.

## Testing Decisions

- **Single, highest seam: the Playwright authed E2E.** Tests drive the real
  browser against the live backend — login once (saved storage state), then
  assert each of the 15 pages renders real data (or a graceful empty/error
  state) with no server error surfaced. This exercises the whole stack (auth →
  query/mutation hooks → API client → live `/v1/admin/*`) through the one seam a
  user actually touches, and is preferred over unit-testing the hooks or client
  in isolation.
- **What makes a good test here:** assert external, user-visible behaviour — a
  page renders, a table has rows or a clean empty state, an action's result
  appears, an error shows a message — never internal shapes or implementation
  details. Backend-free tests cover the auth gate (unauthenticated routes
  redirect to login; login validates); backend-required tests self-skip without
  credentials.
- **Prior art:** the authed suite (`e2e/authed.spec.ts` + `auth.setup.ts`) is the
  reference for adding a page's check — add the route to the covered list; the
  session and pagination assertions are shared. The suite tolerates the live
  backend's transient cold-query 500s via retries, and runs the authed project
  serially to avoid single-dev-server contention.
- **Gates per change:** `pnpm typecheck` + `pnpm build` locally, plus the authed
  E2E against the deployed API.
- **New backend endpoints** are validated by `tsc --noEmit` + `nest build`, and
  by the panel's E2E rendering their data end-to-end once deployed.

## Out of Scope

- **Reviews moderation** and **chat/conversation moderation** — no admin backend
  endpoint exists yet; would need the same "add endpoint + wire page" pass.
- **Write actions beyond what the backend exposes** — e.g. cancelling/refunding a
  subscription, initiating a payout, editing an order. The panel surfaces the
  existing admin actions only.
- **Non-admin roles** — buyer/seller/driver app functionality is the mobile app's
  domain, not the backoffice.
- **Git-integration auto-deploy** — currently manual/CLI deploy (repo access
  pending); documented in `docs/deployment.md`.
- **A materialised wallet-balance table** — balances are aggregated live from the
  ledger; fine at current scale, would want denormalising at very large volume.

## Further Notes

- The panel is fully wired, mock-free, and E2E-green across all 15 surfaces
  (24 board tasks, `.agent-board/`). The mobile app was cross-referenced against
  the backoffice to find gaps; drivers/subscriptions/payouts/zones were the
  surfaced ones and are now covered.
- The live backend intermittently 500s on the first query after idle (Prisma
  pooler reconnect) — an environmental flake absorbed by E2E retries, not a
  product defect.
- Per-feature specs already exist as the board task files under
  `.agent-board/tasks/TASK-0xx.md`; this document is the consolidated view.
