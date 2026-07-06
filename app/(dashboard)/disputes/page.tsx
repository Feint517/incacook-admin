import { PageShell } from "@/components/dashboard/page-shell";
import { DisputesClient } from "./_components/disputes-client";

export default function DisputesPage() {
  return (
    <PageShell
      title="Litiges"
      subtitle="Résolution des litiges de commande — remboursement, rejet et sanctions"
    >
      <DisputesClient />
    </PageShell>
  );
}
