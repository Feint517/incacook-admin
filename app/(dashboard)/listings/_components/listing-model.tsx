"use client";

/**
 * Local view models + presentation helpers for the Listings (Annonces) page.
 *
 * Mirrors the real `GET /v1/admin/listings` list response. The backend
 * `TransformInterceptor` hoists the paginated payload's `items` array to the
 * envelope `data` and moves `{ hasMore, limit }` into `pagination` — so
 * `useAdminQuery<AdminListingsListResponse>` yields `data` = a bare array of
 * rows and a real `pagination.hasMore` (next-only navigation, no `total`).
 *
 * Source of truth: IncaCook-Server `AdminListingsService` (`AdminListingListItem`).
 * `status` is a DERIVED status (no DB column); `cuisineTypes`/`dietaryTags`/
 * `dishTypes` are arrays of Prisma enum values; there is NO `portionsTotal`
 * (only `portionsLeft`). Dates are ISO strings over the wire.
 */

import { Badge } from "@/components/ui/badge";
import { ListingStatusBadge } from "@/components/dashboard/status-badge";
import { cn } from "@/lib/utils";

/** Derived listing status (mirrors the backend `ListingStatusFilter`). */
export type AdminListingStatus = "active" | "sold-out" | "expired" | "paused";

/** Seller category (Prisma `SellerCategory` enum). */
export type SellerCategory = "FAIT_MAISON" | "TRAITEUR" | "RESTAURANT";

/** One listing row as returned by the admin list endpoint. */
export interface AdminListing {
  id: string;
  title: string;
  status: AdminListingStatus;
  category: SellerCategory;
  cuisineTypes: string[];
  dietaryTags: string[];
  dishTypes: string[];
  photo: string | null;
  priceCents: number;
  portionsLeft: number | null;
  expiresAt: string | null;
  sellerId: string;
  sellerName: string;
  reportCount: number;
  orderCount: number;
  createdAt: string;
}

/** The list endpoint resolves to a bare array of rows. */
export type AdminListingsListResponse = AdminListing[];

/** Selectable status filter values (`all` = no `status` query param). */
export const STATUS_OPTIONS: { value: AdminListingStatus | "all"; label: string }[] = [
  { value: "all", label: "Tous statuts" },
  { value: "active", label: "Actives" },
  { value: "sold-out", label: "Épuisées" },
  { value: "expired", label: "Expirées" },
  { value: "paused", label: "En pause" },
];

/**
 * Status pill. `AdminListingStatus` is value-identical to the shared
 * `ListingStatus` union, so we reuse `ListingStatusBadge` read-only.
 */
export function ListingStatus({ status }: { status: AdminListingStatus }) {
  return <ListingStatusBadge status={status} />;
}

const CATEGORY_LABEL: Record<string, string> = {
  FAIT_MAISON: "Fait Maison",
  TRAITEUR: "Traiteur",
  RESTAURANT: "Restaurant",
};

type BadgeVariant = "primary" | "secondary" | "info" | "neutral";

const CATEGORY_VARIANT: Record<string, BadgeVariant> = {
  FAIT_MAISON: "primary",
  TRAITEUR: "secondary",
  RESTAURANT: "info",
};

/**
 * Category pill built on the shared `Badge` primitive — the shared
 * `CategoryBadge` only models the mock `faitMaison`/`traiteur`/`restaurant`
 * union, not the real Prisma `FAIT_MAISON`/… enum.
 */
export function CategoryChip({ category }: { category: SellerCategory }) {
  return (
    <Badge variant={CATEGORY_VARIANT[category] ?? "neutral"}>
      {CATEGORY_LABEL[category] ?? prettyEnum(category)}
    </Badge>
  );
}

const DIET_LABEL: Record<string, string> = {
  HALAL: "Halal",
  VEGAN: "Végan",
  GLUTEN_FREE: "Sans gluten",
  CASHER: "Casher",
};

const CUISINE_LABEL: Record<string, string> = {
  ORIENTALE: "Orientale",
  FRANCAISE: "Française",
  AFRICAINE: "Africaine",
  PORTUGAISE: "Portugaise",
  ITALIENNE: "Italienne",
  ESPAGNOLE: "Espagnole",
  LATINE: "Latine",
};

const DISH_LABEL: Record<string, string> = {
  ENTREE: "Entrée",
  PLAT: "Plat",
  DESSERT: "Dessert",
  COCKTAIL_DINATOIRE: "Cocktail dînatoire",
  BOISSON: "Boisson",
};

/** Prettify an unknown SCREAMING_SNAKE enum value: `FOO_BAR` → `Foo bar`. */
function prettyEnum(value: string): string {
  const s = value.replace(/_/g, " ").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Small neutral chip used for cuisine / diet / dish-type array values. */
function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full bg-surface-container-high px-2 text-[10.5px] font-medium uppercase tracking-wide text-on-surface-variant",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DietChip({ tag }: { tag: string }) {
  return (
    <Chip className="bg-success/15 text-success">{DIET_LABEL[tag] ?? prettyEnum(tag)}</Chip>
  );
}

export function CuisineChip({ cuisine }: { cuisine: string }) {
  return <Chip>{CUISINE_LABEL[cuisine] ?? prettyEnum(cuisine)}</Chip>;
}

export function DishTypeChip({ dish }: { dish: string }) {
  return (
    <Chip className="bg-primary/15 text-primary">{DISH_LABEL[dish] ?? prettyEnum(dish)}</Chip>
  );
}
