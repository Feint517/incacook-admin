import { PageShell } from "@/components/dashboard/page-shell";
import { GeographyClient } from "./_components/geography-client";
import { cityStats } from "@/lib/mock-data/generator";

export default function GeographyPage() {
  return (
    <PageShell title="Carte" subtitle="Activité géographique en France">
      <GeographyClient cities={cityStats} />
    </PageShell>
  );
}
