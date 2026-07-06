/**
 * Local wire types for the Reports (Signalements) moderation surface, mirroring
 * the backend DTOs in IncaCook-Server (`src/modules/moderation/*`). Kept in
 * `_components` so this page owns its contract without importing from `lib/**`.
 *
 * Dates arrive as ISO strings (JSON-serialized `Date`).
 */

/** Report lifecycle — Prisma `ReportStatus`. `DISMISSED` is legacy/unused. */
export type ReportStatus = "PENDING" | "DISMISSED" | "RESOLVED" | "REJECTED";

/**
 * The only statuses `PATCH /v1/admin/reports/:id/status` accepts (validated in
 * `ReportsService.updateStatus`). A `PENDING` report is resolved or rejected —
 * both are terminal; there is no path back out.
 */
export type ReportActionStatus = "RESOLVED" | "REJECTED";

/** Report type — Prisma `ReportReason` (the `reason` column). */
export type ReportReason =
  | "SPAM"
  | "INAPPROPRIATE"
  | "OFFENSIVE"
  | "FAKE"
  | "DUPLICATE"
  | "NON_FAIT_MAISON"
  | "MAUVAISE_HYGIENE"
  | "OTHER";

/** Polymorphic target discriminator (`targetType`). */
export type ReportTargetType = "LISTING" | "SELLER";

/** Row in `GET /v1/admin/reports` (`EnrichedReport`, newest first). */
export interface ReportListItem {
  id: string;
  type: ReportReason;
  status: ReportStatus;
  description: string | null;
  targetType: ReportTargetType;
  targetId: string;
  adminNote: string | null;
  createdAt: string;
  reporter: { id: string; email: string; name: string } | null;
  listing: { id: string; name: string; category: string } | null;
  seller: { id: string; email: string; name: string } | null;
}

/** Return of `PATCH /v1/admin/reports/:id/status` (`{ id, status }`). */
export interface ReportStatusResult {
  id: string;
  status: ReportStatus;
}

export const REPORT_TYPE_LABEL: Record<ReportReason, string> = {
  SPAM: "Spam",
  INAPPROPRIATE: "Inapproprié",
  OFFENSIVE: "Offensant",
  FAKE: "Faux",
  DUPLICATE: "Doublon",
  NON_FAIT_MAISON: "Non fait maison",
  MAUVAISE_HYGIENE: "Mauvaise hygiène",
  OTHER: "Autre",
};

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: "En attente",
  DISMISSED: "Ignoré",
  RESOLVED: "Résolu",
  REJECTED: "Rejeté",
};

export const REPORT_STATUS_VARIANT: Record<
  ReportStatus,
  "warning" | "neutral" | "success" | "error"
> = {
  PENDING: "warning",
  DISMISSED: "neutral",
  RESOLVED: "success",
  REJECTED: "error",
};

/** Status filter options exposed in the UI (legacy `DISMISSED` omitted). */
export const STATUS_FILTERS: { value: ReportStatus; label: string }[] = [
  { value: "PENDING", label: "En attente" },
  { value: "RESOLVED", label: "Résolus" },
  { value: "REJECTED", label: "Rejetés" },
];

/** Type filter options exposed in the UI. */
export const TYPE_FILTERS: { value: ReportReason; label: string }[] = [
  { value: "MAUVAISE_HYGIENE", label: "Mauvaise hygiène" },
  { value: "NON_FAIT_MAISON", label: "Non fait maison" },
  { value: "SPAM", label: "Spam" },
  { value: "INAPPROPRIATE", label: "Inapproprié" },
  { value: "OFFENSIVE", label: "Offensant" },
  { value: "FAKE", label: "Faux" },
  { value: "DUPLICATE", label: "Doublon" },
  { value: "OTHER", label: "Autre" },
];
