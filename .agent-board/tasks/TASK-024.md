# TASK-024 — Wallet/payout oversight → /v1/admin/wallets + /withdrawals

Status: Done
Priority: P2
Project: IncaCook Admin
Owner: Agent

## Purpose
Admin financial oversight: seller/driver wallet balances + payout history.
Required two new backend endpoints.

## Scope
- New route `/payouts` (tabs) + sidebar entry.
- Balances tab: `GET /v1/admin/wallets` (available/pending/held/paid-out), role filter + search.
- Withdrawals tab: `GET /v1/admin/withdrawals` (amount, status, Stripe transferId).

## Backend
- `GET /v1/admin/wallets?role=&search=&limit=&offset=`
  → `{ userId, name, email, role, availableCents, pendingCents, heldCents, paidOutCents, currency }`
- `GET /v1/admin/withdrawals?userId=&limit=&offset=`
  → `{ id, withdrawalId, userId, name, amountCents, status, transferId, createdAt }`

## Pass Criteria
- [ ] typecheck + build pass.
- [ ] Live E2E green once endpoints deployed.
