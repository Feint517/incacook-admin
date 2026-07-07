import { PageShell } from "@/components/dashboard/page-shell";
import { CatalogClient } from "./_components/catalog-client";

export default function CatalogPage() {
  return (
    <PageShell
      title="Catalogue B2B"
      subtitle="Produits du catalogue vendus aux vendeurs et commandes catalogue"
    >
      <CatalogClient />
    </PageShell>
  );
}
