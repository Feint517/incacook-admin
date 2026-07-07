import { PageShell } from "@/components/dashboard/page-shell";
import { ZonesClient } from "./_components/zones-client";

export default function ZonesPage() {
  return (
    <PageShell
      title="Zones de livraison"
      subtitle="Zones d'opération que les livreurs sélectionnent à l'inscription"
    >
      <ZonesClient />
    </PageShell>
  );
}
