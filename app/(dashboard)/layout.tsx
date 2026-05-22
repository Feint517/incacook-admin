import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Sidebar />
      <main className="pl-[92px]">{children}</main>
    </div>
  );
}
