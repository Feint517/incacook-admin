import { PageShell } from "@/components/dashboard/page-shell";
import { NotificationsClient } from "./_components/notifications-client";

export default function NotificationsPage() {
  return (
    <PageShell
      title="Notifications"
      subtitle="Diffuser une notification push à une audience ciblée"
    >
      <NotificationsClient />
    </PageShell>
  );
}
