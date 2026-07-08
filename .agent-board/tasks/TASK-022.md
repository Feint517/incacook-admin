# TASK-022 — Drivers oversight → /v1/admin/drivers

Status: Done
Priority: P2
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Give admins a driver-role view. Sellers had a management page but drivers —
a full role with vehicle, zones, KYC, Stripe Connect, online status, and
delivery stats — had none. Found by cross-referencing the mobile app + backend
against the backoffice. Required a new backend endpoint (added:
`GET /v1/admin/drivers`).

## Scope

- New route `/drivers` + sidebar entry.
- List drivers via `GET /v1/admin/drivers` (filters: search, kycStatus, online;
  server pagination) with a detail drawer.
- Show vehicle, KYC status, online/offline, deliveries, rating, zones,
  Stripe onboarding, suspended state.

## Backend Endpoints

- `GET /v1/admin/drivers?search=&kycStatus=&online=&limit=&offset=` (Admin/Moderator)
  → item: `{ id, name, email, vehicleType, kycStatus, isOnline, lastSeenAt,
  averageRating, totalDeliveries, stripeOnboardingCompleted, zones[],
  isSuspended, createdAt }`

## Acceptance Criteria

- [ ] Drivers list renders real data with search + kyc + online filters + pagination.
- [ ] Drawer shows vehicle/KYC/zones/deliveries/rating/Stripe/online.
- [ ] `pnpm typecheck` + `pnpm build` pass.
- [ ] Authed E2E `/drivers` renders (green after the endpoint deploys).

## Dependencies

- TASK-002, TASK-003 Done.
- Backend `GET /v1/admin/drivers` deployed (committed; awaits `railway up`).

## Pass Criteria

- [ ] Local `pnpm typecheck` + `pnpm build` pass.
- [ ] Live E2E green once the drivers endpoint is deployed.
