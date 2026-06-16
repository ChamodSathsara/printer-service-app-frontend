"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card } from "@/components/ui/Common";
import { Button } from "@/components/ui/Button";
import { KeyRound, LogOut, ChevronRight, Phone, MapPinned, Hash } from "lucide-react";

export default function MorePage() {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
            className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: user?.avatarColor || "#E4002B" }}
          >
            {user?.name?.charAt(0) ?? "T"}
          </div>
          <div>
            <p className="font-display font-bold text-ink">{user?.name}</p>
            <p className="text-sm text-muted">Technician</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 border-t border-border pt-3 text-sm">
          <div className="flex items-center gap-2 text-muted">
            <Hash size={14} /> Code: <span className="font-medium text-ink">{user?.techCode}</span>
          </div>
          {user?.phone && (
            <div className="flex items-center gap-2 text-muted">
              <Phone size={14} /> Phone: <span className="font-medium text-ink">{user.phone}</span>
            </div>
          )}
          {user?.region && (
            <div className="flex items-center gap-2 text-muted">
              <MapPinned size={14} /> Region: <span className="font-medium text-ink">{user.region}</span>
            </div>
          )}
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
            <p className="font-medium text-ink">Reset Password</p>
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

      <p className="text-center text-xs text-muted">Gestetner Service Visit Manager · v1.0</p>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-6">
          <Card className="w-full max-w-sm p-5">
            <p className="font-display font-bold text-ink">Log out?</p>
            <p className="mt-1 text-sm text-muted">You will need to sign in again to access the app.</p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowLogoutConfirm(false)}>
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
