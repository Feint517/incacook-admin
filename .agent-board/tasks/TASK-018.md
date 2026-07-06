# TASK-018 — Env config, API base URL, and README

Status: Done
Priority: P1
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Make the app configurable per environment and document how to run it against local vs prod backend.

## Scope

- Add `.env.example` with `NEXT_PUBLIC_API_BASE_URL` (local `http://127.0.0.1:3001`, prod Railway).
- Document in `README.md`: prerequisites, `pnpm install`, `pnpm dev`, pointing at a local IncaCook-Server, and the admin login requirement.
- Confirm `next.config.mjs` allows the backend image/host if needed (KYC doc / avatar previews).

## Backend Endpoints

- n/a

## Acceptance Criteria

- [ ] `.env.example` documents every `NEXT_PUBLIC_*` var the app reads.
- [ ] README explains running against local + prod backend and the admin/moderator login.
- [ ] `pnpm build` passes.

## Edge Cases

- Missing env var → clear runtime error, not silent prod fallback in dev.
- Remote image host allowlist.

## Dependencies

- TASK-001 must be Done.
- Pairs with the client (TASK-001).

## Verification

- Manual: run against local backend using `.env.local`.

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
