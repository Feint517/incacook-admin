import { PageShell } from "@/components/dashboard/page-shell";
import { DriversClient } from "./_components/drivers-client";

export default function DriversPage() {
  return (
    <PageShell
      title="Livreurs"
      subtitle="Supervision des livreurs : véhicule, KYC, zones, activité"
    >
      <DriversClient />
    </PageShell>
  );
}
