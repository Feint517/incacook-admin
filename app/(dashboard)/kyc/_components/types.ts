/**
 * Local wire types for the KYC review surface, mirroring the backend DTOs in
 * IncaCook-Server (`src/modules/admin/kyc/dto/*`). Kept in `_components` so this
 * page owns its contract without importing from `lib/**`.
 *
 * Dates arrive as ISO strings (JSON-serialized `Date`).
 */

/** KYC review state — `KycStatus` enum (list-admin-kyc-documents.query.dto). */
export type KycReviewState = "PENDING" | "APPROVED" | "REJECTED";

/** Document slot — Prisma `KycDocType`. */
export type KycDocType =
  | "ID_FRONT"
  | "ID_BACK"
  | "SELFIE"
  | "DRIVING_LICENSE"
  | "CARTE_GRISE"
  | "INSURANCE";

/** Submitter role — `UserRole` enum. */
export type SubmitterRole = "BUYER" | "SELLER" | "DRIVER" | "ADMIN" | "MODERATOR";

/** Row in `GET /v1/admin/kyc/documents` (AdminKycDocumentListItemDto). */
export interface KycDocumentListItem {
  id: string;
  type: KycDocType;
  reviewState: KycReviewState;
  submittedAt: string;
  reviewedAt: string | null;
  submitter: {
    userId: string;
    role: SubmitterRole;
    email: string;
    firstName: string;
    lastName: string;
  };
}

/** `GET /v1/admin/kyc/documents/:id` (AdminKycDocumentResponseDto). */
export interface KycDocumentDetail {
  id: string;
  type: KycDocType;
  reviewState: KycReviewState;
  /** Signed Storage URL, 15-minute TTL. */
  fileUrl: string;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewerId: string | null;
  metadata: Record<string, unknown> | null;
  submitter: {
    userId: string;
    role: SubmitterRole;
    email: string;
    firstName: string;
    lastName: string;
    siret?: string | null;
    businessName?: string | null;
  };
}

/** Return of approve/reject (`{ id, reviewState }`). */
export interface KycActionResult {
  id: string;
  reviewState: string;
}

export const DOC_TYPE_LABEL: Record<KycDocType, string> = {
  ID_FRONT: "Pièce d'identité (recto)",
  ID_BACK: "Pièce d'identité (verso)",
  SELFIE: "Selfie",
  DRIVING_LICENSE: "Permis de conduire",
  CARTE_GRISE: "Carte grise",
  INSURANCE: "Assurance",
};

export const ROLE_LABEL: Record<SubmitterRole, string> = {
  BUYER: "Acheteur",
  SELLER: "Vendeur",
  DRIVER: "Livreur",
  ADMIN: "Admin",
  MODERATOR: "Modérateur",
};

export const REVIEW_STATE_LABEL: Record<KycReviewState, string> = {
  PENDING: "En attente",
  APPROVED: "Approuvé",
  REJECTED: "Rejeté",
};

export const REVIEW_STATE_VARIANT: Record<
  KycReviewState,
  "warning" | "success" | "error"
> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
};
