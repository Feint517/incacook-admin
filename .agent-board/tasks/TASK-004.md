# TASK-004 — Dashboard overview → /v1/admin/dashboard/*

Status: Done
Priority: P0
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Replace the mock KPI cards, charts and tiles on the overview page with the real admin dashboard aggregates.

## Scope

- Wire the KPI cards + `overview-activity-chart` to the dashboard endpoints, dropping `lib/mock-data/generator.ts` usage on this page.
- Map each widget to its endpoint: totals→`overview`, users trend→`users`, revenue→`revenue`, category split→`categories`, city split→`cities`, plus `recurring-users` / `mono-users` tiles.

## Backend Endpoints

- `GET /v1/admin/dashboard/overview`
- `GET /v1/admin/dashboard/users`
- `GET /v1/admin/dashboard/revenue`
- `GET /v1/admin/dashboard/categories`
- `GET /v1/admin/dashboard/cities`
- `GET /v1/admin/dashboard/recurring-users`
- `GET /v1/admin/dashboard/mono-users`

## Acceptance Criteria

- [ ] Every overview widget renders from a real endpoint; no `mock-data` import remains on the overview page.
- [ ] Date-range / period query params (see `dashboard-query.dto.ts`) drive the charts where supported.
- [ ] Loading + error states via TASK-003 infra.
- [ ] `pnpm typecheck` + `pnpm build` pass.

## Edge Cases

- Empty ranges (new deployment, zero orders).
- Currency formatting (EUR).
- Timezone of buckets.

## Dependencies

- TASK-002 must be Done.
- TASK-003 must be Done.
- Needs auth (TASK-002) and query infra (TASK-003).

## Verification

- Manual: overview against local backend with seeded data; compare a KPI to a direct curl.

## Test Commands

- `pnpm typecheck`
- `pnpm build`
- `pnpm lint`

## Pass Criteria

- [ ] Local `pnpm typecheck` passes.
- [ ] Local `pnpm build` passes.
- [ ] Manual verification against a local IncaCook-Server (`http://127.0.0.1:3001`) with a seeded admin account.
- [ ] No new `lib/mock-data` import on a wired page.
- [ ] Verification evidence attached (screenshots or curl output).
