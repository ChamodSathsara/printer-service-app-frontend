"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { useAuth } from "@/lib/auth";
import {
  Eye,
  EyeOff,
  MapPin,
  Wrench,
  BarChart2,
  AlertCircle,
  Headphones,
} from "lucide-react";

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
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-[#0f172a] px-12 py-10 text-white lg:flex">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
            <Logo size={22} />
          </div>
          <div>
            <p className="text-base font-semibold leading-tight">Gestetner</p>
            <p className="text-xs text-white/40">Service Visit Manager</p>
          </div>
        </div>

        {/* Hero copy */}
        <div className="max-w-sm">
          <h1 className="font-display text-[2rem] font-semibold leading-snug tracking-tight">
            Field service, <span className="text-blue-400">streamlined.</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/50">
            Log site visits on the move, capture GPS-tagged service records and
            give managers a live view of field activity across every technician.
          </p>

          <div className="mt-10 space-y-5">
            {[
              {
                icon: <MapPin size={15} />,
                title: "Location-aware",
                desc: "GPS coordinates captured automatically on every visit.",
              },
              {
                icon: <Wrench size={15} />,
                title: "Built for the field",
                desc: "Mobile-first experience for technicians on the move.",
              },
              {
                icon: <BarChart2 size={15} />,
                title: "Manager visibility",
                desc: "Live dashboard across all technicians and sites.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/85">{title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/45">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/25">
          &copy; {new Date().getFullYear()} Gestetner of Ceylon PLC. Internal
          service tool.
        </p>

        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/[0.04]" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full border border-white/[0.04]" />
        <div className="pointer-events-none absolute bottom-12 right-12 h-36 w-36 rounded-full bg-blue-500/10" />
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-bg px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
              <Logo size={22} />
            </div>
            <div>
              <p className="font-display text-base font-semibold leading-tight text-ink">
                Gestetner
              </p>
              <p className="text-xs text-muted">Service Visit Manager</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h2 className="font-display text-2xl font-bold text-ink">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-muted">
              Sign in with your technician code and password to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted hover:text-ink transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-brand-soft px-3 py-2.5 text-sm text-brand-dark">
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
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted">need help?</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                <Headphones size={15} />
              </div>
              <p className="text-xs leading-relaxed text-muted">
                <span className="font-medium text-ink">
                  Contact your manager
                </span>{" "}
                if you've forgotten your code or need to reset your password.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
