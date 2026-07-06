import { PageShell } from "@/components/dashboard/page-shell";
import { KycClient } from "./_components/kyc-client";

export default function KycPage() {
  return (
    <PageShell
      title="Vérifications KYC"
      subtitle="File de revue des documents d'identité des vendeurs et livreurs"
    >
      <KycClient />
    </PageShell>
  );
}
