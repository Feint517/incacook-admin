# TASK-023 — Seller subscriptions oversight → /v1/admin/subscriptions

Status: Done
Priority: P2
Project: IncaCook Admin
Owner: Agent

## Purpose
Admin view of seller platform subscriptions (status/plan/period/trial/provider).
Required a new backend endpoint `GET /v1/admin/subscriptions`.

## Scope
- New route `/subscriptions` + sidebar entry; list via useAdminQuery with status
  filter + search + pagination.
- Show status, plan (Standard/Premium), provider (Stripe/RevenueCat), period end, trial.

## Backend
- `GET /v1/admin/subscriptions?status=&search=&limit=&offset=` (Admin/Moderator)
  → `{ sellerId, name, email, subscriptionStatus, plan, isPremium, category, currentPeriodEnd, trialEndsAt, provider, createdAt }`

## Pass Criteria
- [ ] typecheck + build pass.
- [ ] Live E2E green once endpoint deployed.
