# TASK-003 — Shared data-table query infra (pagination, filters, states)

Status: Done
Priority: P1
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Give every list page one consistent way to fetch server-paginated, filterable data with loading/empty/error states — so wiring the individual pages is thin.

## Scope

- Add a `useAdminQuery` hook (React 19 + `use`/suspense or a small fetch-state hook) wrapping `lib/api/client` with `page/limit/offset` + `search` params and the `pagination` envelope.
- Standardize loading skeleton, empty state, and error (surfacing `ApiError.message` + `correlationId`) for the existing `components/dashboard/data-table.tsx`.
- Server-side pagination + search wired into the TanStack table used by list pages.

## Backend Endpoints

- n/a — infrastructure. Uses the offset/page contract (`page`, `limit`, `total`, `search`, `offset`).

## Acceptance Criteria

- [ ] A list page can fetch page N with a search term and render pagination controls from the envelope `total`/`hasMore`.
- [ ] Loading, empty, and error states render distinctly.
- [ ] `pnpm typecheck` passes.

## Edge Cases

- Empty result set.
- Backend error mid-list.
- Rapid search typing (debounce/abort in-flight).

## Dependencies

- TASK-001 must be Done.
- Needs TASK-001 client + pagination types.

## Verification

- Manual: drive one wired list (Users, TASK-005) through pages + search once it lands.

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
