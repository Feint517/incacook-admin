# Deployment

How to deploy the IncaCook admin panel. It's a Next.js 16 app that runs
**entirely client-side against the IncaCook backend** — every page builds
static (`○ (Static)`) and fetches data in the browser from the Railway API. So
hosting it is just "serve a static Next build + one env var."

> **Why manual/CLI deploy?** The GitHub repo (`Feint517/incacook-admin`) isn't
> owned by the deployer, so Vercel's *git integration* (auto-deploy on push)
> can't be enabled yet. A **CLI deploy uploads the local folder** and builds it
> on the host — it never touches GitHub, so repo ownership is irrelevant. Once
> repo access is sorted (collaborator invite, or fork), switch to git
> auto-deploy — see the last section.

## The one thing that matters: the API base URL

The app reads a single build-time variable:

```
NEXT_PUBLIC_API_BASE_URL=https://incacook-api-production-146b.up.railway.app
```

`NEXT_PUBLIC_*` is **inlined into the build**, not read at runtime. So it must
be set **before the build**, and **changing it requires a redeploy** (not just
an env edit). The app appends `/v1` itself — set the host origin only, no
trailing slash. CORS on the backend reflects any origin, so any deploy domain
works with no backend change.

## Prerequisites

- Node 22.x, pnpm 10 (pinned in `package.json` → `engines` + `packageManager`).
- A clean build locally: `pnpm install && pnpm typecheck && pnpm build`.

---

## Option A — Vercel CLI (current setup)

The project is already linked (`.vercel/project.json` → project `incacook-admin`,
team `inca-cook`). `.vercel/` and `.env.local` are git-ignored — never commit
them (they hold the link + the OIDC token).

**First-time only:**

```bash
npm i -g vercel        # or: pnpm add -g vercel
vercel login           # interactive — your Vercel account
vercel link            # links this folder to the incacook-admin project (already done)
```

**Set the env var** (once per environment; skip if already set in the dashboard):

```bash
echo "https://incacook-api-production-146b.up.railway.app" \
  | vercel env add NEXT_PUBLIC_API_BASE_URL production
```

**Deploy:**

```bash
vercel            # deploy a preview build → prints a preview URL
vercel --prod     # promote/deploy to production
```

Vercel builds remotely (uploads source, runs `pnpm build`), then serves the
static output from its global CDN. To build locally and upload the prebuilt
output instead: `vercel build --prod && vercel deploy --prebuilt --prod`.

---

## Option B — Railway CLI (alternative; same platform as the backend)

No GitHub needed either; Nixpacks auto-detects Next.js (no Dockerfile). Runs
`next start` on a small server rather than a CDN — fine for an admin panel.

```bash
cd incacook-admin
railway login                     # if not already: `railway whoami` to check
railway add                       # create an "incacook-admin" service in the project
railway variables set NEXT_PUBLIC_API_BASE_URL=https://incacook-api-production-146b.up.railway.app
railway up                        # build (pnpm install → pnpm build) + start (next start, binds $PORT)
railway domain                    # generate a public URL
```

---

## Verify a deploy

1. Open the deploy URL → it redirects to `/login` (the auth gate).
2. Log in with an **Admin/Moderator** account (the role gate rejects others).
3. Confirm a data page loads (e.g. **Utilisateurs**) — real rows from the API
   means the env var + CORS are correct.

Optional automated check (drives the live app in a browser):

```bash
# creds live in .env.local (E2E_*); the suite covers login + all 15 pages
pnpm e2e
```

## Rollback

- **Vercel:** dashboard → project → Deployments → pick a previous build →
  *Promote to Production* (instant), or `vercel rollback <url>`.
- **Railway:** service → Deployments → redeploy a previous one.

## Later: switch to git auto-deploy

Once the deployer has repo access (added as a collaborator on
`Feint517/incacook-admin`, or the app is forked to an account you control):

1. Vercel dashboard → the `incacook-admin` project → **Settings → Git** →
   connect the repository.
2. Set the **Production Branch** to `main` (it tracks the finished app; `dev`
   is the integration branch).
3. Keep `NEXT_PUBLIC_API_BASE_URL` set for Production + Preview.

After that, every push to `main` auto-deploys and every PR gets a preview URL —
no more manual `vercel --prod`.
