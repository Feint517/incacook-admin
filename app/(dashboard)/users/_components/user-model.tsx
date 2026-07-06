"use client";

/**
 * Local view models + presentation helpers for the Users page.
 *
 * These mirror the real `/v1/admin/users` (list) and `/v1/admin/users/:id`
 * (detail) responses, which return the SAME row shape — the list endpoint
 * emits a bare array (no `{ items, total }` envelope, so `pagination` comes
 * back `null`), and the detail endpoint emits a single object.
 *
 * Source of truth: IncaCook-Server `AdminUsersService` (`USER_SELECT` +
 * `toResponse`). Dates are ISO strings over the wire.
 */

import { Badge } from "@/components/ui/badge";
import { UserStatusBadge } from "@/components/dashboard/status-badge";

/** Roles as they come off the wire (Prisma `UserRole` enum). */
export type AdminUserRole =
  | "BUYER"
  | "SELLER"
  | "DRIVER"
  | "ADMIN"
  | "MODERATOR";

/** One user row — identical for the list and the detail endpoints. */
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: AdminUserRole;
  isSuspended: boolean;
  suspendedAt: string | null;
  suspensionReason: string | null;
  createdAt: string;
  averageRating: number | null;
  reviewCount: number | null;
}

/** The list endpoint resolves to a bare array of rows. */
export type AdminUsersListResponse = AdminUser[];

const ROLE_LABEL: Record<AdminUserRole, string> = {
  BUYER: "Acheteur",
  SELLER: "Vendeur",
  DRIVER: "Livreur",
  ADMIN: "Admin",
  MODERATOR: "Modérateur",
};

type BadgeVariant =
  | "neutral"
  | "primary"
  | "secondary"
  | "info"
  | "warning"
  | "success"
  | "error";

const ROLE_VARIANT: Record<AdminUserRole, BadgeVariant> = {
  BUYER: "neutral",
  SELLER: "primary",
  DRIVER: "warning",
  ADMIN: "info",
  MODERATOR: "secondary",
};

/**
 * Role pill for real backend roles. Kept local because the shared `RoleBadge`
 * only models the mock buyer/seller-subtype/driver union and can't express
 * `ADMIN`/`MODERATOR`/generic `SELLER`. Uses the same `Badge` primitive so the
 * look matches the rest of the admin UI.
 */
export function UserRoleBadge({ role }: { role: AdminUserRole }) {
  return <Badge variant={ROLE_VARIANT[role] ?? "neutral"}>{ROLE_LABEL[role] ?? role}</Badge>;
}

/**
 * Status shown in the shared `UserStatusBadge`. The admin endpoint only exposes
 * `isSuspended` (no email/KYC verification flags), so we surface just the two
 * meaningful states.
 */
export function statusOf(u: Pick<AdminUser, "isSuspended">) {
  return u.isSuspended ? ("suspended" as const) : ("verified" as const);
}

/** Read-only status badge for a user row. */
export function UserStatus({ user }: { user: Pick<AdminUser, "isSuspended"> }) {
  return <UserStatusBadge status={statusOf(user)} />;
}

/** `Prénom Nom`, collapsed when a part is blank. */
export function fullName(u: Pick<AdminUser, "firstName" | "lastName">): string {
  return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "—";
}

/** Up-to-two-letter initials for the avatar fallback. */
export function initialsOf(u: Pick<AdminUser, "firstName" | "lastName">): string {
  const a = u.firstName?.[0] ?? "";
  const b = u.lastName?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}
