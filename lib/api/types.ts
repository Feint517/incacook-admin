/**
 * Wire contract types for the IncaCook backend.
 *
 * The backend always returns the same envelope (see
 * docs/backend-communication.md §3):
 *
 * Success:
 * ```json
 * { "success": true, "data": {...}, "meta": {...}, "pagination": {...} }
 * ```
 *
 * Error:
 * ```json
 * { "success": false,
 *   "error": { "statusCode", "code", "message", "correlationId", "details" } }
 * ```
 */

/** Response metadata attached to every success envelope. */
export interface ApiMeta {
  timestamp?: string;
  version?: string;
  [key: string]: unknown;
}

/**
 * Pagination block returned alongside list data. Supports both styles the
 * backend uses:
 *  - Cursor (feeds / infinite scroll): `hasMore` + `nextCursor`.
 *  - Offset/page (admin / moderation lists): `page`, `limit`, `total`, `hasMore`.
 * Fields not relevant to a given style come back as `null`.
 */
export interface Pagination {
  hasMore: boolean;
  total: number | null;
  nextCursor: string | null;
  page: number | null;
  limit: number | null;
}

/** Raw success envelope as it comes off the wire. */
export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
  pagination?: Pagination | null;
}

/** Raw error envelope as it comes off the wire. */
export interface ApiErrorEnvelope {
  success: false;
  error: {
    statusCode: number;
    code: string;
    message: string;
    correlationId?: string | null;
    details?: unknown;
  };
}

/** Either arm of the discriminated envelope union. */
export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

/**
 * What the typed client helpers resolve to on a `2xx` + `success: true`
 * response: the decoded `data` plus the (possibly null) `pagination` block.
 */
export interface ApiSuccess<T> {
  data: T;
  pagination: Pagination | null;
}

/**
 * Thrown on `success: false`, on non-2xx responses, and on transport errors
 * (network failure, abort, non-JSON body). Carries the full error envelope
 * shape so callers can branch on `code` and surface `correlationId`.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly correlationId: string | null;
  readonly details: unknown;

  constructor(params: {
    statusCode: number;
    code: string;
    message: string;
    correlationId?: string | null;
    details?: unknown;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.correlationId = params.correlationId ?? null;
    this.details = params.details ?? null;

    // Restore prototype chain for `instanceof` after transpilation to ES5-ish
    // targets. Harmless on ES2022.
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  override toString(): string {
    const cid = this.correlationId ? ` correlationId=${this.correlationId}` : "";
    return `ApiError [${this.statusCode} ${this.code}]: ${this.message}${cid}`;
  }
}
