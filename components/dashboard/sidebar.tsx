"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Users,
  ShoppingBag,
  Store,
  Tag,
  Flag,
  MapPinned,
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
  { href: "/listings", label: "Annonces", icon: Tag },
  { href: "/reports", label: "Signalements", icon: Flag },
  { href: "/geography", label: "Carte", icon: MapPinned },
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
    <aside
      className="frost fixed left-3 top-1/2 z-40 flex w-[68px] -translate-y-1/2 flex-col items-center gap-1.5 rounded-2xl border border-outline-variant/40 p-2.5 shadow-lg shadow-black/5"
    >
      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-surface-container-high">
        <Image src="/app_logo.png" alt="IncaCook" width={36} height={36} className="object-contain" />
      </div>

      <div className="my-0.5 h-px w-8 bg-outline-variant" />

      <nav className="flex flex-col items-center gap-1.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md border border-outline-variant bg-surface-container-high px-2 py-1 text-[11px] font-medium opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="my-0.5 h-px w-8 bg-outline-variant" />

      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Basculer le thème"
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      )}

      <button
        onClick={handleSignOut}
        disabled={signingOut}
        title="Déconnexion"
        className="group relative flex h-11 w-11 items-center justify-center rounded-2xl bg-error/10 text-error transition-colors hover:bg-error hover:text-white disabled:pointer-events-none disabled:opacity-50"
      >
        <LogOut className="h-5 w-5" />
        <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md border border-outline-variant bg-surface-container-high px-2 py-1 text-[11px] font-medium text-on-surface opacity-0 shadow-md transition-opacity group-hover:opacity-100">
          Déconnexion
        </span>
      </button>
    </aside>
  );
}
