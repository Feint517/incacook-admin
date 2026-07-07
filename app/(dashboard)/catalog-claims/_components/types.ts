/**
 * Local wire types for the catalog SAV (after-sales) claims surface, mirroring
 * the backend `CatalogClaim` Prisma model (IncaCook-Server `prisma/schema.prisma`)
 * as returned by `GET /v1/admin/catalog-claims` (bare array) and
 * `GET /v1/admin/catalog-claims/:id` (claim + linked catalog order + seller).
 * Kept in `_components` so this page owns its contract without importing from
 * `lib/**`.
 *
 * Dates arrive as ISO strings (JSON-serialized `Date`).
 */

/** Claim reason — free-form string on the backend, enumerated here. */
export type CatalogClaimType = "NEVER_RECEIVED" | "DEFECTIVE" | "WRONG_ITEM";

/** Claim lifecycle — free-form string on the backend, enumerated here. */
export type CatalogClaimStatus =
  | "OPEN"
  | "ADMIN_REVIEW"
  | "REFUNDED"
  | "REPLACEMENT_REQUESTED"
  | "REJECTED"
  | "RESOLVED";

/** A catalog claim row (list + base of the detail payload). */
export interface CatalogClaim {
  id: string;
  catalogOrderId: string;
  sellerId: string;
  type: CatalogClaimType | string;
  status: CatalogClaimStatus | string;
  description: string;
  photoUrls: string[];
  adminNotes: string | null;
  refundAmountCents: number | null;
  replacementNotes: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

/** One line item on the linked catalog order (raw Prisma, snapshotted). */
export interface CatalogOrderItem {
  id: string;
  productId: string | null;
  nameSnapshot: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
}

/** The linked catalog order enriching the claim detail. */
export interface CatalogOrderDetail {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
  stripePaymentIntentId: string | null;
  stripeRefundId: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  items: CatalogOrderItem[];
}

/** The seller who opened the claim (resolved server-side). */
export interface ClaimSeller {
  id: string;
  name: string;
  email: string;
}

/**
 * `GET /v1/admin/catalog-claims/:id` — the claim spread at the top level plus
 * its linked `order` (with items) and `seller`.
 */
export interface CatalogClaimDetail extends CatalogClaim {
  order: CatalogOrderDetail | null;
  seller: ClaimSeller | null;
}

/** Terminal statuses — the claim is closed, no further admin action possible. */
export const TERMINAL_STATUSES: ReadonlySet<string> = new Set([
  "REFUNDED",
  "REJECTED",
  "RESOLVED",
]);

export function isTerminal(status: string): boolean {
  return TERMINAL_STATUSES.has(status);
}

export const STATUS_LABEL: Record<CatalogClaimStatus, string> = {
  OPEN: "Ouvert",
  ADMIN_REVIEW: "En revue admin",
  REFUNDED: "Remboursé",
  REPLACEMENT_REQUESTED: "Remplacement demandé",
  REJECTED: "Rejeté",
  RESOLVED: "Résolu",
};

export const STATUS_VARIANT: Record<
  CatalogClaimStatus,
  "warning" | "info" | "neutral" | "error" | "success"
> = {
  OPEN: "warning",
  ADMIN_REVIEW: "info",
  REFUNDED: "success",
  REPLACEMENT_REQUESTED: "info",
  REJECTED: "error",
  RESOLVED: "success",
};

export const TYPE_LABEL: Record<CatalogClaimType, string> = {
  NEVER_RECEIVED: "Jamais reçu",
  DEFECTIVE: "Défectueux",
  WRONG_ITEM: "Mauvais article",
};

export function statusLabel(status: string): string {
  return STATUS_LABEL[status as CatalogClaimStatus] ?? status;
}

export function typeLabel(type: string): string {
  return TYPE_LABEL[type as CatalogClaimType] ?? type;
}

/** Sentinel for the "all statuses" filter (Radix Select forbids empty values). */
export const STATUS_FILTER_ALL = "ALL";

/** Filter options for the list (`ALL` = no status filter). */
export const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: STATUS_FILTER_ALL, label: "Tous les statuts" },
  { value: "OPEN", label: "Ouvert" },
  { value: "ADMIN_REVIEW", label: "En revue admin" },
  { value: "REPLACEMENT_REQUESTED", label: "Remplacement demandé" },
  { value: "REFUNDED", label: "Remboursé" },
  { value: "REJECTED", label: "Rejeté" },
  { value: "RESOLVED", label: "Résolu" },
];

/** One admin resolution action; the path segment maps to the backend endpoint. */
export interface ClaimAction {
  /** URL segment: `POST /admin/catalog-claims/:id/<endpoint>`. */
  endpoint: "refund" | "request-replacement" | "reject" | "resolve";
  label: string;
  /** Short line shown in the confirm dialog. */
  description: string;
  /** Button visual weight. */
  variant: "default" | "outline" | "danger";
  /**
   * When true, the confirm dialog exposes an optional partial refund amount
   * (the refund DTO accepts `refundAmountCents`; defaults to the order total).
   */
  showAmount?: boolean;
}

export const CLAIM_ACTIONS: ClaimAction[] = [
  {
    endpoint: "refund",
    label: "Rembourser",
    description:
      "Rembourse la commande catalogue via Stripe (idempotent) et clôt la réclamation.",
    variant: "default",
    showAmount: true,
  },
  {
    endpoint: "request-replacement",
    label: "Demander un remplacement",
    description:
      "Demande un remplacement au partenaire — la réclamation reste ouverte.",
    variant: "outline",
  },
  {
    endpoint: "resolve",
    label: "Résoudre",
    description: "Clôture la réclamation comme résolue, sans remboursement.",
    variant: "outline",
  },
  {
    endpoint: "reject",
    label: "Rejeter",
    description: "Clôt la réclamation sans remboursement ni remplacement.",
    variant: "danger",
  },
];

/** Body accepted by the four action endpoints (superset across the DTOs). */
export interface ClaimActionBody {
  notes?: string;
  refundAmountCents?: number;
}
