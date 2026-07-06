"use client";

/**
 * Client guard for the `(dashboard)` route group.
 *
 *  - `loading`        → a neutral splash while the session resolves.
 *  - `unauthenticated`→ redirect to `/login`.
 *  - authed non-admin → an explicit "not authorized" state (with sign-out).
 *  - authed admin/mod → renders `children` (server components pass through).
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-provider";
import { isAdminRole } from "./types";

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-on-surface">
      {children}
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, status, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <FullScreen>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
        <p className="text-sm text-on-surface-variant">Chargement…</p>
      </FullScreen>
    );
  }

  if (status === "unauthenticated") {
    return (
      <FullScreen>
        <p className="text-sm text-on-surface-variant">
          Redirection vers la connexion…
        </p>
      </FullScreen>
    );
  }

  if (user && !isAdminRole(user.role)) {
    return (
      <FullScreen>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Accès non autorisé</h1>
          <p className="max-w-sm text-sm text-on-surface-variant">
            Ce compte ({user.email}) n&apos;a pas les droits d&apos;administration
            requis pour accéder au tableau de bord.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            await signOut();
            router.replace("/login");
          }}
        >
          Se déconnecter
        </Button>
      </FullScreen>
    );
  }

  return <>{children}</>;
}
