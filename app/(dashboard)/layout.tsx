import { Sidebar } from "@/components/dashboard/sidebar";
import { AuthGuard } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background text-on-surface">
        <Sidebar />
        <main className="pl-64">{children}</main>
      </div>
    </AuthGuard>
  );
}
