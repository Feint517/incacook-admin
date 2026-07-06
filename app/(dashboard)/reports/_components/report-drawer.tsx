"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckCircle2, User, XCircle } from "lucide-react";
import { patch } from "@/lib/api";
import { useAdminMutation } from "@/lib/query";
import { Drawer, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDateFr } from "@/lib/utils";
import {
  REPORT_STATUS_LABEL,
  REPORT_STATUS_VARIANT,
  REPORT_TYPE_LABEL,
  type ReportActionStatus,
  type ReportListItem,
  type ReportStatus,
  type ReportStatusResult,
} from "./types";

interface Props {
  report: ReportListItem | null;
  onClose: () => void;
  /** Fired with the new status after a successful transition. */
  onUpdated: (status: ReportStatus) => void;
}

export function ReportDrawer({ report, onClose, onUpdated }: Props) {
  const open = report != null;

  // PATCH /admin/reports/:id/status — body: { status, adminNote? }.
  const changeStatus = useAdminMutation<
    ReportStatusResult,
    { id: string; status: ReportActionStatus; adminNote?: string }
  >(({ id, status, adminNote }, opts) =>
    patch(`/admin/reports/${id}/status`, { status, adminNote }, opts),
  );

  const [note, setNote] = useState("");

  // Reset the transient action UI whenever the drawer targets a new report.
  useEffect(() => {
    setNote("");
    changeStatus.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.id]);

  async function handleAction(status: ReportActionStatus) {
    if (!report) return;
    try {
      const res = await changeStatus.mutate({
        id: report.id,
        status,
        adminNote: note.trim() || undefined,
      });
      onUpdated(res.status);
    } catch {
      // error surfaced via changeStatus.error
    }
  }

  // A report is only actionable while PENDING — RESOLVED/REJECTED are terminal
  // and DISMISSED is legacy. Anything else is read-only.
  const isPending = report?.status === "PENDING";
  const entityName = report?.listing?.name ?? report?.seller?.name ?? report?.targetId;

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <div className="flex flex-col gap-4 p-6">
        <DialogTitle>Signalement</DialogTitle>

        {report && (
          <>
            <div>
              <p className="font-mono text-[11px] text-on-surface-variant">
                {report.id}
              </p>
              <h3 className="mt-1 text-base font-semibold text-on-surface">
                {REPORT_TYPE_LABEL[report.type] ?? report.type}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge variant={REPORT_STATUS_VARIANT[report.status]}>
                  {REPORT_STATUS_LABEL[report.status] ?? report.status}
                </Badge>
              </div>
              <div className="mt-2 flex flex-col gap-1 text-[11.5px] text-on-surface-variant">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Reçu le {formatDateFr(report.createdAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {report.reporter
                    ? `${report.reporter.name || report.reporter.email}`
                    : "Auteur inconnu"}
                </span>
              </div>
            </div>

            <div className="rounded-md border border-outline-variant bg-surface-container-low p-3">
              <p className="text-[10.5px] uppercase tracking-wider text-on-surface-variant">
                Entité signalée
              </p>
              <p className="mt-1 text-[14px] font-medium text-on-surface">
                {entityName || "—"}
              </p>
              <p className="text-[11.5px] text-on-surface-variant">
                {report.targetType === "LISTING" ? "Annonce" : "Vendeur"}
                {report.seller?.email ? ` · ${report.seller.email}` : ""}
              </p>
            </div>

            {report.description && (
              <div>
                <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Contenu du signalement
                </h4>
                <p className="rounded-md bg-surface-container-low p-3 text-[13px] text-on-surface-variant">
                  {report.description}
                </p>
              </div>
            )}

            {report.adminNote && (
              <div>
                <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Note de modération
                </h4>
                <p className="rounded-md border border-success/30 bg-success/5 p-3 text-[12.5px] text-on-surface-variant">
                  {report.adminNote}
                </p>
              </div>
            )}

            <Separator />

            {isPending ? (
              <div className="space-y-3">
                <label
                  htmlFor="report-admin-note"
                  className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant"
                >
                  Note de résolution (optionnelle)
                </label>
                <textarea
                  id="report-admin-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Ex. : annonce retirée, vendeur averti…"
                  className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => handleAction("RESOLVED")}
                    disabled={changeStatus.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {changeStatus.isPending ? "…" : "Résoudre"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-error/40 text-error hover:bg-error/10"
                    onClick={() => handleAction("REJECTED")}
                    disabled={changeStatus.isPending}
                  >
                    <XCircle className="h-4 w-4" />
                    {changeStatus.isPending ? "…" : "Rejeter"}
                  </Button>
                </div>
                {changeStatus.error && (
                  <p className="text-[12px] text-error">
                    {changeStatus.error.message}
                  </p>
                )}
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-outline-variant px-3 py-3 text-center text-[12px] text-on-surface-variant">
                Ce signalement a déjà été traité.
              </p>
            )}
          </>
        )}
      </div>
    </Drawer>
  );
}
