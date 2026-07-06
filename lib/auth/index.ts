/**
 * Public surface of the admin auth layer. Import from `@/lib/auth`.
 *
 *   import { AuthProvider, useAuth, AuthGuard, getAccessToken } from "@/lib/auth";
 *
 * `getAccessToken` is the synchronous seam for the API client's `getToken`:
 *
 *   import { get } from "@/lib/api";
 *   import { getAccessToken } from "@/lib/auth";
 *   get("/users/me", { getToken: getAccessToken });
 *
 * ...or use `authRequest()` to also get single-flight 401 refresh + replay.
 */
export { AuthProvider, useAuth } from "./auth-provider";
export { AuthGuard } from "./auth-guard";

export {
  authRequest,
  fetchCurrentUser,
  refreshSession,
  setOnSessionExpired,
  signIn,
  signOut,
} from "./session";

export { getAccessToken, getRefreshToken } from "./token-store";

export {
  ADMIN_ROLES,
  isAdminRole,
  type AuthStatus,
  type AuthUser,
  type SessionResponse,
  type UserRole,
} from "./types";
