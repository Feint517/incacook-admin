# TASK-013 — Broadcast notifications → /v1/admin/notifications/send

Status: Done
Priority: P2
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Add an admin surface to send a push/notification broadcast to a segment.

## Scope

- New route `/notifications` (or a modal from the header) + form matching `send-admin-notification.dto` (title, body, target segment).
- Post `POST /v1/admin/notifications/send`; show success/failure with counts if returned.

## Backend Endpoints

- `POST /v1/admin/notifications/send`

## Acceptance Criteria

- [ ] Form validates required fields and posts a broadcast.
- [ ] Success + error states surfaced (with correlationId on failure).
- [ ] `pnpm typecheck` passes.

## Edge Cases

- Empty target segment.
- Very long body.
- Double-submit guard.

## Dependencies

- TASK-002 must be Done.
- Needs auth (TASK-002).

## Verification

- Manual: send a test broadcast against local backend (dry target).

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
