/**
 * Browser token store for the admin session.
 *
 * Storage choice: `localStorage`, mirrored by an in-memory copy.
 *  - The admin panel gates access with a *client/layout* guard (not SSR/edge),
 *    and every authenticated API call runs in the browser, so a JS-readable
 *    store is sufficient and simplest. (The mobile app uses OS secure storage;
 *    a cookie would only be needed for server-side/edge gating, which we don't
 *    do here.)
 *  - The in-memory mirror lets `getAccessToken()` stay synchronous — the API
 *    client's `getToken` seam is `() => string | null | undefined`, so it must
 *    resolve without a `localStorage` round-trip on every request.
 *
 * This module is the ONLY place that touches persisted tokens.
 */

/** Persisted session material. Identity/role live in AuthProvider, not here. */
export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  /** Unix seconds; informational (401-driven refresh is the source of truth). */
  expiresAt: number;
}

const ACCESS_KEY = "incacook.admin.access_token";
const REFRESH_KEY = "incacook.admin.refresh_token";
const EXPIRES_KEY = "incacook.admin.expires_at";

/** In-memory mirror so reads are synchronous and SSR-safe. */
let memory: StoredSession | null = null;
/** Whether we've attempted to hydrate `memory` from `localStorage` yet. */
let hydrated = false;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function hydrate(): void {
  if (hydrated || !isBrowser()) return;
  hydrated = true;
  const accessToken = window.localStorage.getItem(ACCESS_KEY);
  const refreshToken = window.localStorage.getItem(REFRESH_KEY);
  if (!accessToken || !refreshToken) return;
  const expiresRaw = window.localStorage.getItem(EXPIRES_KEY);
  memory = {
    accessToken,
    refreshToken,
    expiresAt: expiresRaw ? Number(expiresRaw) : 0,
  };
}

/** The current session, hydrating from `localStorage` on first read. */
export function loadSession(): StoredSession | null {
  if (!memory) hydrate();
  return memory;
}

/** Persist a fresh session (signin / refresh). */
export function saveSession(session: StoredSession): void {
  memory = session;
  hydrated = true;
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_KEY, session.accessToken);
  window.localStorage.setItem(REFRESH_KEY, session.refreshToken);
  window.localStorage.setItem(EXPIRES_KEY, String(session.expiresAt));
}

/** Wipe the session (signout / failed refresh). */
export function clearSession(): void {
  memory = null;
  hydrated = true;
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(EXPIRES_KEY);
}

/**
 * Synchronous access-token accessor for the API client's `getToken` seam:
 *
 *   get("/users/me", { getToken: getAccessToken })
 */
export function getAccessToken(): string | null {
  return loadSession()?.accessToken ?? null;
}

/** The refresh token, if any. */
export function getRefreshToken(): string | null {
  return loadSession()?.refreshToken ?? null;
}
