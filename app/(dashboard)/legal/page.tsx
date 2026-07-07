import { PageShell } from "@/components/dashboard/page-shell";
import { LegalClient } from "./_components/legal-client";

export default function LegalPage() {
  return (
    <PageShell
      title="Documents légaux"
      subtitle="Gestion des CGU/CGV — brouillons, versions et publication (une version active par type)"
    >
      <LegalClient />
    </PageShell>
  );
}
