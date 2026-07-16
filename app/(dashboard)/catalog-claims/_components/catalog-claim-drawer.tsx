"use client";

import { useEffect, useState } from "react";
import { Calendar, Package, Store, User, FileText, Mail } from "lucide-react";
import { post } from "@/lib/api";
import { useAdminQuery, useAdminMutation } from "@/lib/query";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Drawer,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDateTimeFr, formatEurFromCents } from "@/lib/utils";
import {
  CLAIM_ACTIONS,
  STATUS_VARIANT,
  isTerminal,
  statusLabel,
  typeLabel,
  type CatalogClaimDetail,
  type CatalogClaimStatus,
  type ClaimAction,
  type ClaimActionBody,
} from "./types";

interface Props {
  claimId: string | null;
  onClose: () => void;
  /** Fired after a successful action so the queue can refetch + the drawer close. */
  onActed: () => void;
}

export function CatalogClaimDrawer({ claimId, onClose, onActed }: Props) {
  const open = claimId != null;

  const { data, isLoading, isError, error, refetch } =
    useAdminQuery<CatalogClaimDetail>({
      path: claimId ? `/admin/catalog-claims/${claimId}` : "",
      enabled: open,
    });

  // One mutation drives all four endpoints — only one action runs at a time.
  const act = useAdminMutation<
    CatalogClaimDetail,
    { id: string; endpoint: ClaimAction["endpoint"]; body: ClaimActionBody }
  >(({ id, endpoint, body }, opts) =>
    post(`/admin/catalog-claims/${id}/${endpoint}`, body, opts),
  );

  const [pending, setPending] = useState<ClaimAction | null>(null);
  const [notes, setNotes] = useState("");
  const [amount, setAmount] = useState("");

  // Reset transient action UI whenever the drawer targets a new claim.
  useEffect(() => {
    setPending(null);
    setNotes("");
    setAmount("");
    act.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claimId]);

  function openConfirm(action: ClaimAction) {
    act.reset();
    setNotes("");
    setAmount("");
    setPending(action);
  }

  async function confirm() {
    if (!claimId || !pending) return;
    const trimmed = notes.trim();
    const body: ClaimActionBody = {};
    if (trimmed) body.notes = trimmed;
    if (pending.showAmount) {
      // Euros in the input → integer cents on the wire (DTO wants `>= 1`).
      const euros = Number.parseFloat(amount.replace(",", "."));
      if (Number.isFinite(euros) && euros > 0) {
        body.refundAmountCents = Math.round(euros * 100);
      }
    }
    try {
      await act.mutate({ id: claimId, endpoint: pending.endpoint, body });
      onActed();
    } catch {
      // error surfaced via act.error inside the dialog
    }
  }

  const terminal = data ? isTerminal(data.status) : false;

  return (
    <>
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <div className="flex flex-col gap-4 p-6">
          <DialogTitle>Réclamation catalogue</DialogTitle>

          {isLoading && (
            <div className="space-y-3">
              <div className="h-6 w-1/3 animate-pulse rounded bg-surface-container-high" />
              <div className="h-24 w-full animate-pulse rounded-md bg-surface-container-high" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-container-high" />
            </div>
          )}

          {isError && (
            <div className="rounded-md border border-error/30 bg-error/10 p-3 text-[13px] text-error">
              <p>{error?.message ?? "Impossible de charger la réclamation."}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={refetch}
              >
                Réessayer
              </Button>
            </div>
          )}

          {data && (
            <>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant={
                    STATUS_VARIANT[data.status as CatalogClaimStatus] ??
                    "neutral"
                  }
                >
                  {statusLabel(data.status)}
                </Badge>
                <Badge variant="neutral">{typeLabel(data.type)}</Badge>
              </div>

              {data.description && (
                <div className="rounded-md border border-outline-variant bg-surface-container-low p-3 text-[13px] text-on-surface">
                  {data.description}
                </div>
              )}

              {/* Claim + linked order + seller. */}
              <div className="grid grid-cols-1 gap-2 rounded-md border border-outline-variant bg-surface-container-low p-3">
                <InfoRow
                  icon={Package}
                  label="Commande"
                  value={data.catalogOrderId}
                  mono
                />
                <InfoRow
                  icon={Store}
                  label="Vendeur"
                  value={data.seller?.name || data.sellerId}
                />
                {data.seller?.email && (
                  <InfoRow icon={Mail} label="Email" value={data.seller.email} />
                )}
                <InfoRow
                  icon={Calendar}
                  label="Ouvert le"
                  value={formatDateTimeFr(data.createdAt)}
                />
                {data.resolvedAt && (
                  <InfoRow
                    icon={Calendar}
                    label="Clôturé le"
                    value={formatDateTimeFr(data.resolvedAt)}
                  />
                )}
                {data.refundAmountCents != null && (
                  <InfoRow
                    icon={FileText}
                    label="Montant remboursé"
                    value={formatEurFromCents(data.refundAmountCents)}
                  />
                )}
              </div>

              {/* Linked catalog order details + line items. */}
              {data.order && (
                <div className="rounded-md border border-outline-variant bg-surface-container-low p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-on-surface">
                      Commande catalogue
                    </span>
                    <Badge variant="neutral">{data.order.status}</Badge>
                  </div>
                  <div className="space-y-1">
                    {data.order.items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between gap-2 text-[12px] text-on-surface-variant"
                      >
                        <span className="min-w-0 truncate text-on-surface">
                          {it.quantity} × {it.nameSnapshot}
                        </span>
                        <span className="shrink-0 font-mono">
                          {formatEurFromCents(it.lineTotalCents)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-on-surface-variant">Total</span>
                    <span className="font-mono font-semibold text-on-surface">
                      {formatEurFromCents(data.order.totalCents)}
                    </span>
                  </div>
                </div>
              )}

              {data.replacementNotes && (
                <div className="rounded-md border border-outline-variant bg-surface-container-low p-3 text-[13px] text-on-surface-variant">
                  <span className="font-semibold text-on-surface">
                    Remplacement :{" "}
                  </span>
                  {data.replacementNotes}
                </div>
              )}

              {data.adminNotes && (
                <div className="rounded-md border border-outline-variant bg-surface-container-low p-3 text-[13px] text-on-surface-variant">
                  <span className="font-semibold text-on-surface">
                    Notes admin :{" "}
                  </span>
                  {data.adminNotes}
                </div>
              )}

              <Separator />

              {/* Actions — hidden once the claim is terminal. */}
              {terminal ? (
                <p className="rounded-md border border-dashed border-outline-variant px-3 py-3 text-center text-[12px] text-on-surface-variant">
                  Cette réclamation est clôturée — aucune action possible.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {CLAIM_ACTIONS.map((action) => (
                    <Button
                      key={action.endpoint}
                      variant={
                        action.variant === "danger" ? "outline" : action.variant
                      }
                      className={
                        action.variant === "danger"
                          ? "justify-start border-error/40 text-error hover:bg-error/10"
                          : "justify-start"
                      }
                      onClick={() => openConfirm(action)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Drawer>

      {/* Confirm dialog with an optional note (+ amount for refund). */}
      <Dialog
        open={pending != null}
        onOpenChange={(o) => {
          if (!o && !act.isPending) setPending(null);
        }}
      >
        <DialogContent>
          {pending && (
            <div className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <DialogTitle>{pending.label}</DialogTitle>
                <DialogDescription>{pending.description}</DialogDescription>
              </div>

              {pending.showAmount && (
                <div className="space-y-2">
                  <label
                    htmlFor="claim-amount"
                    className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant"
                  >
                    Montant du remboursement (€, optionnel)
                  </label>
                  <input
                    id="claim-amount"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={
                      data?.order
                        ? formatEurFromCents(data.order.totalCents)
                        : "Total de la commande"
                    }
                    className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <p className="text-[11px] text-on-surface-variant">
                    Laisser vide pour rembourser la totalité de la commande.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="claim-notes"
                  className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant"
                >
                  Note (optionnelle)
                </label>
                <textarea
                  id="claim-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Contexte de la décision…"
                  className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              {act.error && (
                <p className="text-[12px] text-error">{act.error.message}</p>
              )}

              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setPending(null)}
                  disabled={act.isPending}
                >
                  Annuler
                </Button>
                <Button
                  variant={pending.variant === "danger" ? "outline" : "default"}
                  className={
                    pending.variant === "danger"
                      ? "border-error/40 text-error hover:bg-error/10"
                      : undefined
                  }
                  onClick={confirm}
                  disabled={act.isPending}
                >
                  {act.isPending ? "En cours…" : "Confirmer"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-on-surface-variant">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="w-28 shrink-0 text-[12px]">{label}</span>
      <span
        className={
          mono
            ? "min-w-0 truncate font-mono text-[12px] text-on-surface"
            : "min-w-0 truncate text-[13px] text-on-surface"
        }
      >
        {value}
      </span>
    </div>
  );
}
