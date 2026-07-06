import { PageShell } from "@/components/dashboard/page-shell";
import { OverviewClient } from "./_components/overview-client";

export default function OverviewPage() {
  return (
    <PageShell title="Vue d'ensemble" subtitle="Santé de la plateforme en un coup d'œil">
      <OverviewClient />
    </PageShell>
  );
}
