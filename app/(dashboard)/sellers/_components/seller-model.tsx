"use client";

/**
 * Local view models + presentation helpers for the Sellers page.
 *
 * These mirror the real `GET /v1/admin/sellers` list response. The endpoint
 * returns the standard paginated envelope, so the typed client hands us the
 * `items` array as `data` and a `{ hasMore, limit, … }` pagination block.
 *
 * Source of truth: IncaCook-Server `AdminSellersService` (`AdminSellerListItem`
 * + `SELLER_SELECT` + `toItem`). Dates are ISO strings over the wire.
 *
 * NOTE: the old mock exposed `hygieneOk` / `qualityScore` / `packagingScore` —
 * none of those exist on this endpoint, so they are intentionally absent.
 */

import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserStatusBadge } from "@/components/dashboard/status-badge";

/** Seller category as it comes off the wire (Prisma `SellerCategory` enum). */
export type SellerCategory = "FAIT_MAISON" | "TRAITEUR" | "RESTAURANT";

/** Resolved subscription tier (server-computed from status + isPremium). */
export type SubscriptionTier = "free" | "standard" | "premium";

/** Raw subscription state (Prisma `SubscriptionStatus` enum). */
export type SubscriptionStatus =
  | "NONE"
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED"
  | "UNPAID"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED";

/** One seller row as returned by `GET /v1/admin/sellers`. */
export interface AdminSeller {
  id: string;
  name: string;
  email: string;
  category: SellerCategory | null;
  rating: number | null;
  ratingCount: number;
  totalSales: number;
  totalRevenueCents: number;
  activeListings: number;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  // Stripe Connect payout readiness (issue #12) — the granular DEC-4 triad.
  stripeDetailsSubmitted: boolean;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  stripeOnboardingCompleted: boolean;
  isSuspended: boolean;
  createdAt: string;
}

/** The list endpoint resolves (via the client envelope) to a bare array. */
export type AdminSellersListResponse = AdminSeller[];

// --- Category badge ---------------------------------------------------------
// Kept local because the shared `CategoryBadge` only models the mock enum
// (faitMaison/traiteur/restaurant); the real wire enum is SCREAMING_SNAKE.

type CategoryBadgeVariant = "primary" | "secondary" | "info";

const CATEGORY_LABEL: Record<SellerCategory, string> = {
  FAIT_MAISON: "Fait Maison",
  TRAITEUR: "Traiteur",
  RESTAURANT: "Restaurant",
};

const CATEGORY_VARIANT: Record<SellerCategory, CategoryBadgeVariant> = {
  FAIT_MAISON: "primary",
  TRAITEUR: "secondary",
  RESTAURANT: "info",
};

/** Category options for the filter Select (label + wire value). */
export const CATEGORY_OPTIONS: { value: SellerCategory; label: string }[] = [
  { value: "FAIT_MAISON", label: "Fait Maison" },
  { value: "TRAITEUR", label: "Traiteur" },
  { value: "RESTAURANT", label: "Restaurant" },
];

/** Read-only category pill for a seller row (built on the shared `Badge`). */
export function SellerCategoryBadge({
  category,
}: {
  category: SellerCategory | null;
}) {
  if (!category) {
    return <span className="text-[13px] text-on-surface-variant">—</span>;
  }
  return (
    <Badge variant={CATEGORY_VARIANT[category]}>{CATEGORY_LABEL[category]}</Badge>
  );
}

// --- Subscription tier badge ------------------------------------------------

const TIER_LABEL: Record<SubscriptionTier, string> = {
  free: "Gratuit",
  standard: "Standard",
  premium: "Premium",
};

/** Read-only subscription-tier pill. Premium gets a sparkle accent. */
export function SellerTierBadge({ tier }: { tier: SubscriptionTier }) {
  if (tier === "premium") {
    return (
      <Badge variant="secondary">
        <Sparkles className="mr-1 h-3 w-3" />
        {TIER_LABEL.premium}
      </Badge>
    );
  }
  if (tier === "standard") {
    return <Badge variant="info">{TIER_LABEL.standard}</Badge>;
  }
  return <Badge variant="neutral">{TIER_LABEL.free}</Badge>;
}

/** Suspended / active state, reusing the shared status badge. */
export function SellerStatus({
  seller,
}: {
  seller: Pick<AdminSeller, "isSuspended">;
}) {
  return (
    <UserStatusBadge status={seller.isSuspended ? "suspended" : "verified"} />
  );
}

/** Up-to-two-letter initials for the avatar fallback. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
  return letters.toUpperCase() || "?";
}
