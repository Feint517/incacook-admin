# TASK-015 — Orders page — needs an admin orders endpoint (backend dependency)

Status: Done
Priority: P2
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

The Orders (Commandes) page is mock-only and there is no `/v1/admin/orders` list endpoint today (only `/v1/admin/catalog/orders` and per-role order endpoints). Scope the backend endpoint, then wire.

## Scope

- Confirm with backend whether to add `GET /v1/admin/orders` (global, filterable by status/city/seller) or expose an existing surface.
- Once available: wire the orders table + order drawer; drop mock orders.
- Until then this task stays Blocked; do not fake it with mock data.

## Backend Endpoints

- `GET /v1/admin/orders` — DOES NOT EXIST YET (backend work required).

## Acceptance Criteria

- [ ] Backend endpoint decision recorded in `docs/next-meeting-questions.md`.
- [ ] When endpoint exists: orders list + detail render real data with filters; no mock import remains.
- [ ] `pnpm typecheck` passes.

## Edge Cases

- Large order volume (server pagination).
- Multi-role parties on one order.

## Dependencies

- TASK-002 must be Done.
- TASK-003 must be Done.
- BLOCKED on a backend endpoint that is not implemented. Needs TASK-002, TASK-003 once unblocked.

## Verification

- Manual once the endpoint lands.

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
