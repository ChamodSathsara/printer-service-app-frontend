"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import {
  LayoutDashboard,
  Users,
  FileBarChart,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/manager/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/manager/technicians", label: "Technicians", icon: Users },
  { href: "/manager/reports", label: "Reports", icon: FileBarChart },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!user) return null;

  const activeItem = NAV_ITEMS.find((item) => pathname.startsWith(item.href));

  return (
    <>
      {/* Sidebar - desktop */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-surface text-ink transition-all duration-300 ease-in-out lg:flex",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <div className="flex items-center gap-3 px-4 py-5">
          <Logo size={36} />
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="truncate font-display text-base font-bold leading-tight text-ink">
                Gestetner
              </p>
              <p className="truncate text-xs text-muted">
                Service Visit Manager
              </p>
            </div>
          )}
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "justify-center",
                  active
                    ? "bg-brand-soft text-brand-dark"
                    : "text-ink-soft hover:bg-bg hover:text-ink",
                )}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border px-3 py-4">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5",
              collapsed && "justify-center",
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
              {user.name.charAt(0)}
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-ink">
                  {user.name}
                </p>
                <p className="truncate text-xs text-muted">
                  {user.designation || "Manager"}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
            className={cn(
              "mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-bg hover:text-ink",
              collapsed && "justify-center",
            )}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && "Logout"}
          </button>

          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand sidebar" : undefined}
            className={cn(
              "mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-bg hover:text-ink",
              collapsed && "justify-center",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} className="shrink-0" />
            ) : (
              <>
                <PanelLeftClose size={18} className="shrink-0" />
                Collapse
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <Logo size={36} />
          <div>
            <p className="font-display text-sm font-bold leading-tight text-ink">
              Gestetner
            </p>
            <p className="text-xs text-muted">
              {activeItem?.label || "Manager"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setMobileNavOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-72 flex-col border-l border-border bg-surface text-ink">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Logo size={36} />
                <p className="font-display text-base font-bold text-ink">
                  Gestetner
                </p>
              </div>
              <button
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
                className="text-ink-soft"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-3">
              {NAV_ITEMS.map((item) => {
                const active = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                      active
                        ? "bg-brand-soft text-brand-dark"
                        : "text-ink-soft hover:bg-bg hover:text-ink",
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border px-3 py-4">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-bg hover:text-ink"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
