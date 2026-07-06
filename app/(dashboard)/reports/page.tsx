import { PageShell } from "@/components/dashboard/page-shell";
import { ReportsClient } from "./_components/reports-client";

export default function ReportsPage() {
  return (
    <PageShell
      title="Signalements"
      subtitle="File de modération des reports utilisateurs"
    >
      <ReportsClient />
    </PageShell>
  );
}
