import { PageShell } from "@/components/dashboard/page-shell";
import { UsersClient } from "./_components/users-client";
import { users, sellers, orders } from "@/lib/mock-data/generator";

export default function UsersPage() {
  const recurring = users.filter((u) => u.totalTransactions >= 2).length;
  const newThisWeek = users.filter(
    (u) => Date.now() - +new Date(u.joined) < 7 * 86400000,
  ).length;

  // Build user activity index
  const ordersByUser = new Map<string, typeof orders>();
  for (const o of orders) {
    if (!ordersByUser.has(o.buyerId)) ordersByUser.set(o.buyerId, []);
    ordersByUser.get(o.buyerId)!.push(o);
  }

  return (
    <PageShell
      title="Utilisateurs"
      subtitle="Tous les utilisateurs : acheteurs, vendeurs, livreurs"
    >
      <UsersClient
        users={users}
        sellers={sellers}
        stats={{
          total: users.length,
          recurring,
          newThisWeek,
        }}
        ordersByUserId={Object.fromEntries(ordersByUser)}
      />
    </PageShell>
  );
}
