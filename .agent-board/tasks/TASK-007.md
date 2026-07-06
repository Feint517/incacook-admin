# TASK-007 — Reports moderation → /v1/admin/reports

Status: In Progress
Priority: P1
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Wire the Signalements (reports) page + drawer to the real moderation report queue with status transitions.

## Scope

- List: `GET /v1/admin/reports` (filter by status/type) into the reports table.
- Drawer: change status via `PATCH /v1/admin/reports/:id/status` (open → review → resolved) with resolution notes.
- Drop mock reports.

## Backend Endpoints

- `GET /v1/admin/reports`
- `PATCH /v1/admin/reports/:id/status`

## Acceptance Criteria

- [ ] Reports list renders real reports with status/type filters.
- [ ] Status transition persists and the row updates.
- [ ] No `mock-data` import remains on the Reports page.
- [ ] `pnpm typecheck` passes.

## Edge Cases

- Report on a deleted entity.
- Concurrent status change by another moderator.
- Invalid transition rejected by backend.

## Dependencies

- TASK-002 must be Done.
- TASK-003 must be Done.
- Needs TASK-002, TASK-003.

## Verification

- Manual: move a seeded report open→review→resolved.

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
