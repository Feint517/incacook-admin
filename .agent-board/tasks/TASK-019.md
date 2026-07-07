# TASK-019 — Remove mock-data generator and delete dead mock leaks

Status: Done
Priority: P2
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Once the pages are wired, delete the mock layer so no screen can silently fall back to fake data.

## Scope

- Delete `lib/mock-data/generator.ts` (and `types.ts` if fully superseded by API view models).
- Grep the repo for any remaining `mock-data` imports and remove them.
- Keep only the pages still legitimately blocked (Orders/Sellers/Listings, TASK-015/016/017) clearly marked "awaiting backend", not mock-backed in prod.

## Backend Endpoints

- n/a

## Acceptance Criteria

- [ ] `grep -r "mock-data" app components` returns only intentionally-blocked pages (or nothing).
- [ ] `pnpm build` + `pnpm typecheck` pass.

## Edge Cases

- A shared type living only in `mock-data/types.ts` still referenced by a wired page.

## Dependencies

- TASK-004 must be Done.
- TASK-005 must be Done.
- TASK-006 must be Done.
- TASK-007 must be Done.
- TASK-008 must be Done.
- TASK-009 must be Done.
- TASK-010 must be Done.
- TASK-011 must be Done.
- Runs after the wireable pages are done (TASK-004…011).

## Verification

- Manual: full app click-through with backend up; no fake numbers.

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
