# TASK-005 — Users list + detail → /v1/admin/users

Status: In Progress
Priority: P0
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Wire the Users page (list + user drawer) to the real admin user search + lookup.

## Scope

- List: `GET /v1/admin/users?search=&limit=&offset=` into the users table + server pagination/search (TASK-003).
- Detail drawer: `GET /v1/admin/users/:id`.
- Map real user fields (role, city, status, KYC/charter flags) onto the existing `User` view model; drop mock users.

## Backend Endpoints

- `GET /v1/admin/users`
- `GET /v1/admin/users/:id`

## Acceptance Criteria

- [ ] Users table lists real users with working search + pagination.
- [ ] Opening a row loads the real user detail.
- [ ] No `mock-data` import remains on the Users page.
- [ ] `pnpm typecheck` passes.

## Edge Cases

- User with no seller/driver role stub.
- Search with accents (é, à).
- Deleted/suspended user.

## Dependencies

- TASK-002 must be Done.
- TASK-003 must be Done.
- Needs TASK-002, TASK-003.

## Verification

- Manual: search a seeded user, open detail.

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
