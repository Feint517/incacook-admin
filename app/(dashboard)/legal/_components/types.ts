/**
 * Local wire types for the legal-documents management surface, mirroring the
 * backend `LegalDocumentView` returned by IncaCook-Server
 * (`src/modules/compliance/legal-documents/legal-documents.service.ts`) as it is
 * exposed by:
 *   - `GET  /v1/admin/legal-documents`         (bare array — all CGU/CGV docs)
 *   - `GET  /v1/admin/legal-documents/active`  (bare array — active per kind)
 *   - `POST /v1/admin/legal-documents`         (create a draft, inactive)
 *   - `PATCH /v1/admin/legal-documents/:id`    (edit version/title/content)
 *   - `POST /v1/admin/legal-documents/:id/publish` (flip the active version)
 *
 * Kept in `_components` so this page owns its contract without importing from
 * `lib/**`. Dates arrive as ISO strings (JSON-serialized `Date`).
 */

/**
 * Document kind. The backend `CharterKind` enum has more values
 * (HYGIENE/FAIT_MAISON/…) but only CGU/CGV are managed by this feature — the
 * create DTO validates against exactly these two.
 */
export type LegalKind = "CGU" | "CGV";

/** A legal document row (list and active share the same `LegalDocumentView`). */
export interface LegalDocument {
  id: string;
  kind: LegalKind | string;
  version: string;
  title: string;
  content: string;
  isActive: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Body for `POST /v1/admin/legal-documents` (create a draft). */
export interface CreateLegalDocumentInput {
  kind: LegalKind;
  version: string;
  title: string;
  content: string;
}

/** Body for `PATCH /v1/admin/legal-documents/:id` (all fields optional). */
export interface UpdateLegalDocumentInput {
  version?: string;
  title?: string;
  content?: string;
}

/** Field length limits mirrored from the server DTOs (class-validator). */
export const FIELD_LIMITS = {
  version: 20,
  title: 200,
  content: 100_000,
} as const;

export const KIND_LABEL: Record<LegalKind, string> = {
  CGU: "CGU — Conditions générales d'utilisation",
  CGV: "CGV — Conditions générales de vente",
};

/** Short label for badges/columns. */
export const KIND_SHORT: Record<LegalKind, string> = {
  CGU: "CGU",
  CGV: "CGV",
};

/** The two kinds a document can be created as. */
export const LEGAL_KINDS: LegalKind[] = ["CGU", "CGV"];

export function kindLabel(kind: string): string {
  return KIND_LABEL[kind as LegalKind] ?? kind;
}

export function kindShort(kind: string): string {
  return KIND_SHORT[kind as LegalKind] ?? kind;
}
