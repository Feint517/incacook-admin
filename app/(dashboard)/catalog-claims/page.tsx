import { PageShell } from "@/components/dashboard/page-shell";
import { CatalogClaimsClient } from "./_components/catalog-claims-client";

export default function CatalogClaimsPage() {
  return (
    <PageShell
      title="Réclamations catalogue"
      subtitle="SAV du catalogue B2B — remboursement, remplacement, rejet et résolution"
    >
      <CatalogClaimsClient />
    </PageShell>
  );
}
