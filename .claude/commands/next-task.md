---
description: Supervised-loop step — verify the last task's PR is green/merged, then build the next buildable board task.
allowed-tools: Bash, Read, Edit, Write, Glob, Grep, Skill
---

You are one **supervised iteration** of the agent-board loop. The rule: never start a new task while the previous one's PR is still open and unmerged. The gate is `pnpm typecheck` + `pnpm build` + human review on the PR.

## 1. Reconcile merged work → Done

Tasks reach `Review` when their PR opens; merging the PR is what truly completes them. List recently merged loop PRs: `gh pr list --state merged --search "head:task/" --limit 10 --json number,headRefName`.

For each merged `task/TASK-XXX` PR whose board task is **not** yet `Done`, run `node scripts/agent-board.mjs set-status TASK-XXX Done`. This is what unblocks the next task in the DAG.

## 2. Guard: is the previous task settled?

List open PRs from this loop: `gh pr list --state open --search "head:task/" --json number,headRefName,title,statusCheckRollup,reviewDecision`.

- If an open `task/TASK-XXX` PR exists, **stop** and report its CI status + review decision. Tell the user to merge/approve it (or fix red CI) before the loop advances. Do not build anything.
- If a PR is green + approved but unmerged, offer to merge it (`gh pr merge --squash`) but wait for the user's go-ahead — do not merge unprompted.
- If there are no open `task/` PRs, continue.

**Fail closed:** the `--search "head:task/"` query is flaky and has returned an empty list on a network timeout. Never treat an errored or uncertain query as "no open PRs." If the query fails, re-check the most recent task PR directly (`gh pr view <n> --json state`) and **halt if you cannot positively confirm there is no open task PR.**

## 3. Pick the next task

Run `node scripts/agent-board.mjs next`.
- If it prints `NONE`, report that the board has no buildable task (everything is Done, blocked, or in review) and stop. Note that TASK-015/016/017 stay `Blocked` on missing backend endpoints.
- Otherwise take the `id` from the JSON.

## 4. Build it

Run the `/build-task` pipeline for that id. Follow it to completion (it opens the PR and stops).

## 5. Hand back

Report the PR url and remind the user the loop is paused until that PR is green + approved. To continue, they run `/next-task` again after merging.
