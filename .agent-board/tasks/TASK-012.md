# TASK-012 — Supply catalog products CRUD + orders → /v1/admin/catalog/*

Status: Done
Priority: P2
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Add management of the B2B supply catalog products and a view of catalog orders.

## Scope

- New route `/catalog` + sidebar entry.
- Products: `GET/POST /v1/admin/catalog/products`, `GET/PATCH/DELETE .../products/:id` with a create/edit form.
- Orders: `GET /v1/admin/catalog/orders` (read-only list).

## Backend Endpoints

- `GET /v1/admin/catalog/products`
- `POST /v1/admin/catalog/products`
- `GET /v1/admin/catalog/products/:id`
- `PATCH /v1/admin/catalog/products/:id`
- `DELETE /v1/admin/catalog/products/:id`
- `GET /v1/admin/catalog/orders`

## Acceptance Criteria

- [ ] Products can be listed, created, edited, and deleted.
- [ ] Catalog orders list renders read-only.
- [ ] `pnpm typecheck` passes.

## Edge Cases

- Delete a product referenced by an open order.
- Price/stock validation.
- Image upload (if applicable).

## Dependencies

- TASK-002 must be Done.
- TASK-003 must be Done.
- Needs TASK-002, TASK-003. New page.

## Verification

- Manual: create → edit → delete a product; list orders.

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
