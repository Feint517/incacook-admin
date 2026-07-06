import { PageShell } from "@/components/dashboard/page-shell";
import { UsersClient } from "./_components/users-client";

export default function UsersPage() {
  return (
    <PageShell
      title="Utilisateurs"
      subtitle="Tous les utilisateurs : acheteurs, vendeurs, livreurs"
    >
      <UsersClient />
    </PageShell>
  );
}
