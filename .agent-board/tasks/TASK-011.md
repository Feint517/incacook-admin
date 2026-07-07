# TASK-011 — Catalog claims → /v1/admin/catalog-claims (NEW page)

Status: In Progress
Priority: P1
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Add the B2B supply-catalog claims resolution surface.

## Scope

- New route `/catalog-claims` + sidebar entry; list `GET /v1/admin/catalog-claims`, detail `GET /v1/admin/catalog-claims/:id`.
- Actions: `POST :id/refund`, `:id/request-replacement`, `:id/reject`, `:id/resolve`.

## Backend Endpoints

- `GET /v1/admin/catalog-claims`
- `GET /v1/admin/catalog-claims/:id`
- `POST /v1/admin/catalog-claims/:id/refund`
- `POST /v1/admin/catalog-claims/:id/request-replacement`
- `POST /v1/admin/catalog-claims/:id/reject`
- `POST /v1/admin/catalog-claims/:id/resolve`

## Acceptance Criteria

- [ ] Claims list + detail render real data.
- [ ] Each of the four actions calls its endpoint and reflects the new state.
- [ ] `pnpm typecheck` passes.

## Edge Cases

- Claim already refunded.
- Replacement then reject sequencing.
- Terminal-state guard.

## Dependencies

- TASK-002 must be Done.
- TASK-003 must be Done.
- Needs TASK-002, TASK-003. New page.

## Verification

- Manual: refund + reject a seeded claim.

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
