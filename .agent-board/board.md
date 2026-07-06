# IncaCook Admin Agent Board

Project: IncaCook Admin
Current focus: Replace mock data with the real IncaCook backend admin surface (/v1/admin/*), behind admin/moderator auth
Current milestone: Phase 1 — Wire admin panel to /v1/admin backend
Updated: 2026-07-06

## Columns

- Backlog
- Ready
- In Progress
- Review
- Blocked
- Done

## Current Tasks

| Task | Title | Status | Owner | Priority |
| --- | --- | --- | --- | --- |
| TASK-001 | API client, response envelope, and error codes | Done | Agent | P0 |
| TASK-002 | Admin authentication, session, and route guard | Backlog | Agent | P0 |
| TASK-003 | Shared data-table query infra (pagination, filters, states) | Backlog | Agent | P1 |
| TASK-004 | Dashboard overview → /v1/admin/dashboard/* | Backlog | Agent | P0 |
| TASK-005 | Users list + detail → /v1/admin/users | Backlog | Agent | P0 |
| TASK-006 | User moderation — strikes + suspend/unsuspend | Backlog | Agent | P1 |
| TASK-007 | Reports moderation → /v1/admin/reports | Backlog | Agent | P1 |
| TASK-008 | Geography map → /v1/admin/dashboard/cities | Backlog | Agent | P2 |
| TASK-009 | KYC review queue → /v1/admin/kyc/documents (NEW page) | Backlog | Agent | P0 |
| TASK-010 | Disputes management → /v1/admin/disputes (NEW page) | Backlog | Agent | P0 |
| TASK-011 | Catalog claims → /v1/admin/catalog-claims (NEW page) | Backlog | Agent | P1 |
| TASK-012 | Supply catalog products CRUD + orders → /v1/admin/catalog/* | Backlog | Agent | P2 |
| TASK-013 | Broadcast notifications → /v1/admin/notifications/send | Backlog | Agent | P2 |
| TASK-014 | Legal documents management → /v1/admin/legal-documents | Backlog | Agent | P2 |
| TASK-015 | Orders page — needs an admin orders endpoint (backend dependency) | Blocked | Agent | P2 |
| TASK-016 | Sellers page — needs an admin sellers endpoint (backend dependency) | Blocked | Agent | P2 |
| TASK-017 | Listings page — needs an admin listings endpoint (backend dependency) | Blocked | Agent | P2 |
| TASK-018 | Env config, API base URL, and README | Done | Agent | P1 |
| TASK-019 | Remove mock-data generator and delete dead mock leaks | Backlog | Agent | P2 |
| TASK-020 | CI quality gates (typecheck + lint + build) | Done | Agent | P2 |

## Recommended Start

Start with **TASK-001** (API client + envelope). Everything that touches the
backend depends on it. Then **TASK-002** (admin auth + route guard) and
**TASK-003** (shared table/query infra) unlock the whole wave of page-wiring
tasks (TASK-004…014).

TASK-020 (CI gates) is independent and can be done first to arm the loop.

TASK-015/016/017 (Orders, Sellers, Listings pages) are **Blocked** on backend
admin endpoints that do not exist yet — they stay blocked until the backend
adds them; do not wire them to mock data.

## Backend admin surface (source of truth)

Derived from a live read of `IncaCook-Server/src/modules/admin/*` and the
admin controllers in `catalog`, `moderation`, and `compliance`. All admin
endpoints are guarded by `RolesGuard` + `@Roles(Admin, Moderator)`.

- Dashboard: `GET /v1/admin/dashboard/{overview,users,revenue,categories,cities,recurring-users,mono-users}`
- Users: `GET /v1/admin/users`, `GET /v1/admin/users/:id`
- Sanctions: `GET /v1/admin/strikes`, `POST /v1/admin/users/:id/{strikes,suspend,unsuspend}`
- KYC: `GET /v1/admin/kyc/documents`, `:id`, `:id/{approve,reject}`
- Disputes: `GET /v1/admin/disputes`, `:id`, `:id/{approve-refund,reject,resolve,confirm-allergen,confirm-chargeback-fraud}`
- Reports: `GET /v1/admin/reports`, `PATCH :id/status`
- Catalog claims: `GET /v1/admin/catalog-claims`, `:id`, `:id/{refund,request-replacement,reject,resolve}`
- Catalog: `GET/POST /v1/admin/catalog/products`, `GET/PATCH/DELETE :id`, `GET /v1/admin/catalog/orders`
- Notifications: `POST /v1/admin/notifications/send`
- Legal documents: `GET /v1/admin/legal-documents`, `active`, `POST`, `PATCH :id`, `POST :id/publish`

**Not yet available (block TASK-015/016/017):** a global `/v1/admin/orders`,
`/v1/admin/sellers`, or `/v1/admin/listings` list endpoint.
