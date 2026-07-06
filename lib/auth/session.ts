/**
 * Session helpers built on `@/lib/api`: signin, signout, the single-flight
 * 401 refresh, and an `authRequest()` wrapper that attaches the bearer and
 * replays once after a refresh.
 *
 * Owns the token-storage / refresh / 401-replay layer on top of the framework
 * -agnostic API client (which only *attaches* a bearer via its auth seam).
 */
import {
  ApiError,
  ErrorCodes,
  get,
  post,
  type ApiSuccess,
  type RequestOptions,
} from "@/lib/api";

import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveSession,
  type StoredSession,
} from "./token-store";
import type { AuthUser, SessionResponse } from "./types";

function toStored(session: SessionResponse): StoredSession {
  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresAt: session.expiresAt,
  };
}

function isUnauthorized(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.statusCode === 401 || error.code === ErrorCodes.UNAUTHORIZED)
  );
}

/* -------------------------------------------------------------------------- */
/* Session-expired notification                                               */
/* -------------------------------------------------------------------------- */

let sessionExpiredHandler: (() => void) | null = null;

/**
 * Register a callback fired when a refresh fails (session is gone). The
 * AuthProvider uses this to flip its status to `unauthenticated`. Pass `null`
 * to unsubscribe.
 */
export function setOnSessionExpired(handler: (() => void) | null): void {
  sessionExpiredHandler = handler;
}

function onSessionExpired(): void {
  clearSession();
  sessionExpiredHandler?.();
}

/* -------------------------------------------------------------------------- */
/* Single-flight refresh                                                      */
/* -------------------------------------------------------------------------- */

/** The in-flight refresh, if any — the "single flight" that callers share. */
let refreshInFlight: Promise<StoredSession> | null = null;

async function performRefresh(): Promise<StoredSession> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new ApiError({
      statusCode: 401,
      code: ErrorCodes.UNAUTHORIZED,
      message: "No refresh token available",
    });
  }
  // Bare call (no auth seam) — refresh authenticates with the refresh token in
  // the body, and must never itself trigger the 401-replay loop.
  const { data } = await post<SessionResponse>("/auth/refresh", {
    refreshToken,
  });
  const stored = toStored(data);
  saveSession(stored);
  return stored;
}

/**
 * Refresh the session, coalescing concurrent callers onto one request. A burst
 * of parallel 401s all await the same promise instead of racing N refreshes.
 */
export function refreshSession(): Promise<StoredSession> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

/* -------------------------------------------------------------------------- */
/* Authenticated request wrapper (bearer + 401 replay)                        */
/* -------------------------------------------------------------------------- */

function authOptions(extra?: RequestOptions): RequestOptions {
  return { ...extra, getToken: getAccessToken };
}

/**
 * Run an authenticated API call with automatic bearer attachment and a single
 * 401 → refresh → replay. On a failed refresh the session is cleared and the
 * refresh error propagates.
 *
 * Usage:
 *
 *   const { data } = await authRequest((opts) => get<Thing>("/things", opts));
 *
 * The callback receives `RequestOptions` carrying the `getToken` seam; spread
 * it into your `@/lib/api` call so the bearer (and any retry token) is applied.
 */
export async function authRequest<T>(
  run: (options: RequestOptions) => Promise<ApiSuccess<T>>,
): Promise<ApiSuccess<T>> {
  try {
    return await run(authOptions());
  } catch (error) {
    if (!isUnauthorized(error)) throw error;

    try {
      await refreshSession();
    } catch (refreshError) {
      onSessionExpired();
      throw refreshError;
    }

    // Retry exactly once with the freshly stored token.
    return run(authOptions());
  }
}

/* -------------------------------------------------------------------------- */
/* Public auth actions                                                        */
/* -------------------------------------------------------------------------- */

/** `GET /v1/users/me` (with refresh-on-401). */
export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await authRequest<AuthUser>((opts) =>
    get<AuthUser>("/users/me", opts),
  );
  return data;
}

/**
 * `POST /v1/auth/signin` → persist tokens → `GET /v1/users/me`.
 * Returns the authenticated user (role included) so callers can enforce the
 * admin gate. Throws `ApiError` on bad credentials.
 */
export async function signIn(
  email: string,
  password: string,
): Promise<AuthUser> {
  const { data } = await post<SessionResponse>("/auth/signin", {
    email,
    password,
  });
  saveSession(toStored(data));
  return fetchCurrentUser();
}

/**
 * `POST /v1/auth/signout` (best-effort) then wipe local tokens. Server signout
 * returns 204 (no envelope) so the client throws; that's swallowed — clearing
 * local state is what matters.
 */
export async function signOut(): Promise<void> {
  const token = getAccessToken();
  try {
    if (token) await post<null>("/auth/signout", undefined, { token });
  } catch {
    // Best-effort: revoke may 204/fail; local clear below is authoritative.
  } finally {
    clearSession();
  }
}
