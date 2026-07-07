# TASK-021 — Driver/delivery zones management → /v1/zones

Status: Done
Priority: P2
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Surface the operating-zone management that only exists via API/DB today.
Drivers pick their operating zones at signup from the admin-defined list
(`GET /v1/zones` → `PUT /v1/drivers/me/zones`), but admins have no UI to
create/rename/reorder/deactivate those zones. This closes that gap (found by
cross-referencing the mobile app against the backoffice).

## Scope

- New route `/zones` + sidebar entry.
- List all zones (incl. inactive) via `GET /v1/zones/all`.
- Create (`POST /v1/zones`), edit (`PUT /v1/zones/:id`), delete/deactivate
  (`DELETE /v1/zones/:id`, soft-deactivate) via `useAdminMutation`.
- Form fields: name (required, unique), city, displayOrder (0–1000),
  lat (−90..90), lng (−180..180), isActive.

## Backend Endpoints

- `GET /v1/zones/all` (Admin) — all zones incl. inactive
- `GET /v1/zones/:id` (Admin)
- `POST /v1/zones` (Admin)
- `PUT /v1/zones/:id` (Admin)
- `DELETE /v1/zones/:id` (Admin) — soft-deactivate

## Acceptance Criteria

- [ ] Zones list renders real data (active + inactive) with an active/inactive indicator.
- [ ] Create a zone (name/city/order/lat/lng/active) via POST.
- [ ] Edit a zone via PUT; toggle isActive.
- [ ] Delete/deactivate a zone behind a confirm dialog.
- [ ] `pnpm typecheck` + `pnpm build` pass.

## Edge Cases

- Duplicate name (unique constraint) → surface the backend error.
- lat/lng optional and range-validated client-side.
- Deactivate vs delete semantics (DELETE soft-deactivates).

## Dependencies

- TASK-002 must be Done.
- TASK-003 must be Done.

## Verification

- Manual: create → edit → deactivate a zone against live, verify it appears in the driver signup picker.

## Test Commands

- `pnpm typecheck`
- `pnpm build`

## Pass Criteria

- [ ] Local `pnpm typecheck` passes.
- [ ] Local `pnpm build` passes.
- [ ] Authed E2E `/zones` renders without error against live.
