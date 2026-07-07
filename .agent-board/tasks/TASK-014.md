# TASK-014 — Legal documents management → /v1/admin/legal-documents

Status: In Progress
Priority: P2
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Manage CGU/CGV/charter legal documents: list, view active, create, edit, publish a version.

## Scope

- New route `/legal` + sidebar entry.
- List `GET /v1/admin/legal-documents`, active `GET .../active`, create `POST`, edit `PATCH :id`, publish `POST :id/publish`.

## Backend Endpoints

- `GET /v1/admin/legal-documents`
- `GET /v1/admin/legal-documents/active`
- `POST /v1/admin/legal-documents`
- `PATCH /v1/admin/legal-documents/:id`
- `POST /v1/admin/legal-documents/:id/publish`

## Acceptance Criteria

- [ ] Documents list with which version is active.
- [ ] Create/edit a draft; publish flips the active version.
- [ ] `pnpm typecheck` passes.

## Edge Cases

- Editing a published (immutable?) version.
- Two docs of the same kind published.
- Markdown/HTML body rendering.

## Dependencies

- TASK-002 must be Done.
- TASK-003 must be Done.
- Needs TASK-002, TASK-003. New page.

## Verification

- Manual: draft → publish a legal document; confirm active flips.

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
