/**
 * Stable backend error codes.
 *
 * Mirrors the mobile app's `error_codes.dart` — controllers/pages must branch
 * on `ApiError.code` (one of these constants), never on the human-readable
 * `message`. Add new codes here as the backend introduces them.
 */
export const ErrorCodes = {
  UNAUTHORIZED: "INCACOOK_UNAUTHORIZED",
  VALIDATION: "INCACOOK_VALIDATION",
  CONFLICT: "INCACOOK_CONFLICT",
  NOT_FOUND: "INCACOOK_NOT_FOUND",
  FORBIDDEN: "INCACOOK_FORBIDDEN",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
