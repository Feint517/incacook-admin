# TASK-002 — Admin authentication, session, and route guard

Status: In Progress
Priority: P0
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Gate the whole (dashboard) route group behind a real admin login. Only users the backend recognizes as Admin/Moderator may enter (admin endpoints are guarded by RolesGuard + @Roles(Admin, Moderator)).

## Scope

- Add a `/login` page (outside the `(dashboard)` group) posting to `POST /v1/auth/signin`.
- Store access + refresh tokens; attach the bearer on every `lib/api/client` request; on 401, refresh via `POST /v1/auth/refresh` once then retry, else bounce to `/login`.
- Add a route guard on the `(dashboard)` layout: no session → redirect `/login`; session whose role is not Admin/Moderator → show "not authorized".
- Wire the existing sidebar logout button to clear the session + `POST /v1/auth/signout` and redirect to `/login`.

## Backend Endpoints

- `POST /v1/auth/signin`
- `POST /v1/auth/refresh`
- `POST /v1/auth/signout`
- `GET /v1/users/me` (role check)

## Acceptance Criteria

- [ ] Unauthenticated visit to any dashboard route redirects to `/login`.
- [ ] Login with an Admin/Moderator account lands on the overview; a buyer/seller account is rejected with a clear message.
- [ ] A 401 mid-session triggers exactly one refresh+retry; a failed refresh logs out.
- [ ] Logout clears tokens and returns to `/login`.
- [ ] `pnpm typecheck` passes.

## Edge Cases

- Expired refresh token.
- Role downgraded server-side while logged in.
- Concurrent 401s (single-flight the refresh).

## Dependencies

- TASK-001 must be Done.
- Needs the API client + `ApiError` from TASK-001.

## Verification

- Manual: login as admin, as non-admin, refresh on expiry, logout.

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
