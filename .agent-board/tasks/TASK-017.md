# TASK-017 — Listings page — needs an admin listings endpoint (backend dependency)

Status: Done
Priority: P2
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

The Listings (Annonces) page is mock-only. `GET /v1/listings` is the buyer feed (public, PostGIS-filtered) and lacks admin/moderation fields (reportCount, per-listing order counts). Scope an admin listings surface, then wire.

## Scope

- Decide: add `GET /v1/admin/listings` (all statuses, report counts, moderation) or reuse `GET /v1/listings` with admin scope.
- Once available: wire the listings table + listing drawer; drop mock listings.

## Backend Endpoints

- `GET /v1/admin/listings` — DOES NOT EXIST YET (or extend `/v1/listings`).

## Acceptance Criteria

- [ ] Backend approach recorded in `docs/next-meeting-questions.md`.
- [ ] When available: listings list + detail render real data across all statuses; no mock import remains.
- [ ] `pnpm typecheck` passes.

## Edge Cases

- Expired / paused / sold-out statuses.
- Listing with reports (cross-link to Reports).

## Dependencies

- TASK-002 must be Done.
- TASK-003 must be Done.
- BLOCKED on a backend admin listings surface. Needs TASK-002, TASK-003 once unblocked.

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
