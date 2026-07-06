# TASK-001 — API client, response envelope, and error codes

Status: Done
Priority: P0
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Build the single typed HTTP client the whole admin app uses to talk to the IncaCook backend, mirroring the mobile wire contract (docs/backend-communication.md). No page may call fetch directly.

## Scope

- Add `lib/api/client.ts`: a `fetch` wrapper with base URL `NEXT_PUBLIC_API_BASE_URL` + `/v1` prefix (fallback `https://incacook-api-production.up.railway.app`).
- Default headers `Content-Type`/`Accept: application/json`; typed `get/post/patch/put/del` helpers that decode the envelope.
- Decode success envelope `{ success, data, meta, pagination }` → return `{ data, pagination }`; decode error envelope `{ success:false, error:{ statusCode, code, message, correlationId, details } }` → throw a typed `ApiError`.
- Add `lib/api/error-codes.ts` with the stable `INCACOOK_*` constants (UNAUTHORIZED, VALIDATION, CONFLICT, NOT_FOUND, FORBIDDEN).
- Add `lib/api/types.ts` for `ApiSuccess`, `ApiError`, `Pagination` (`hasMore`, `total`, `nextCursor`, `page`, `limit`).

## Backend Endpoints

- n/a — infrastructure. Base: `/v1`. Envelope + error shapes per docs/backend-communication.md §3.

## Acceptance Criteria

- [ ] `request()` returns `data` on 2xx `success:true` and throws `ApiError` carrying `code`/`message`/`correlationId` otherwise.
- [ ] Base URL resolves from `NEXT_PUBLIC_API_BASE_URL` with the Railway prod fallback.
- [ ] Pagination object is parsed and returned alongside list data.
- [ ] `pnpm typecheck` passes.

## Edge Cases

- Non-JSON / HTML error body (gateway 502).
- Network timeout / abort.
- Envelope with `success:false` but 2xx status.

## Dependencies

- None (buildable now).


## Verification

- Unit-call the client against local backend `http://127.0.0.1:3001` (a public GET) and log a decoded envelope.

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
