# Agent-board build workflow

How we take a board task from spec to merged PR, one task at a time, in
dependency order, with a human gate on every PR. Same loop as the
`take-my-pic` repo, adapted for this Next.js 16 admin web app (no Maestro —
the objective gate is `pnpm typecheck` + `pnpm build` + a manual click-through
against a local IncaCook-Server).

## The loop in one line

`/next-task` → it builds the next buildable task and opens a PR → CI runs →
you review + merge → `/next-task` again.

## Per-task pipeline (what `/build-task` does)

1. **Grill** the spec with `/grill-with-docs` — **mandatory**; it surfaces edge
   cases and the decisions get folded back into the task file.
2. **Build** the task against the real `/v1/admin/*` endpoint (no mock-data).
3. **Review** the diff against the project's conventions (React 19 / Next 16 App
   Router, Tailwind, TanStack table, the `lib/api` client contract).
4. **Test** — `pnpm typecheck` + `pnpm build`, and a **manual click-through**
   against a booted local backend (`http://127.0.0.1:3001`) with a seeded
   Admin/Moderator account. The pipeline halts without a green typecheck+build.
5. **Pass criteria** — tick what's truly verified; mark fixture-dependent states
   `manual`.
6. **PR** — branch `task/TASK-XXX` → `dev`, then stop.

## Two trigger options

- **Interactive:** type `/next-task` yourself after each merge. Fully supervised.
- **Scheduled routine:** a cron'd cloud agent runs `/next-task` on a cadence,
  builds + opens the PR unattended, then stops at the PR. You still merge by hand.

Merging is always manual — that's the human gate.

## The gates

- **Inside `/build-task` (mandatory):** grilling, then `pnpm typecheck` +
  `pnpm build`. The pipeline won't open a PR without them.
- **On the PR:** `.github/workflows/quality-gates.yml` re-runs typecheck + lint +
  build (added in TASK-020), then a human reviews + merges.

## Commands

```
pnpm board          # list tasks, flag which are BUILDABLE
pnpm board:next     # JSON for the next buildable task

node scripts/agent-board.mjs set-status TASK-XXX Done   # syncs board.json + board.md + task header
```

## Rules the driver enforces

- A task is **buildable** only when every `blockedBy` task is `Done`.
- `/build-task` halts if the working tree is dirty — commit first.
- `/next-task` won't start task N+1 while task N's PR is open; it flips merged
  `task/*` PRs to `Done` to unblock the next one.
- `board.json` is the source of truth; never hand-edit status in three places —
  use `set-status`.

## Backend surface

Every task maps to a real endpoint under `/v1/admin/*` (see `board.md` for the
full list), guarded by `RolesGuard` + `@Roles(Admin, Moderator)`. Tasks
TASK-015/016/017 are **Blocked** because their pages (Orders, Sellers, Listings)
have no admin list endpoint yet — they stay blocked until the backend adds one;
do not wire them to mock data to make them "pass".
