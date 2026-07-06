# TASK-009 — KYC review queue → /v1/admin/kyc/documents (NEW page)

Status: In Progress
Priority: P0
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Add the KYC document review surface — no page exists yet, but the backend + mobile upload flow are live.

## Scope

- New route `/kyc` + sidebar entry.
- Queue: `GET /v1/admin/kyc/documents` (filter via list-admin-kyc-documents.query.dto) with document preview.
- Detail: `GET /v1/admin/kyc/documents/:id`; actions `POST :id/approve`, `POST :id/reject` (reject-kyc-document.dto reason).

## Backend Endpoints

- `GET /v1/admin/kyc/documents`
- `GET /v1/admin/kyc/documents/:id`
- `POST /v1/admin/kyc/documents/:id/approve`
- `POST /v1/admin/kyc/documents/:id/reject`

## Acceptance Criteria

- [ ] Pending KYC docs list with document image/preview.
- [ ] Approve clears the doc from the queue; reject requires a reason and records it.
- [ ] Sidebar shows a KYC entry with a pending count if available.
- [ ] `pnpm typecheck` passes.

## Edge Cases

- Signed-URL document preview expiry.
- Re-review of an already-approved doc.
- Reject without reason (VALIDATION).

## Dependencies

- TASK-002 must be Done.
- TASK-003 must be Done.
- Needs TASK-002, TASK-003. New page — no mock to replace.

## Verification

- Manual: approve + reject a seeded KYC document.

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
