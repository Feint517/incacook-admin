# TASK-020 — CI quality gates (typecheck + lint + build)

Status: Done
Priority: P2
Project: IncaCook Admin
Milestone: Phase 1 — Wire admin panel to /v1/admin backend
Owner: Agent

## Purpose

Add the PR gate that mirrors take-my-pic — every PR re-runs the objective checks before human review.

## Scope

- Add `"typecheck": "tsc --noEmit"` to `package.json` scripts.
- Add `.github/workflows/quality-gates.yml`: on PR to `dev`, run `pnpm install`, `pnpm typecheck`, `pnpm lint`, `pnpm build`.

## Backend Endpoints

- n/a

## Acceptance Criteria

- [ ] `pnpm typecheck` script exists and passes locally.
- [ ] Workflow runs the three gates on PRs into `dev`.

## Edge Cases

- pnpm version pinning / lockfile frozen install.
- Next 16 build cache in CI.

## Dependencies

- None (buildable now).
- Independent — can be done first to enable the loop.

## Verification

- Open a throwaway PR and confirm the workflow runs green.

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
