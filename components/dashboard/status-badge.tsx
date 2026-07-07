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
