/**
 * Local wire types for the disputes resolution surface, mirroring the backend
 * `OrderDispute` Prisma model (IncaCook-Server `prisma/schema.prisma`) as it is
 * returned by `GET /v1/admin/disputes` (bare array) and
 * `GET /v1/admin/disputes/:id`. Kept in `_components` so this page owns its
 * contract without importing from `lib/**`.
 *
 * Dates arrive as ISO strings (JSON-serialized `Date`).
 */

/** Dispute lifecycle — free-form string on the backend, enumerated here. */
export type DisputeStatus =
  | "OPEN"
  | "ADMIN_REVIEW"
  | "AUTO_REFUNDED"
  | "REJECTED"
  | "RESOLVED";

/** Dispute reason — free-form string on the backend, enumerated here. */
export type DisputeType =
  | "NEVER_RECEIVED"
  | "WRONG_ORDER"
  | "SPOILED_FOOD"
  | "FOOD_POISONING"
  | "SUBJECTIVE_DISSATISFACTION"
  | "ALLERGEN_FALSE_DECLARATION"
  | "CHARGEBACK";

/**
 * A dispute record. The list rows and the detail payload share the same shape
 * (both return the full `OrderDispute` row).
 */
export interface Dispute {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  deliveryId: string | null;
  type: DisputeType | string;
  status: DisputeStatus | string;
  description: string | null;
  photoUrls: string[] | null;
  proofFileUrls: string[] | null;
  refundRequested: boolean;
  refundApproved: boolean;
  refundAmountCents: number | null;
  adminNotes: string | null;
  stripeDisputeId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

/** Terminal statuses — no further admin action is possible. */
export const TERMINAL_STATUSES: ReadonlySet<string> = new Set([
  "RESOLVED",
  "REJECTED",
  "AUTO_REFUNDED",
]);

export function isTerminal(status: string): boolean {
  return TERMINAL_STATUSES.has(status);
}

export const STATUS_LABEL: Record<DisputeStatus, string> = {
  OPEN: "Ouvert",
  ADMIN_REVIEW: "En revue admin",
  AUTO_REFUNDED: "Remboursé (auto)",
  REJECTED: "Rejeté",
  RESOLVED: "Résolu",
};

export const STATUS_VARIANT: Record<
  DisputeStatus,
  "warning" | "info" | "neutral" | "error" | "success"
> = {
  OPEN: "warning",
  ADMIN_REVIEW: "info",
  AUTO_REFUNDED: "neutral",
  REJECTED: "error",
  RESOLVED: "success",
};

export const TYPE_LABEL: Record<DisputeType, string> = {
  NEVER_RECEIVED: "Jamais reçu",
  WRONG_ORDER: "Mauvaise commande",
  SPOILED_FOOD: "Nourriture avariée",
  FOOD_POISONING: "Intoxication alimentaire",
  SUBJECTIVE_DISSATISFACTION: "Insatisfaction subjective",
  ALLERGEN_FALSE_DECLARATION: "Fausse déclaration d'allergène",
  CHARGEBACK: "Rétrofacturation (chargeback)",
};

export function statusLabel(status: string): string {
  return STATUS_LABEL[status as DisputeStatus] ?? status;
}

export function typeLabel(type: string): string {
  return TYPE_LABEL[type as DisputeType] ?? type;
}

/** Sentinel for the "all statuses" filter (Radix Select forbids empty values). */
export const STATUS_FILTER_ALL = "ALL";

/** Filter options for the list (`ALL` = no status filter). */
export const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: STATUS_FILTER_ALL, label: "Tous les statuts" },
  { value: "OPEN", label: "Ouvert" },
  { value: "ADMIN_REVIEW", label: "En revue admin" },
  { value: "AUTO_REFUNDED", label: "Remboursé (auto)" },
  { value: "REJECTED", label: "Rejeté" },
  { value: "RESOLVED", label: "Résolu" },
];

/** One admin resolution action; the path segment maps to the backend endpoint. */
export interface DisputeAction {
  /** URL segment: `POST /admin/disputes/:id/<endpoint>`. */
  endpoint:
    | "approve-refund"
    | "reject"
    | "resolve"
    | "confirm-allergen"
    | "confirm-chargeback-fraud";
  label: string;
  /** Short line shown in the confirm dialog. */
  description: string;
  /** Button visual weight. */
  variant: "default" | "outline" | "danger";
}

export const DISPUTE_ACTIONS: DisputeAction[] = [
  {
    endpoint: "approve-refund",
    label: "Approuver le remboursement",
    description:
      "Rembourse la commande (idempotent) et clôt le litige comme résolu.",
    variant: "default",
  },
  {
    endpoint: "reject",
    label: "Rejeter le litige",
    description: "Clôt le litige sans remboursement.",
    variant: "danger",
  },
  {
    endpoint: "resolve",
    label: "Résoudre sans remboursement",
    description: "Clôture informative — aucun remboursement.",
    variant: "outline",
  },
  {
    endpoint: "confirm-allergen",
    label: "Confirmer la fausse déclaration d'allergène",
    description:
      "Ajoute une sanction GRAVE au vendeur (suspension au seuil) et résout le litige.",
    variant: "danger",
  },
  {
    endpoint: "confirm-chargeback-fraud",
    label: "Confirmer le chargeback frauduleux",
    description:
      "Ajoute une sanction GRAVE à l'acheteur (suspension au seuil) et résout le litige.",
    variant: "danger",
  },
];
