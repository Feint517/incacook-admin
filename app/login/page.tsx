"use client";

/**
 * Admin login. Renders OUTSIDE the `(dashboard)` route group, so it is not
 * gated by `AuthGuard`. Posts to `POST /v1/auth/signin`, enforces the
 * Admin/Moderator gate, and routes to `/` on success.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { ApiError } from "@/lib/api";
import { isAdminRole, signOut, useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { status, user, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in as an admin? Skip the form.
  useEffect(() => {
    if (status === "authenticated" && user && isAdminRole(user.role)) {
      router.replace("/");
    }
  }, [status, user, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const me = await signIn(email.trim(), password);
      if (!isAdminRole(me.role)) {
        // A valid account, but not an admin — reject and drop the session.
        await signOut();
        setError(
          "Ce compte n'est pas autorisé à accéder au panneau d'administration.",
        );
        return;
      }
      router.replace("/");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Une erreur inattendue est survenue. Veuillez réessayer.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-surface-container-high">
            <Image
              src="/app_logo.png"
              alt="IncaCook"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <CardTitle>Administration IncaCook</CardTitle>
          <CardDescription>
            Connectez-vous avec un compte administrateur ou modérateur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-on-surface-variant"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@incacook.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-on-surface-variant"
              >
                Mot de passe
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-md border border-error/30 bg-error/10 px-3 py-2 text-xs text-error"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="default"
              disabled={submitting || !email || !password}
              className="mt-1"
            >
              {submitting ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
