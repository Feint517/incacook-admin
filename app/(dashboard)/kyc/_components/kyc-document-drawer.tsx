"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  Mail,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { post } from "@/lib/api";
import { useAdminQuery, useAdminMutation } from "@/lib/query";
import { Drawer, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDateTimeFr } from "@/lib/utils";
import {
  DOC_TYPE_LABEL,
  REVIEW_STATE_LABEL,
  REVIEW_STATE_VARIANT,
  ROLE_LABEL,
  type KycActionResult,
  type KycDocumentDetail,
} from "./types";

interface Props {
  documentId: string | null;
  onClose: () => void;
  /** Fired after a successful approve/reject so the queue can refetch. */
  onReviewed: () => void;
}

export function KycDocumentDrawer({ documentId, onClose, onReviewed }: Props) {
  const open = documentId != null;

  const { data, isLoading, isError, error, refetch } =
    useAdminQuery<KycDocumentDetail>({
      path: documentId ? `/admin/kyc/documents/${documentId}` : "",
      enabled: open,
    });

  const approve = useAdminMutation<KycActionResult, string>((id, opts) =>
    post(`/admin/kyc/documents/${id}/approve`, undefined, opts),
  );

  const reject = useAdminMutation<KycActionResult, { id: string; rejectionReason: string }>(
    ({ id, rejectionReason }, opts) =>
      post(`/admin/kyc/documents/${id}/reject`, { rejectionReason }, opts),
  );

  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  // Reset the transient action UI whenever the drawer targets a new document.
  useEffect(() => {
    setRejectMode(false);
    setReason("");
    setReasonError(null);
    approve.reset();
    reject.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  async function handleApprove() {
    if (!documentId) return;
    try {
      await approve.mutate(documentId);
      onReviewed();
    } catch {
      // error surfaced via approve.error
    }
  }

  async function handleReject() {
    if (!documentId) return;
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      setReasonError("La raison doit comporter au moins 3 caractères.");
      return;
    }
    setReasonError(null);
    try {
      await reject.mutate({ id: documentId, rejectionReason: trimmed });
      onReviewed();
    } catch {
      // error surfaced via reject.error
    }
  }

  const busy = approve.isPending || reject.isPending;

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <div className="flex flex-col gap-4 p-6">
        <DialogTitle>Vérification KYC</DialogTitle>

        {isLoading && (
          <div className="space-y-3">
            <div className="h-48 w-full animate-pulse rounded-md bg-surface-container-high" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-container-high" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface-container-high" />
          </div>
        )}

        {isError && (
          <div className="rounded-md border border-error/30 bg-error/10 p-3 text-[13px] text-error">
            <p>{error?.message ?? "Impossible de charger le document."}</p>
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
              <Badge variant={REVIEW_STATE_VARIANT[data.reviewState]}>
                {REVIEW_STATE_LABEL[data.reviewState]}
              </Badge>
              <Badge variant="neutral">
                {DOC_TYPE_LABEL[data.type] ?? data.type}
              </Badge>
              <Badge variant="info">
                {ROLE_LABEL[data.submitter.role] ?? data.submitter.role}
              </Badge>
            </div>

            {/* Document preview. Signed URL (15-min TTL); `unoptimized` so the
                Storage host doesn't need to be in next/image remotePatterns and
                so an expired/opaque URL still renders as a plain <img>. */}
            <a
              href={data.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block overflow-hidden rounded-md border border-outline-variant bg-surface-container-low"
            >
              <Image
                src={data.fileUrl}
                alt={DOC_TYPE_LABEL[data.type] ?? data.type}
                width={800}
                height={520}
                unoptimized
                className="max-h-80 w-full object-contain"
              />
              <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                <ExternalLink className="h-3 w-3" /> Ouvrir
              </span>
            </a>

            <div className="grid grid-cols-1 gap-2 rounded-md border border-outline-variant bg-surface-container-low p-3">
              <div className="text-[13px] font-medium text-on-surface">
                {[data.submitter.firstName, data.submitter.lastName]
                  .filter(Boolean)
                  .join(" ") || "—"}
              </div>
              <InfoRow icon={Mail} value={data.submitter.email} />
              {data.submitter.businessName && (
                <InfoRow
                  icon={ShieldAlert}
                  value={`${data.submitter.businessName}${
                    data.submitter.siret ? ` · SIRET ${data.submitter.siret}` : ""
                  }`}
                />
              )}
              <InfoRow
                icon={Calendar}
                value={`Soumis le ${formatDateTimeFr(data.submittedAt)}`}
              />
              {data.reviewedAt && (
                <InfoRow
                  icon={Calendar}
                  value={`Revu le ${formatDateTimeFr(data.reviewedAt)}`}
                />
              )}
            </div>

            {data.rejectionReason && (
              <div className="rounded-md border border-error/30 bg-error/10 p-3 text-[13px] text-error">
                <span className="font-semibold">Raison du rejet : </span>
                {data.rejectionReason}
              </div>
            )}

            <Separator />

            {/* Actions — only meaningful while the doc is still PENDING. */}
            {data.reviewState === "PENDING" ? (
              <div className="space-y-3">
                {!rejectMode ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={handleApprove}
                      disabled={busy}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {approve.isPending ? "Approbation…" : "Approuver"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-error/40 text-error hover:bg-error/10"
                      onClick={() => setRejectMode(true)}
                      disabled={busy}
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeter
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label
                      htmlFor="kyc-reject-reason"
                      className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant"
                    >
                      Raison du rejet (visible par l'utilisateur)
                    </label>
                    <textarea
                      id="kyc-reject-reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="Ex. : la pièce d'identité est illisible…"
                      className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    {reasonError && (
                      <p className="text-[12px] text-error">{reasonError}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-error/40 text-error hover:bg-error/10"
                        onClick={handleReject}
                        disabled={busy}
                      >
                        {reject.isPending ? "Rejet…" : "Confirmer le rejet"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setRejectMode(false);
                          setReasonError(null);
                          reject.reset();
                        }}
                        disabled={busy}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}

                {(approve.error || reject.error) && (
                  <p className="text-[12px] text-error">
                    {(approve.error ?? reject.error)?.message}
                  </p>
                )}
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-outline-variant px-3 py-3 text-center text-[12px] text-on-surface-variant">
                Ce document a déjà été traité.
              </p>
            )}
          </>
        )}
      </div>
    </Drawer>
  );
}

function InfoRow({
  icon: Icon,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-on-surface-variant">
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="text-[13px] text-on-surface">{value}</span>
    </div>
  );
}
