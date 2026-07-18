import { Badge } from "@/components/ui/badge";

// Shared status pills still consumed by wired pages. Type unions are declared
// locally (the old lib/mock-data layer is gone). Pages whose real backend enum
// doesn't match these build their own local badges on the `Badge` primitive.

export type UserStatus = "verified" | "pending" | "suspended";
export type ListingStatus = "active" | "sold-out" | "expired" | "paused";

const USER_LABEL: Record<UserStatus, string> = {
  verified: "Vérifié",
  pending: "En attente",
  suspended: "Suspendu",
};

const USER_VARIANT: Record<UserStatus, "success" | "warning" | "error"> = {
  verified: "success",
  pending: "warning",
  suspended: "error",
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return <Badge variant={USER_VARIANT[status]}>{USER_LABEL[status]}</Badge>;
}

const LISTING_LABEL: Record<ListingStatus, string> = {
  active: "Active",
  "sold-out": "Épuisée",
  expired: "Expirée",
  paused: "En pause",
};

const LISTING_VARIANT: Record<ListingStatus, "success" | "neutral" | "error" | "warning"> = {
  active: "success",
  "sold-out": "neutral",
  expired: "error",
  paused: "warning",
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return <Badge variant={LISTING_VARIANT[status]}>{LISTING_LABEL[status]}</Badge>;
}

// --- Stripe Connect payout readiness (sellers + drivers) --------------------
// Three states, not two — matches DEC-4 (IncaCook-Server): the backend
// persists detailsSubmitted/chargesEnabled/payoutsEnabled separately rather
// than a single completed bool, because "submitted, awaiting review" and
// "never started" are materially different for an operator. The readiness
// gate itself is `payoutsEnabled && detailsSubmitted` — deliberately NOT
// chargesEnabled (a connected account that can take charges is not thereby
// payable) — kept here as one function so this repo can't drift from that
// rule the way the backend's own schema comment once did.

export type ConnectReadiness = "ready" | "pending" | "not_started";

const CONNECT_READINESS_LABEL: Record<ConnectReadiness, string> = {
  ready: "Prêt",
  pending: "En attente",
  not_started: "Non configuré",
};

const CONNECT_READINESS_VARIANT: Record<ConnectReadiness, "success" | "warning" | "neutral"> = {
  ready: "success",
  pending: "warning",
  not_started: "neutral",
};

export function connectReadinessOf(facts: {
  stripeDetailsSubmitted: boolean;
  stripePayoutsEnabled: boolean;
}): ConnectReadiness {
  if (facts.stripePayoutsEnabled && facts.stripeDetailsSubmitted) return "ready";
  if (facts.stripeDetailsSubmitted) return "pending";
  return "not_started";
}

export function ConnectReadinessBadge({
  stripeDetailsSubmitted,
  stripePayoutsEnabled,
}: {
  stripeDetailsSubmitted: boolean;
  stripePayoutsEnabled: boolean;
}) {
  const readiness = connectReadinessOf({ stripeDetailsSubmitted, stripePayoutsEnabled });
  return (
    <Badge variant={CONNECT_READINESS_VARIANT[readiness]}>
      {CONNECT_READINESS_LABEL[readiness]}
    </Badge>
  );
}
