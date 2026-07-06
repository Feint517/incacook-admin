# IncaCook Admin

Admin panel for the **IncaCook** marketplace. A Next.js 16 (App Router) + React 19
web app used by Admins and Moderators to manage the platform — users, KYC review,
listings, and moderation — against the IncaCook backend (NestJS).

## Prerequisites

- **Node.js** 20+ (this repo is developed on Node 24)
- **pnpm** (the project uses a `pnpm-lock.yaml`; install with `npm i -g pnpm` if needed)

## Getting started

```bash
pnpm install
pnpm dev
```

The app runs at http://localhost:3000.

## Configuration

The app reads a single environment variable, `NEXT_PUBLIC_API_BASE_URL`, which
is the origin of the IncaCook backend. The app appends the `/v1` prefix itself,
so set the **host origin only** (no trailing slash, no `/v1`).

Copy the example file and edit it:

```bash
cp .env.example .env.local
```

### Point at a local IncaCook-Server

Run the backend (`IncaCook-Server`) locally, then set:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3001
```

### Point at production (Railway)

```bash
NEXT_PUBLIC_API_BASE_URL=https://incacook-api-production.up.railway.app
```

See `.env.example` for the full list of supported variables.

## Logging in

Admin endpoints are protected by the backend's `RolesGuard` and require an
account with the **Admin** or **Moderator** role. You must log in with a seeded
Admin/Moderator account — a regular user account will be rejected by the API.
When developing against a local backend, seed such an account in `IncaCook-Server`.

## Scripts

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `pnpm dev`       | Start the dev server                 |
| `pnpm build`     | Production build                     |
| `pnpm start`     | Serve the production build           |
| `pnpm lint`      | Run ESLint                           |
| `pnpm typecheck` | Type-check with `tsc --noEmit`       |
| `pnpm board`     | List agent-board tasks               |

## Agent-board workflow

This repo is built one task at a time via the agent-board workflow. Use
`pnpm board` to list tasks; each task lives in `.agent-board/tasks/`. The full
task-to-PR loop (grill → build → review → test → PR) is documented in
[`.agent-board/README.md`](.agent-board/README.md).
