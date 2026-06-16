"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { FullPageSpinner } from "@/components/ui/Common";
import {
  Home,
  ClipboardPlus,
  History,
  Printer,
  Menu,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/technician/home", label: "Home", icon: Home },
  { href: "/technician/site-visit", label: "Site Visit", icon: ClipboardPlus },
  { href: "/technician/history", label: "History", icon: History },
  { href: "/technician/machines", label: "Machines", icon: Printer },
  { href: "/technician/more", label: "More", icon: Menu },
];

export default function TechnicianLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    } else if (!loading && user?.role !== "technician") {
      router.replace("/manager/dashboard");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "technician") {
    return <FullPageSpinner />;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-bg lg:border-x lg:border-border lg:shadow-sm">
      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <Logo size={36} />
          <div>
            <p className="font-display text-sm font-bold leading-tight text-ink">Gestetner</p>
            <p className="text-xs text-muted">Service Visit Manager</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-bg px-3 py-1.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: user.avatarColor || "#E4002B" }}
          >
            {user.name?.charAt(0) ?? "T"}
          </div>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-ink">{user.name}</p>
            <p className="text-[11px] text-muted">Code: {user.techCode}</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="no-scrollbar flex-1 overflow-y-auto px-4 py-4 pb-28">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-border bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            const isPrimary = item.href === "/technician/site-visit";
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium"
              >
                <span
                  className={cn(
                    "flex items-center justify-center rounded-full transition-colors",
                    isPrimary
                      ? cn(
                          "-mt-6 h-12 w-12 shadow-md ring-4 ring-surface",
                          active ? "bg-brand text-white" : "bg-brand text-white"
                        )
                      : cn("h-8 w-8", active ? "bg-brand-soft text-brand-dark" : "text-muted")
                  )}
                >
                  <Icon size={isPrimary ? 22 : 18} />
                </span>
                <span className={cn(active ? "text-brand-dark" : "text-muted", isPrimary && "font-semibold")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
