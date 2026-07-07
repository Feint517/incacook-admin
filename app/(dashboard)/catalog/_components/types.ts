/**
 * Local wire types for the admin B2B supply catalog, mirroring the backend
 * DTOs in IncaCook-Server `src/modules/catalog/dto/*` as returned by:
 *   - `GET  /v1/admin/catalog/products`      → CatalogProduct[] (bare array)
 *   - `GET  /v1/admin/catalog/products/:id`  → CatalogProduct
 *   - `POST /v1/admin/catalog/products`      → CatalogProduct (created)
 *   - `PATCH /v1/admin/catalog/products/:id` → CatalogProduct (updated)
 *   - `DELETE /v1/admin/catalog/products/:id`→ 204 No Content (soft delete)
 *   - `GET  /v1/admin/catalog/orders`        → CatalogOrder[] (bare array)
 *
 * Kept in `_components` so this page owns its contract without importing from
 * `lib/**`. Money fields are integer cents; dates are ISO strings.
 *
 * NB: the product contract is `name, description, imageUrls, priceCents,
 * currency, isActive` — there is no `unit`/`category`/`stock` field on the
 * backend model, so those aren't modelled here.
 */

/** A catalog product as returned to admins (full, incl. inactive). */
export interface CatalogProduct {
  id: string;
  name: string;
  description: string | null;
  imageUrls: string[];
  priceCents: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Body for `POST /admin/catalog/products` (CreateCatalogProductDto). */
export interface CreateCatalogProductBody {
  name: string;
  description?: string;
  imageUrls?: string[];
  priceCents: number;
  currency?: string;
  isActive?: boolean;
}

/** Body for `PATCH /admin/catalog/products/:id` (UpdateCatalogProductDto). */
export type UpdateCatalogProductBody = Partial<CreateCatalogProductBody>;

// --- Orders (read-only) ------------------------------------------------------

/** Catalog order lifecycle (Prisma `CatalogOrderStatus`). */
export type CatalogOrderStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

/** One line item on a catalog order (product snapshot). */
export interface CatalogOrderItem {
  /** Null once the referenced product is deleted (snapshot survives). */
  productId: string | null;
  name: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
}

/** The seller who placed the order (resolved server-side). */
export interface CatalogOrderSeller {
  id: string;
  name: string;
  email: string;
}

/** A catalog order row from `GET /admin/catalog/orders`. */
export interface CatalogOrder {
  id: string;
  status: CatalogOrderStatus | string;
  totalCents: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
  items: CatalogOrderItem[];
  seller: CatalogOrderSeller;
}

export const ORDER_STATUS_LABEL: Record<CatalogOrderStatus, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  FAILED: "Échec",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

export const ORDER_STATUS_VARIANT: Record<
  CatalogOrderStatus,
  "warning" | "info" | "neutral" | "error" | "success"
> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "error",
  CANCELLED: "neutral",
  REFUNDED: "info",
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABEL[status as CatalogOrderStatus] ?? status;
}

// --- Money helpers (integer cents ⇆ euros) -----------------------------------

/** Integer cents → euros input string, e.g. `1990` → `"19.90"`. */
export function centsToEuroInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Euros text (accepts `,` or `.`) → integer cents, or `null` when the value is
 * not a finite number `> 0`. The DTO requires `priceCents >= 1`.
 */
export function euroInputToCents(euros: string): number | null {
  const parsed = Number.parseFloat(euros.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100);
}
