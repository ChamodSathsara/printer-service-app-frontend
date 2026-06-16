"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { useAuth } from "@/lib/auth";
import { Eye, EyeOff, MapPin, Wrench, AlertCircle } from "lucide-react";

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
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemo(code: string, pass: string) {
    setTechCode(code);
    setPassword(pass);
    setError("");
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-ink px-12 py-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <Logo size={48} />
          <div>
            <p className="font-display text-lg font-bold leading-tight">
              Gestetner
            </p>
            <p className="text-sm text-white/60">Service Visit Manager</p>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="font-display text-4xl font-extrabold leading-tight">
            Every visit, tracked.
            <br />
            Every machine, accounted for.
          </h1>
          <p className="mt-4 text-white/70">
            Log site visits on the move, capture GPS-tagged service records and
            give managers a live view of field activity across every technician.
          </p>

          <div className="mt-10 space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand">
                <Wrench size={18} />
              </div>
              <div>
                <p className="font-semibold">Built for the field</p>
                <p className="text-sm text-white/60">
                  A mobile-first experience for technicians visiting customer
                  sites.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand">
                <MapPin size={18} />
              </div>
              <div>
                <p className="font-semibold">Location aware</p>
                <p className="text-sm text-white/60">
                  Every site visit captures GPS coordinates automatically on
                  submit.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/40">
          &copy; {new Date().getFullYear()} Gestetner Lanka. Internal service
          tool.
        </p>

        {/* decorative pin grid */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/5" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full border border-white/5" />
        <div className="pointer-events-none absolute bottom-10 right-10 h-40 w-40 rounded-full bg-brand/10" />
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-bg px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Logo size={44} />
            <div>
              <p className="font-display text-lg font-bold leading-tight text-ink">
                Gestetner
              </p>
              <p className="text-sm text-muted">Service Visit Manager</p>
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold text-ink">Sign in</h2>
          <p className="mt-1 text-sm text-muted">
            Enter your technician code and password to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted hover:text-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-brand-soft px-3 py-2.5 text-sm text-brand-dark">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" fullWidth size="lg" loading={submitting}>
              Sign in
            </Button>
          </form>

          <div className="mt-8 rounded-xl border border-dashed border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Demo accounts
            </p>
            <div className="mt-2 space-y-2">
              <button
                type="button"
                onClick={() => fillDemo("1111", "abc@0123")}
                className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-sm hover:border-brand hover:bg-brand-soft/40"
              >
                <span>
                  <span className="font-semibold text-ink">Manager</span>{" "}
                  <span className="text-muted">— Code 1111</span>
                </span>
                <span className="text-xs text-muted">Tap to fill</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo("0000", "abc@0123")}
                className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-sm hover:border-brand hover:bg-brand-soft/40"
              >
                <span>
                  <span className="font-semibold text-ink">Technician</span>{" "}
                  <span className="text-muted">— Code 0000</span>
                </span>
                <span className="text-xs text-muted">Tap to fill</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
