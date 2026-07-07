import { PageShell } from "@/components/dashboard/page-shell";
import { GeographyClient } from "./_components/geography-client";

export default function GeographyPage() {
  return (
    <PageShell title="Carte" subtitle="Activité géographique en France">
      <GeographyClient />
    </PageShell>
  );
}
