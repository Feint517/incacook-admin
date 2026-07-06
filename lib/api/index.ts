/**
 * Public surface of the typed API client. Import from `@/lib/api`.
 *
 *   import { get, post, ApiError, ErrorCodes } from "@/lib/api";
 */
export {
  API_BASE_URL,
  request,
  get,
  post,
  patch,
  put,
  del,
  type RequestOptions,
} from "./client";

export { ErrorCodes, type ErrorCode } from "./error-codes";

export {
  ApiError,
  type ApiSuccess,
  type Pagination,
  type ApiMeta,
  type ApiEnvelope,
  type ApiSuccessEnvelope,
  type ApiErrorEnvelope,
} from "./types";
