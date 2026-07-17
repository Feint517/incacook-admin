"use client";

import { useEffect, useState } from "react";
import { Calendar, Package, Store, User, Truck, FileText } from "lucide-react";
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
  DISPUTE_ACTIONS,
  STATUS_VARIANT,
  isTerminal,
  statusLabel,
  typeLabel,
  type Dispute,
  type DisputeAction,
  type DisputeStatus,
} from "./types";

interface Props {
  disputeId: string | null;
  onClose: () => void;
  /** Fired after a successful action so the queue can refetch + the drawer close. */
  onActed: () => void;
}

export function DisputeDrawer({ disputeId, onClose, onActed }: Props) {
  const open = disputeId != null;

  const { data, isLoading, isError, error, refetch } = useAdminQuery<Dispute>({
    path: disputeId ? `/admin/disputes/${disputeId}` : "",
    enabled: open,
  });

  // One mutation drives all five endpoints — only one action runs at a time.
  const act = useAdminMutation<
    Dispute,
    { id: string; endpoint: DisputeAction["endpoint"]; notes?: string }
  >(({ id, endpoint, notes }, opts) =>
    post(`/admin/disputes/${id}/${endpoint}`, { notes }, opts),
  );

  const [pending, setPending] = useState<DisputeAction | null>(null);
  const [notes, setNotes] = useState("");

  // Reset transient action UI whenever the drawer targets a new dispute.
  useEffect(() => {
    setPending(null);
    setNotes("");
    act.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disputeId]);

  function openConfirm(action: DisputeAction) {
    act.reset();
    setNotes("");
    setPending(action);
  }

  async function confirm() {
    if (!disputeId || !pending) return;
    const trimmed = notes.trim();
    try {
      await act.mutate({
        id: disputeId,
        endpoint: pending.endpoint,
        notes: trimmed ? trimmed : undefined,
      });
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
          <DialogTitle>Litige</DialogTitle>

          {isLoading && (
            <div className="space-y-3">
              <div className="h-6 w-1/3 animate-pulse rounded bg-surface-container-high" />
              <div className="h-24 w-full animate-pulse rounded-md bg-surface-container-high" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-surface-container-high" />
            </div>
          )}

          {isError && (
            <div className="rounded-md border border-error/30 bg-error/10 p-3 text-[13px] text-error">
              <p>{error?.message ?? "Impossible de charger le litige."}</p>
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
                  variant={STATUS_VARIANT[data.status as DisputeStatus] ?? "neutral"}
                >
                  {statusLabel(data.status)}
                </Badge>
                <Badge variant="neutral">{typeLabel(data.type)}</Badge>
                {data.refundApproved && (
                  <Badge variant="success">Remboursement approuvé</Badge>
                )}
              </div>

              {data.description && (
                <div className="rounded-md border border-outline-variant bg-surface-container-low p-3 text-[13px] text-on-surface">
                  {data.description}
                </div>
              )}

              {/* Linked order + parties. */}
              <div className="grid grid-cols-1 gap-2 rounded-md border border-outline-variant bg-surface-container-low p-3">
                <InfoRow icon={Package} label="Commande" value={data.orderId} mono />
                <InfoRow icon={User} label="Acheteur" value={data.buyerId} mono />
                <InfoRow icon={Store} label="Vendeur" value={data.sellerId} mono />
                {data.deliveryId && (
                  <InfoRow
                    icon={Truck}
                    label="Livraison"
                    value={data.deliveryId}
                    mono
                  />
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
                {data.stripeDisputeId && (
                  <InfoRow
                    icon={FileText}
                    label="Litige Stripe"
                    value={data.stripeDisputeId}
                    mono
                  />
                )}
              </div>

              {data.adminNotes && (
                <div className="rounded-md border border-outline-variant bg-surface-container-low p-3 text-[13px] text-on-surface-variant">
                  <span className="font-semibold text-on-surface">
                    Notes admin :{" "}
                  </span>
                  {data.adminNotes}
                </div>
              )}

              <Separator />

              {/* Actions — hidden once the dispute is terminal. */}
              {terminal ? (
                <p className="rounded-md border border-dashed border-outline-variant px-3 py-3 text-center text-[12px] text-on-surface-variant">
                  Ce litige est clôturé — aucune action possible.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {DISPUTE_ACTIONS.map((action) => (
                    <Button
                      key={action.endpoint}
                      variant={action.variant === "danger" ? "outline" : action.variant}
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

      {/* Confirm dialog with an optional note (the DTO accepts `notes`). */}
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

              <div className="space-y-2">
                <label
                  htmlFor="dispute-notes"
                  className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant"
                >
                  Note (optionnelle)
                </label>
                <textarea
                  id="dispute-notes"
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
