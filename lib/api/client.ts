/**
 * The single typed HTTP client for the admin app.
 *
 * No page or component should call `fetch` directly — go through the
 * `get/post/patch/put/del` helpers here. Each decodes the standard IncaCook
 * response envelope (docs/backend-communication.md §3) and returns
 * `ApiSuccess<T>` (`{ data, pagination }`) or throws `ApiError`.
 *
 * Framework-agnostic: uses the global `fetch`, so it works from both server
 * and client components.
 */
import { ErrorCodes } from "./error-codes";
import {
  ApiError,
  type ApiEnvelope,
  type ApiSuccess,
  type Pagination,
} from "./types";

/** Production Railway fallback, used when the env var is unset. */
const DEFAULT_BASE_URL = "https://incacook-api-production.up.railway.app";

/** All endpoints are mounted under `/v1`. */
const API_PREFIX = "/v1";

/**
 * Resolved base URL including the `/v1` prefix, e.g.
 * `https://…up.railway.app/v1`. Reads `NEXT_PUBLIC_API_BASE_URL` (inlined at
 * build time by Next.js for client bundles) with the Railway prod fallback.
 */
export const API_BASE_URL = `${(
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL
).replace(/\/+$/, "")}${API_PREFIX}`;

/** Supported HTTP verbs for the low-level `request()`. */
type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

/**
 * Per-request options.
 *
 * Auth seam for TASK-002: pass either a ready `token`, or a `getToken`
 * callback the auth layer can inject. This client only *attaches* a bearer —
 * it does NOT own token storage, refresh, or 401 replay (that's TASK-002).
 */
export interface RequestOptions {
  /** Explicit bearer token to attach as `Authorization: Bearer <token>`. */
  token?: string | null;
  /** Lazy bearer resolver, used when `token` is not provided. */
  getToken?: () => string | null | undefined;
  /** Extra headers, merged over the defaults. */
  headers?: Record<string, string>;
  /** Query params appended to the URL (nullish values are skipped). */
  query?: Record<string, string | number | boolean | null | undefined>;
  /** Abort signal for timeout/cancellation. */
  signal?: AbortSignal;
  /** Idempotency-Key header (see docs §6) for safe-to-retry mutations. */
  idempotencyKey?: string;
  /** Passthrough for Next.js fetch cache/revalidate options. */
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
}

function buildUrl(
  path: string,
  query?: RequestOptions["query"],
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

function resolveToken(options?: RequestOptions): string | null {
  if (options?.token) return options.token;
  if (options?.getToken) return options.getToken() ?? null;
  return null;
}

/** Best-effort JSON parse; returns `undefined` on empty or non-JSON bodies. */
async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function isEnvelope(body: unknown): body is ApiEnvelope<unknown> {
  return (
    typeof body === "object" &&
    body !== null &&
    "success" in body &&
    typeof (body as { success: unknown }).success === "boolean"
  );
}

function normalizePagination(raw: unknown): Pagination | null {
  if (typeof raw !== "object" || raw === null) return null;
  const p = raw as Record<string, unknown>;
  return {
    hasMore: p.hasMore === true,
    total: typeof p.total === "number" ? p.total : null,
    nextCursor: typeof p.nextCursor === "string" ? p.nextCursor : null,
    page: typeof p.page === "number" ? p.page : null,
    limit: typeof p.limit === "number" ? p.limit : null,
  };
}

/**
 * Low-level request. Prefer the `get/post/...` helpers below.
 *
 * Resolves to `{ data, pagination }` on `2xx` + `success: true`. Throws
 * `ApiError` on any error envelope, non-2xx status, non-JSON error body, or
 * transport failure (network error / abort).
 */
export async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<ApiSuccess<T>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options?.headers,
  };

  const hasBody = body !== undefined && body !== null;
  if (hasBody && headers["Content-Type"] === undefined) {
    headers["Content-Type"] = "application/json";
  }

  const token = resolveToken(options);
  if (token) headers.Authorization = `Bearer ${token}`;

  if (options?.idempotencyKey) {
    headers["Idempotency-Key"] = options.idempotencyKey;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options?.query), {
      method,
      headers,
      body: hasBody ? JSON.stringify(body) : undefined,
      signal: options?.signal,
      cache: options?.cache,
      ...(options?.next ? { next: options.next } : {}),
    });
  } catch (cause) {
    // Network failure, DNS, or abort — no HTTP response at all.
    const aborted =
      cause instanceof DOMException && cause.name === "AbortError";
    throw new ApiError({
      statusCode: 0,
      code: aborted ? "REQUEST_ABORTED" : "NETWORK_ERROR",
      message:
        cause instanceof Error
          ? cause.message
          : "Network request failed",
      details: cause,
    });
  }

  const parsed = await parseJson(response);

  // Well-formed envelope — the happy path and structured errors.
  if (isEnvelope(parsed)) {
    if (parsed.success) {
      return {
        data: parsed.data as T,
        pagination: normalizePagination(parsed.pagination),
      };
    }
    const err = parsed.error;
    throw new ApiError({
      statusCode: err.statusCode ?? response.status,
      code: err.code ?? ErrorCodes.VALIDATION,
      message: err.message ?? response.statusText,
      correlationId: err.correlationId ?? null,
      details: err.details,
    });
  }

  // No parseable envelope. If the status is 2xx, the body was unexpected;
  // otherwise it's an opaque error (e.g. a gateway 502 HTML page).
  throw new ApiError({
    statusCode: response.status,
    code: codeForStatus(response.status),
    message:
      response.status >= 200 && response.status < 300
        ? "Malformed success response (missing envelope)"
        : `Request failed with status ${response.status} ${response.statusText}`.trim(),
    details: parsed,
  });
}

/** Map a bare HTTP status to a stable code when the body carries none. */
function codeForStatus(status: number): string {
  switch (status) {
    case 401:
      return ErrorCodes.UNAUTHORIZED;
    case 403:
      return ErrorCodes.FORBIDDEN;
    case 404:
      return ErrorCodes.NOT_FOUND;
    case 409:
      return ErrorCodes.CONFLICT;
    case 400:
    case 422:
      return ErrorCodes.VALIDATION;
    default:
      return "HTTP_ERROR";
  }
}

export function get<T>(
  path: string,
  options?: RequestOptions,
): Promise<ApiSuccess<T>> {
  return request<T>("GET", path, undefined, options);
}

export function post<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<ApiSuccess<T>> {
  return request<T>("POST", path, body, options);
}

export function patch<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<ApiSuccess<T>> {
  return request<T>("PATCH", path, body, options);
}

export function put<T>(
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<ApiSuccess<T>> {
  return request<T>("PUT", path, body, options);
}

export function del<T>(
  path: string,
  options?: RequestOptions,
): Promise<ApiSuccess<T>> {
  return request<T>("DELETE", path, undefined, options);
}
