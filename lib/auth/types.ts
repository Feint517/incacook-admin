/**
 * Auth-layer wire + domain types for the admin panel.
 *
 * Shapes mirror the IncaCook backend:
 *  - `SessionResponse`  → `POST /v1/auth/{signin,refresh}` (SessionResponseDto)
 *  - `AuthUser`         → `GET  /v1/users/me` (UserResponseDto)
 */

/** Session envelope returned by signin/refresh. */
export interface SessionResponse {
  accessToken: string;
  refreshToken: string;
  /** Unix seconds. */
  expiresAt: number;
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    emailConfirmedAt: string | null;
    phoneConfirmedAt: string | null;
  };
}

/** Backend user roles (mirrors `UserRole` enum server-side). */
export type UserRole = "BUYER" | "SELLER" | "DRIVER" | "ADMIN" | "MODERATOR";

/** Roles allowed into the admin panel — matches `@Roles(Admin, Moderator)`. */
export const ADMIN_ROLES: readonly UserRole[] = ["ADMIN", "MODERATOR"] as const;

/** True when a role may access the admin `(dashboard)` route group. */
export function isAdminRole(role: string): boolean {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

/** The `GET /v1/users/me` shape we consume (subset of UserResponseDto). */
export interface AuthUser {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatarPath: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
}

/** Lifecycle of the client-side auth session. */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
