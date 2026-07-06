"use client";

/**
 * React auth context: bootstraps the session from stored tokens, exposes
 * `{ user, status, signIn, signOut }`, and reacts to failed refreshes.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getAccessToken } from "./token-store";
import {
  fetchCurrentUser,
  setOnSessionExpired,
  signIn as apiSignIn,
  signOut as apiSignOut,
} from "./session";
import type { AuthStatus, AuthUser } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  /** Signs in and returns the user (role included) for gate checks. */
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // Bootstrap: if we have a stored token, resolve the current user (refreshing
  // on a 401 as needed); otherwise we're unauthenticated.
  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!getAccessToken()) {
        if (active) setStatus("unauthenticated");
        return;
      }
      try {
        const me = await fetchCurrentUser();
        if (!active) return;
        setUser(me);
        setStatus("authenticated");
      } catch {
        if (!active) return;
        setUser(null);
        setStatus("unauthenticated");
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  // A failed refresh mid-session clears tokens; reflect that in the UI.
  useEffect(() => {
    setOnSessionExpired(() => {
      setUser(null);
      setStatus("unauthenticated");
    });
    return () => setOnSessionExpired(null);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const me = await apiSignIn(email, password);
    setUser(me);
    setStatus("authenticated");
    return me;
  }, []);

  const signOut = useCallback(async () => {
    await apiSignOut();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, signIn, signOut }),
    [user, status, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
