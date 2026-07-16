"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Users,
  ShoppingBag,
  Store,
  Bike,
  Tag,
  Flag,
  Scale,
  ShieldCheck,
  PackageOpen,
  Boxes,
  MapPinned,
  Map,
  Megaphone,
  FileText,
  CreditCard,
  Wallet,
  Settings,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Vue d'ensemble", icon: LayoutGrid },
  { href: "/users", label: "Utilisateurs", icon: Users },
  { href: "/orders", label: "Commandes", icon: ShoppingBag },
  { href: "/sellers", label: "Vendeurs", icon: Store },
  { href: "/drivers", label: "Livreurs", icon: Bike },
  { href: "/listings", label: "Annonces", icon: Tag },
  { href: "/reports", label: "Signalements", icon: Flag },
  { href: "/disputes", label: "Litiges", icon: Scale },
  { href: "/kyc", label: "Vérifications KYC", icon: ShieldCheck },
  { href: "/catalog-claims", label: "Réclamations catalogue", icon: PackageOpen },
  { href: "/catalog", label: "Catalogue B2B", icon: Boxes },
  { href: "/subscriptions", label: "Abonnements", icon: CreditCard },
  { href: "/payouts", label: "Versements", icon: Wallet },
  { href: "/geography", label: "Carte", icon: MapPinned },
  { href: "/zones", label: "Zones de livraison", icon: Map },
  { href: "/notifications", label: "Notifications", icon: Megaphone },
  { href: "/legal", label: "Documents légaux", icon: FileText },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setMounted(true), []);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/login");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <aside className="frost fixed inset-y-0 left-0 z-40 flex w-64 flex-col gap-1.5 border-r border-outline-variant/40 p-3">
      <Link
        href="/"
        title="Retour à l'accueil"
        className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-surface-container-high"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-container-high">
          <Image src="/app_logo.png" alt="IncaCook" width={32} height={32} className="object-contain" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-on-surface">IncaCook</span>
          <span className="text-[11px] text-on-surface-variant">Administration</span>
        </div>
      </Link>

      <div className="my-0.5 h-px w-full bg-outline-variant" />

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="my-0.5 h-px w-full bg-outline-variant" />

      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        >
          {theme === "dark" ? <Sun className="h-[18px] w-[18px] shrink-0" /> : <Moon className="h-[18px] w-[18px] shrink-0" />}
          <span>{theme === "dark" ? "Mode clair" : "Mode sombre"}</span>
        </button>
      )}

      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex items-center gap-3 rounded-xl bg-error/10 px-3 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error hover:text-white disabled:pointer-events-none disabled:opacity-50"
      >
        <LogOut className="h-[18px] w-[18px] shrink-0" />
        <span>Déconnexion</span>
      </button>
    </aside>
  );
}
