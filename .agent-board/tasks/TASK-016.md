# TASK-016 — Sellers page — needs an admin sellers endpoint (backend dependency)

Status: Blocked
Priority: P2
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

The Sellers (Vendeurs) page is mock-only. There is no dedicated `/v1/admin/sellers` list; the buyer-facing `GET /v1/sellers` exists but lacks admin fields (revenue, subscription tier, scores). Scope, then wire.

## Scope

- Decide: extend `GET /v1/admin/users?role=seller` + join seller stats, or add `GET /v1/admin/sellers`.
- Once available: wire the sellers table + seller drawer (rating, sales, revenue, hygiene/quality/packaging, subscription tier); drop mock sellers.

## Backend Endpoints

- `GET /v1/admin/sellers` — DOES NOT EXIST YET (or extend `/v1/admin/users`).

## Acceptance Criteria

- [ ] Backend approach recorded in `docs/next-meeting-questions.md`.
- [ ] When available: sellers list + detail render real data; no mock import remains.
- [ ] `pnpm typecheck` passes.

## Edge Cases

- Seller with no listings/sales.
- Subscription tier source (RevenueCat sync).

## Dependencies

- TASK-002 must be Done.
- TASK-003 must be Done.
- BLOCKED on a backend admin sellers surface. Needs TASK-002, TASK-003 once unblocked.

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
