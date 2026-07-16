"use client";

/**
 * Local view models + presentation helpers for the Orders (Commandes) page.
 *
 * These mirror the real `GET /v1/admin/orders` list response. The server emits
 * an `{ items, limit, offset, hasMore }` payload which the API transform
 * interceptor hoists into the standard envelope — so the client decodes it to
 * `data` (a bare array of rows) plus `pagination.hasMore` (there is NO `total`).
 * Pagination is therefore next-only.
 *
 * Source of truth: IncaCook-Server `AdminOrdersService` (`ORDER_SELECT` +
 * `toItem`) and the Prisma `OrderStatus` / `SellerCategory` enums. Dates arrive
 * as ISO strings (JSON-serialized `Date`).
 */

import { Badge } from "@/components/ui/badge";

/** Order lifecycle — Prisma `OrderStatus`. */
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "PICKED_UP"
  | "IN_DELIVERY"
  | "DELIVERED"
  | "COMPLETED"
  | "NO_DRIVER_AVAILABLE"
  | "CANCELLED"
  | "REFUNDED"
  | "DISPUTED";

/** Seller category as it comes off the wire — Prisma `SellerCategory` (may be `""`). */
export type OrderCategory = "FAIT_MAISON" | "TRAITEUR" | "RESTAURANT" | "";

export type Fulfillment = "delivery" | "pickup";

/** One party (buyer / seller / driver) on an order. */
export interface OrderParty {
  id: string;
  name: string;
}

/** One order row from `GET /v1/admin/orders`. */
export interface AdminOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  buyer: OrderParty;
  seller: OrderParty;
  category: OrderCategory;
  itemCount: number;
  totalCents: number;
  fulfillment: Fulfillment;
  /** Delivery (dropoff) city — `null` for pickup orders. */
  city: string | null;
  driver: OrderParty | null;
}

/** The list endpoint resolves (post-hoist) to a bare array of rows. */
export type AdminOrdersListResponse = AdminOrder[];

type BadgeVariant =
  | "neutral"
  | "primary"
  | "secondary"
  | "info"
  | "warning"
  | "success"
  | "error";

// --- Status ------------------------------------------------------------------

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PREPARING: "En préparation",
  READY: "Prête",
  PICKED_UP: "Récupérée",
  IN_DELIVERY: "En livraison",
  DELIVERED: "Livrée",
  COMPLETED: "Terminée",
  NO_DRIVER_AVAILABLE: "Sans livreur",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
  DISPUTED: "Litige",
};

const ORDER_STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  PENDING: "info",
  CONFIRMED: "info",
  PREPARING: "warning",
  READY: "primary",
  PICKED_UP: "primary",
  IN_DELIVERY: "primary",
  DELIVERED: "success",
  COMPLETED: "success",
  NO_DRIVER_AVAILABLE: "warning",
  CANCELLED: "error",
  REFUNDED: "neutral",
  DISPUTED: "error",
};

/**
 * Status pill for real backend order statuses. Kept local because the shared
 * `OrderStatusBadge` only models the mock `new/accepted/…/cancelled` union and
 * can't express the 12-state Prisma `OrderStatus`. Uses the same `Badge`
 * primitive so the look matches the rest of the admin UI.
 */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={ORDER_STATUS_VARIANT[status] ?? "neutral"}>
      {ORDER_STATUS_LABEL[status] ?? status}
    </Badge>
  );
}

/** Status filter options exposed in the UI (every real status). */
export const ORDER_STATUS_FILTERS: { value: OrderStatus; label: string }[] = (
  Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]
).map((value) => ({ value, label: ORDER_STATUS_LABEL[value] }));

// --- Category ----------------------------------------------------------------

const CATEGORY_LABEL: Record<Exclude<OrderCategory, "">, string> = {
  FAIT_MAISON: "Fait Maison",
  TRAITEUR: "Traiteur",
  RESTAURANT: "Restaurant",
};

const CATEGORY_VARIANT: Record<Exclude<OrderCategory, "">, BadgeVariant> = {
  FAIT_MAISON: "primary",
  TRAITEUR: "secondary",
  RESTAURANT: "info",
};

/**
 * Category pill for real seller categories. Local for the same reason as the
 * status badge: the shared `CategoryBadge` speaks the mock
 * `faitMaison/traiteur/restaurant` union. Renders nothing when the seller has
 * no category (server sends `""`).
 */
export function OrderCategoryBadge({ category }: { category: OrderCategory }) {
  if (!category) return null;
  return (
    <Badge variant={CATEGORY_VARIANT[category] ?? "neutral"}>
      {CATEGORY_LABEL[category] ?? category}
    </Badge>
  );
}

// --- Helpers -----------------------------------------------------------------

/**
 * City to display. `city` is `null` for pickup orders (no dropoff address), so
 * fall back to "Retrait" there and "—" otherwise.
 */
export function cityLabel(order: Pick<AdminOrder, "city" | "fulfillment">): string {
  return order.city ?? (order.fulfillment === "pickup" ? "Retrait" : "—");
}
