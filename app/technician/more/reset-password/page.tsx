"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/apiClient";
import { Card } from "@/components/ui/Common";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (!user) return;
    setSubmitting(true);
    try {
      await api.auth.resetPassword(user.techCode, currentPassword, newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <KeyRound size={20} />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Reset Password</h1>
          <p className="text-sm text-muted">Update your account password</p>
        </div>
      </div>

      {success ? (
        <Card className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="font-display font-bold text-ink">Password updated</p>
            <p className="mt-1 text-sm text-muted">
              Your password has been changed successfully. Use it next time you sign in.
            </p>
          </div>
          <Button fullWidth onClick={() => router.push("/technician/more")}>
            Done
          </Button>
        </Card>
      ) : (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label required>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label required>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
              <p className="mt-1 text-xs text-muted">Minimum 6 characters.</p>
            </div>
            <div>
              <Label required>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-brand-soft px-3 py-2.5 text-sm text-brand-dark">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" fullWidth loading={submitting}>
              Update Password
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
