# TASK-010 — Disputes management → /v1/admin/disputes (NEW page)

Status: Backlog
Priority: P0
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Add the order-dispute resolution surface — the richest admin action set and a client blocker.

## Scope

- New route `/disputes` + sidebar entry; list `GET /v1/admin/disputes`, detail `GET /v1/admin/disputes/:id`.
- Resolution actions (dispute-action.dto): `POST :id/approve-refund`, `:id/reject`, `:id/resolve`, `:id/confirm-allergen`, `:id/confirm-chargeback-fraud`.
- Show the linked order + parties; each action behind a confirm dialog with an optional note.

## Backend Endpoints

- `GET /v1/admin/disputes`
- `GET /v1/admin/disputes/:id`
- `POST /v1/admin/disputes/:id/approve-refund`
- `POST /v1/admin/disputes/:id/reject`
- `POST /v1/admin/disputes/:id/resolve`
- `POST /v1/admin/disputes/:id/confirm-allergen`
- `POST /v1/admin/disputes/:id/confirm-chargeback-fraud`

## Acceptance Criteria

- [ ] Disputes list + detail render real data with the linked order.
- [ ] Each of the five actions calls its endpoint and updates dispute state.
- [ ] Actions are confirmed and disabled once the dispute is terminal.
- [ ] `pnpm typecheck` passes.

## Edge Cases

- Acting on an already-resolved dispute.
- Refund on an order already refunded.
- Allergen vs chargeback-fraud mutually exclusive outcomes.

## Dependencies

- TASK-002 must be Done.
- TASK-003 must be Done.
- Needs TASK-002, TASK-003. New page.

## Verification

- Manual: walk a seeded dispute through approve-refund and, separately, reject.

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
