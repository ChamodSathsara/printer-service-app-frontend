"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { useAuth } from "@/lib/auth";
import { Eye, EyeOff, AlertCircle, Headphones } from "lucide-react";

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const [techCode, setTechCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(
        user.role === "manager" ? "/manager/dashboard" : "/technician/home",
      );
    }
  }, [user, loading, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const loggedInUser = await login(techCode.trim(), password);
      router.replace(
        loggedInUser.role === "manager"
          ? "/manager/dashboard"
          : "/technician/home",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid technician code or password. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] lg:flex lg:items-center lg:justify-center lg:bg-slate-100">
      {/* ── MOBILE (full-screen dark app layout) ── */}
      <div className="flex min-h-screen flex-col px-6 pb-10 pt-16 lg:hidden">
        {/* App icon + branding */}
        <div className="flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-blue-600">
            <Logo size={38} />
          </div>
          <p className="mt-4 text-lg font-semibold text-white">Gestetner</p>
          <p className="mt-0.5 text-sm text-white/40">Service Visit Manager</p>
        </div>

        {/* Form card */}
        <div className="mt-10 rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/10">
          <h1 className="text-xl font-semibold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-white/50">Sign in to continue</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium tracking-wide text-white/50">
                TECHNICIAN CODE
              </label>
              <input
                inputMode="numeric"
                placeholder="e.g. 0000"
                value={techCode}
                onChange={(e) => setTechCode(e.target.value)}
                autoFocus
                required
                className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.07] px-4 text-sm text-white placeholder:text-white/25 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium tracking-wide text-white/50">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.07] px-4 pr-11 text-sm text-white placeholder:text-white/25 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-white/30 transition-colors hover:text-white/60"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 px-3.5 py-3 text-sm text-red-400 ring-1 ring-red-500/20">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white transition-all disabled:opacity-60 active:scale-[0.98]"
            >
              {submitting ? (
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        {/* Help row */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3.5 ring-1 ring-white/[0.07]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15">
            <Headphones size={15} className="text-blue-400" />
          </div>
          <p className="text-xs leading-relaxed text-white/40">
            <span className="font-medium text-white/70">Need help?</span>{" "}
            Contact your manager to reset your code or password.
          </p>
        </div>

        <p className="mt-auto pt-10 text-center text-[11px] text-white/20">
          © {new Date().getFullYear()} Gestetner of Ceylon PLC
        </p>
      </div>

      {/* ── DESKTOP (centered card on light background) ── */}
      <div className="hidden lg:block lg:w-full lg:max-w-md lg:px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-10 py-10 shadow-sm">
          {/* Logo + brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <Logo size={20} />
            </div>
            <div>
              <p className="text-base font-semibold leading-tight text-slate-900">
                Gestetner
              </p>
              <p className="text-xs text-slate-400">Service Visit Manager</p>
            </div>
          </div>

          <div className="my-6 border-t border-slate-100" />

          <h2 className="text-xl font-semibold text-slate-900">Welcome back</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Sign in with your technician code and password to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <Label required>Technician Code</Label>
              <Input
                inputMode="numeric"
                placeholder="e.g. 0000"
                value={techCode}
                onChange={(e) => setTechCode(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div>
              <Label required>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted transition-colors hover:text-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-brand-soft px-3.5 py-3 text-sm text-brand-dark">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={submitting}
              className="mt-1"
            >
              Sign in
            </Button>
          </form>

          {/* Help row */}
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <Headphones size={15} className="text-blue-600" />
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              <span className="font-medium text-slate-700">Need help?</span>{" "}
              Contact your manager to reset your code or password.
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Gestetner of Ceylon PLC · Internal
          service tool
        </p>
      </div>
    </div>
  );
}
