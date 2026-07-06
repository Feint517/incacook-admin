---
description: Run the full agent-board pipeline for one task — mandatory grilling, build against the real /v1/admin endpoint, review, typecheck+build, update pass criteria, open PR.
argument-hint: TASK-XXX
allowed-tools: Bash, Read, Edit, Write, Glob, Grep, Skill
---

You are running the **single-task build pipeline** for `$ARGUMENTS` (a board task id like `TASK-005`).

Work the steps in order. **Stop and report** if any step fails or a precondition is not met — do not skip ahead, and do not green-tick a criterion you did not actually verify.

## 0. Preconditions

1. Run `node scripts/agent-board.mjs list` and confirm `$ARGUMENTS` is marked `BUILDABLE` (all `blockedBy` tasks are `Done`). If it is not buildable, stop and say which blocker is open. If it is `Blocked` on a missing backend endpoint (TASK-015/016/017), stop — that is not agent-buildable.
2. Ensure the working tree is clean (`git status`). If dirty, stop and ask.
3. Confirm a local IncaCook-Server is reachable for manual verification (`curl -s http://127.0.0.1:3001/v1/health` or the health route). If it is not up, you can still build + typecheck, but the manual pass-criteria stay `manual` — say so.
4. Create/switch to branch `task/$ARGUMENTS` off the latest `dev` (`git fetch`, then branch from `origin/dev`).
5. Move the task into progress: `node scripts/agent-board.mjs set-status $ARGUMENTS "In Progress"`.

## 1. Grill the spec — MANDATORY, never skip

Read `.agent-board/tasks/$ARGUMENTS.md`, then **run `/grill-with-docs` against it.** Drive it to completion yourself: answer every question with the most reasonable decision given the spec, the existing admin code, the `lib/api` client contract, and the backend admin surface. Fold every resolved decision + edge case **back into the task file** (Scope, Acceptance Criteria, Edge Cases, Verification).

If grilling surfaces a genuine product/backend question you cannot decide alone (e.g. a missing endpoint), record it in `docs/next-meeting-questions.md`, pick a sensible MVP default, and keep moving.

## 2. Build the task

Implement the scope in `.agent-board/tasks/$ARGUMENTS.md`. Follow the repo's existing patterns: React 19 / Next 16 App Router, the `(dashboard)` route group, Tailwind + the `components/ui` + `components/dashboard` primitives, TanStack table for lists, and the `lib/api` client for **all** backend calls. **Never call `fetch` directly and never introduce a new `lib/mock-data` import on a wired page.**

## 3. Convention review

Self-review the diff before testing:
- App Router server/client component boundaries are correct (`"use client"` only where needed; Leaflet/Recharts stay client-only).
- Every backend call goes through `lib/api/client` and handles `ApiError` (message + correlationId).
- Loading / empty / error states use the shared TASK-003 infra.

Fix what the review surfaces. Summarize anything you deliberately left.

## 4. Test — typecheck + build MANDATORY

Run, and paste the real output of:
- `pnpm typecheck`
- `pnpm build`

Both are required gates. If either fails, fix and re-run before continuing. Then do a **manual click-through** of the wired surface against the local backend with a seeded Admin/Moderator account, and capture evidence (screenshot or the network call). If the backend isn't up, mark those pass-criteria `manual` — do not tick them green.

## 5. Update pass criteria

In `.agent-board/tasks/$ARGUMENTS.md`, tick the Acceptance / Pass Criteria you genuinely verified. Leave (or annotate `manual`) anything needing backend fixtures or human review. Then move the task to review: `node scripts/agent-board.mjs set-status $ARGUMENTS "Review"`.

## 6. Open the PR

Commit on `task/$ARGUMENTS` and open a PR into `dev` with `gh pr create`. The PR body must list:
- what was built + which endpoint it wired,
- the grilling-driven spec refinements,
- the `pnpm typecheck` + `pnpm build` results (paste pass/fail),
- which Pass Criteria are green vs. still `manual`,
- a line: "Merges only after a human reviews + approves."

## 7. Report back

End with: the PR url, the board transition, and a one-line "next buildable task" from `node scripts/agent-board.mjs next`. **Do not merge** and do not start the next task — the supervised loop waits for CI-green + human approval.
