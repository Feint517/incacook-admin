import { PageShell } from "@/components/dashboard/page-shell";
import { DeliveryFeeCard } from "./_components/delivery-fee-card";

export default function SettingsPage() {
  return (
    <PageShell
      title="Paramètres"
      subtitle="Configuration de la plateforme"
    >
      <DeliveryFeeCard />
    </PageShell>
  );
}
