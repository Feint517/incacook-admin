import { PageShell } from "@/components/dashboard/page-shell";
import { ReportsClient } from "./_components/reports-client";
import { reports } from "@/lib/mock-data/generator";

export default function ReportsPage() {
  const open = reports.filter((r) => r.status === "open").length;
  const resolvedThisWeek = reports.filter(
    (r) => r.status === "resolved" && Date.now() - +new Date(r.date) < 7 * 86400000,
  ).length;
  const avgResolution = "2.4 j";
  const repeatOffenders = new Set(
    reports
      .reduce<Record<string, number>>((m, r) => ({ ...m, [r.entityId]: (m[r.entityId] || 0) + 1 }), {})
      ? Object.entries(
          reports.reduce<Record<string, number>>((m, r) => {
            m[r.entityId] = (m[r.entityId] || 0) + 1;
            return m;
          }, {}),
        )
          .filter(([_, n]) => n >= 2)
          .map(([id]) => id)
      : [],
  ).size;

  return (
    <PageShell title="Signalements" subtitle="Lecture seule des reports utilisateurs">
      <ReportsClient
        reports={reports}
        stats={{ open, resolvedThisWeek, avgResolution, repeatOffenders }}
      />
    </PageShell>
  );
}
