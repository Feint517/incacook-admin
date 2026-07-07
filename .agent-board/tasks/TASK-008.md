# TASK-008 — Geography map → /v1/admin/dashboard/cities

Status: In Progress
Priority: P2
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Feed the France Leaflet map with real per-city aggregates instead of mock `CityStat`s.

## Scope

- Wire `components/dashboard/france-map*` + the geography page to `GET /v1/admin/dashboard/cities`.
- Map real city rows (orders/sellers/buyers/drivers/revenue + lat/lng) onto the existing markers/heat overlay.

## Backend Endpoints

- `GET /v1/admin/dashboard/cities`

## Acceptance Criteria

- [ ] Map markers/intensity come from the real cities endpoint.
- [ ] Cities without coordinates are handled (skipped or geo-fallback).
- [ ] `pnpm typecheck` + `pnpm build` pass (Leaflet is client-only).

## Edge Cases

- City missing lat/lng.
- Single-city dataset (map bounds).
- Very large revenue (marker scaling).

## Dependencies

- TASK-004 must be Done.
- Shares the dashboard endpoints wired in TASK-004.

## Verification

- Manual: map renders seeded cities; hover a marker.

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
