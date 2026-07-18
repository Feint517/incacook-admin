"use client";

import { useMemo, useState } from "react";
import { Truck, CheckCircle2 } from "lucide-react";

import { patch } from "@/lib/api";
import { useAdminMutation, useAdminQuery } from "@/lib/query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTableError } from "@/components/dashboard/data-table-states";
import { formatDateTimeFr, formatEur, formatEurFromCents } from "@/lib/utils";

/** Shape returned by `GET /v1/admin/settings/delivery-fee`. */
interface DeliveryFeeSettings {
  deliveryFeeCents: number;
  deliveryFeeEuros: number;
  updatedAt: string | null;
  updatedById: string | null;
}

/** Backend bounds: integer cents, 0 ≤ x ≤ 5000 (i.e. 0 € to 50 €). */
const MAX_CENTS = 5000;

/** Parse a euros input string into integer cents, or `null` when invalid. */
function eurosToCents(euros: string): number | null {
  const t = euros.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return null;
  const cents = Math.round(n * 100);
  if (cents < 0 || cents > MAX_CENTS) return null;
  return cents;
}

export function DeliveryFeeCard() {
  const { data, isLoading, isError, error, refetch } =
    useAdminQuery<DeliveryFeeSettings>({
      path: "/admin/settings/delivery-fee",
    });

  const [euros, setEuros] = useState("");
  const [saved, setSaved] = useState(false);
  // Seed / re-seed the input from the server value when it (re)loads or changes
  // — React's "adjust state during render" pattern, no effect needed.
  const [seededCents, setSeededCents] = useState<number | null>(null);
  if (data && data.deliveryFeeCents !== seededCents) {
    setSeededCents(data.deliveryFeeCents);
    setEuros(data.deliveryFeeEuros.toString());
  }

  const save = useAdminMutation<DeliveryFeeSettings, number>(
    (deliveryFeeCents, opts) =>
      patch("/admin/settings/delivery-fee", { deliveryFeeCents }, opts),
  );

  const parsedCents = useMemo(() => eurosToCents(euros), [euros]);
  const isInvalid = euros.trim() !== "" && parsedCents === null;
  const isUnchanged =
    data != null && parsedCents != null && parsedCents === data.deliveryFeeCents;
  const canSave =
    data != null &&
    parsedCents != null &&
    !isUnchanged &&
    !save.isPending;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave || parsedCents == null) return;
    setSaved(false);
    try {
      await save.mutate(parsedCents);
      setSaved(true);
      refetch();
    } catch {
      // save.error is rendered inline below.
    }
  }

  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Frais de livraison
          </CardTitle>
          <CardDescription>
            Frais de livraison appliqués par la plateforme à chaque commande.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isError ? (
            <DataTableError error={error} onRetry={refetch} />
          ) : isLoading && !data ? (
            <div className="flex flex-col gap-3">
              <div className="h-4 w-40 animate-pulse rounded bg-surface-container-high" />
              <div className="h-9 w-full animate-pulse rounded bg-surface-container-high" />
            </div>
          ) : (
            <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-xs font-medium text-on-surface-variant">
                  Frais actuel
                </span>
                <span className="text-lg font-semibold tabular-nums text-on-surface">
                  {data ? formatEur(data.deliveryFeeEuros, { cents: true }) : "—"}
                </span>
              </div>

              {data?.updatedAt && (
                <p className="-mt-3 text-[11px] text-on-surface-variant">
                  Dernière modification&nbsp;: {formatDateTimeFr(data.updatedAt)}
                </p>
              )}

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="delivery-fee"
                  className="text-xs font-medium text-on-surface-variant"
                >
                  Nouveau frais (€)
                </label>
                <div className="relative">
                  <Input
                    id="delivery-fee"
                    type="number"
                    inputMode="decimal"
                    step={0.5}
                    min={0}
                    max={MAX_CENTS / 100}
                    value={euros}
                    onChange={(e) => {
                      setEuros(e.target.value);
                      setSaved(false);
                    }}
                    className="pr-8"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                    €
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Entre 0 € et {formatEurFromCents(MAX_CENTS)}.
                </p>
              </div>

              {save.error && (
                <p
                  role="alert"
                  className="rounded-md border border-error/40 bg-error/5 px-3 py-2 text-sm text-error"
                >
                  {save.error.message}
                  {save.error.correlationId
                    ? ` (réf. ${save.error.correlationId})`
                    : ""}
                </p>
              )}

              {saved && !save.isPending && (
                <div
                  role="status"
                  className="flex items-center gap-2 rounded-md border border-success/40 bg-success/5 px-3 py-2 text-sm text-on-surface"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  Frais de livraison enregistré.
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={!canSave}>
                  {save.isPending ? "Enregistrement…" : "Enregistrer"}
                </Button>
                {isInvalid && (
                  <span className="text-xs text-on-surface-variant">
                    Montant invalide.
                  </span>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
