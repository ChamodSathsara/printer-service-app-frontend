"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { axiosClient } from "@/lib/AxiosClient";
import { Card, Spinner } from "@/components/ui/Common";
import { Button } from "@/components/ui/Button";
import {
  KeyRound,
  LogOut,
  ChevronRight,
  Hash,
  Mail,
  UserCircle,
} from "lucide-react";

interface MeResponse {
  userId: string;
  technicianCode: string;
  fullName: string;
  role: string;
}

// Deterministic avatar colour from tech code string
function avatarColor(techCode: string): string {
  const palette = [
    "#E4002B",
    "#1E40AF",
    "#059669",
    "#7C3AED",
    "#D97706",
    "#0891B2",
    "#BE185D",
    "#15803D",
  ];
  let hash = 0;
  for (const ch of techCode) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export default function MorePage() {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);

  // Fetch fresh profile from /api/auth/me so we always have up-to-date info
  useEffect(() => {
    axiosClient
      .get<{
        userId: string;
        technicianCode: string;
        fullName: string;
        role: string;
      }>("/auth/me")
      .then((res) => setMe(res.data))
      .catch(() => {}); // silently fall back to user from auth context
  }, []);

  const displayName = me?.fullName ?? user?.name ?? "Technician";
  const displayCode = me?.technicianCode ?? user?.techCode ?? "—";
  const displayRole = me?.role ?? user?.role ?? "Technician";
  const initials = displayName.charAt(0).toUpperCase();
  const bgColor = avatarColor(displayCode);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">More</h1>
        <p className="text-sm text-muted">Account and app settings</p>
      </div>

      {/* Profile card */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: bgColor }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-ink truncate">
              {displayName}
            </p>
            <p className="text-sm text-muted capitalize">{displayRole}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
          <div className="flex items-center gap-2 text-muted">
            <Hash size={14} className="shrink-0" />
            <span>Code:</span>
            <span className="font-medium text-ink">{displayCode}</span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <UserCircle size={14} className="shrink-0" />
            <span>Role:</span>
            <span className="font-medium text-ink capitalize">
              {displayRole}
            </span>
          </div>
        </div>
      </Card>

      {/* Options */}
      <Card className="divide-y divide-border p-1">
        <Link
          href="/technician/more/reset-password"
          className="flex items-center gap-3 px-3.5 py-3.5 hover:bg-bg"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <KeyRound size={16} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-ink">Change Password</p>
            <p className="text-xs text-muted">Update your account password</p>
          </div>
          <ChevronRight size={18} className="text-muted" />
        </Link>

        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="flex w-full items-center gap-3 px-3.5 py-3.5 text-left hover:bg-bg"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand-dark">
            <LogOut size={16} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-ink">Logout</p>
            <p className="text-xs text-muted">Sign out of your account</p>
          </div>
          <ChevronRight size={18} className="text-muted" />
        </button>
      </Card>

      <p className="text-center text-xs text-muted">
        Gestetner Service Visit Manager · v1.0
      </p>

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-6">
          <Card className="w-full max-w-sm p-5">
            <p className="font-display font-bold text-ink">Log out?</p>
            <p className="mt-1 text-sm text-muted">
              You will need to sign in again to access the app.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={logout}>
                Logout
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
