"use client";

import { Drawer } from "@/components/ui/dialog";
import { ReportStatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDateFr } from "@/lib/utils";
import type { Report } from "@/lib/mock-data/types";

export function ReportDrawer({
  report,
  reports,
  onClose,
}: {
  report: Report | null;
  reports: Report[];
  onClose: () => void;
}) {
  if (!report) return null;
  const history = reports.filter((r) => r.entityId === report.entityId);

  return (
    <Drawer open onOpenChange={(o) => !o && onClose()}>
      <div className="flex flex-col gap-4 p-6">
        <div>
          <p className="font-mono text-[11px] text-on-surface-variant">{report.id}</p>
          <h3 className="mt-1 text-base font-semibold text-on-surface">
            Signalement — {report.type}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <ReportStatusBadge status={report.status} />
            <Badge
              variant={
                report.severity === "high" ? "error" : report.severity === "medium" ? "warning" : "neutral"
              }
            >
              {report.severity === "high" ? "Sévérité élevée" : report.severity === "medium" ? "Sévérité moyenne" : "Sévérité faible"}
            </Badge>
          </div>
          <p className="mt-1 text-[11.5px] text-on-surface-variant">
            Reçu le {formatDateFr(report.date)} · auteur {report.reporter}
          </p>
        </div>

        <div className="rounded-md border border-outline-variant bg-surface-container-low p-3">
          <p className="text-[10.5px] uppercase tracking-wider text-on-surface-variant">
            Entité signalée
          </p>
          <p className="mt-1 text-[14px] font-medium text-on-surface">{report.entityName}</p>
          <p className="text-[11.5px] text-on-surface-variant">
            {report.entityType === "listing" ? "Annonce" : "Vendeur"}
          </p>
        </div>

        <div>
          <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
            Contenu du signalement
          </h4>
          <p className="rounded-md bg-surface-container-low p-3 text-[13px] text-on-surface-variant">
            "{report.content}"
          </p>
        </div>

        <Separator />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Historique sur cette entité
            </h4>
            <span className="text-[11px] text-on-surface-variant">{history.length} report(s)</span>
          </div>
          <div className="space-y-1.5">
            {history.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-md border border-outline-variant/40 bg-surface px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-medium text-on-surface">{h.type}</div>
                  <div className="text-[10.5px] text-on-surface-variant">{formatDateFr(h.date)}</div>
                </div>
                <ReportStatusBadge status={h.status} />
              </div>
            ))}
          </div>
        </div>

        {report.resolutionNotes && (
          <>
            <Separator />
            <div>
              <h4 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Notes de résolution
              </h4>
              <p className="rounded-md border border-success/30 bg-success/5 p-3 text-[12.5px] text-on-surface-variant">
                {report.resolutionNotes}
              </p>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}
