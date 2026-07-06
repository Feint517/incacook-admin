# TASK-006 — User moderation — strikes + suspend/unsuspend

Status: Done
Priority: P1
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Add sanction actions to the user detail: view strike history, add a strike, suspend/unsuspend.

## Scope

- Strike list: `GET /v1/admin/strikes` (+ per-user filter).
- Actions from the user drawer: `POST /v1/admin/users/:userId/strikes` (add-strike.dto), `POST .../suspend` (suspend-user.dto), `POST .../unsuspend`.
- Optimistic status update + confirm dialog; reflect suspended state back in the users table.

## Backend Endpoints

- `GET /v1/admin/strikes`
- `POST /v1/admin/users/:userId/strikes`
- `POST /v1/admin/users/:userId/suspend`
- `POST /v1/admin/users/:userId/unsuspend`

## Acceptance Criteria

- [ ] Adding a strike posts the reason and refreshes the strike list.
- [ ] Suspend/unsuspend flips the user status and the table reflects it.
- [ ] Destructive actions are behind a confirm dialog.
- [ ] `pnpm typecheck` passes.

## Edge Cases

- Suspending an already-suspended user.
- Strike threshold auto-suspend (server-driven).
- Reason validation errors (VALIDATION code).

## Dependencies

- TASK-005 must be Done.
- Builds on the wired Users page (TASK-005).

## Verification

- Manual: add strike, suspend, unsuspend a seeded user.

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
