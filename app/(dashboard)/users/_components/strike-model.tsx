"use client";

/**
 * Local view models + presentation helpers for user *strikes* (TASK-006).
 *
 * Mirrors the real `GET /v1/admin/strikes?userId=…` response, which returns a
 * bare array of Prisma `Strike` rows (newest first, capped at 100 — see
 * IncaCook-Server `StrikesService.listForUser`). Dates are ISO strings.
 *
 * Kept local (like `UserRoleBadge` in `user-model.tsx`) so the strike badges
 * build on the shared `Badge` primitive without touching `components/**`.
 */

import { Badge } from "@/components/ui/badge";

/** Which role a strike/suspension applies to (server `ActorRole`). */
export type ActorRole = "SELLER" | "DRIVER" | "BUYER";

/** Server `StrikeSeverity`. */
export type StrikeSeverity = "LIGHT" | "SERIOUS" | "CRITICAL";

/** Server `StrikeSourceType`. */
export type StrikeSourceType = "DELIVERY" | "ORDER" | "REPORT" | "SYSTEM";

/** One strike row, as it comes off `GET /v1/admin/strikes`. */
export interface Strike {
  id: string;
  userId: string;
  actorRole: string;
  points: number;
  reason: string;
  severity: string;
  sourceType: string;
  sourceId: string | null;
  orderId: string | null;
  deliveryId: string | null;
  notes: string | null;
  createdBy: string | null;
  metadata: unknown;
  createdAt: string;
  /** `createdAt + 90d`: a strike only counts toward suspension while now < this. */
  expiresAt: string | null;
}

/** The strikes endpoint resolves to a bare array of rows. */
export type StrikesListResponse = Strike[];

/** Roles selectable when adding a strike / suspending. */
export const ACTOR_ROLES: ActorRole[] = ["SELLER", "DRIVER", "BUYER"];

export const ACTOR_ROLE_LABEL: Record<ActorRole, string> = {
  SELLER: "Vendeur",
  DRIVER: "Livreur",
  BUYER: "Acheteur",
};

export const SEVERITIES: StrikeSeverity[] = ["LIGHT", "SERIOUS", "CRITICAL"];

const SEVERITY_LABEL: Record<StrikeSeverity, string> = {
  LIGHT: "Légère",
  SERIOUS: "Sérieuse",
  CRITICAL: "Critique",
};

export const SOURCE_TYPES: StrikeSourceType[] = [
  "SYSTEM",
  "REPORT",
  "ORDER",
  "DELIVERY",
];

const SOURCE_TYPE_LABEL: Record<StrikeSourceType, string> = {
  SYSTEM: "Système",
  REPORT: "Signalement",
  ORDER: "Commande",
  DELIVERY: "Livraison",
};

type BadgeVariant = "neutral" | "warning" | "error";

const SEVERITY_VARIANT: Record<string, BadgeVariant> = {
  LIGHT: "neutral",
  SERIOUS: "warning",
  CRITICAL: "error",
};

/** Severity pill for a strike, on the shared `Badge` primitive. */
export function StrikeSeverityBadge({ severity }: { severity: string }) {
  return (
    <Badge variant={SEVERITY_VARIANT[severity] ?? "neutral"}>
      {SEVERITY_LABEL[severity as StrikeSeverity] ?? severity}
    </Badge>
  );
}

export function sourceTypeLabel(s: string): string {
  return SOURCE_TYPE_LABEL[s as StrikeSourceType] ?? s;
}

export function actorRoleLabel(r: string): string {
  return ACTOR_ROLE_LABEL[r as ActorRole] ?? r;
}

/** Best-effort default actor role for a user, given their account role. */
export function defaultActorRole(role: string): ActorRole {
  return (ACTOR_ROLES as string[]).includes(role)
    ? (role as ActorRole)
    : "BUYER";
}
