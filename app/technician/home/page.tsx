"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/apiClient";
import { Visit } from "@/lib/types";
import { Card, EmptyState, Spinner } from "@/components/ui/Common";
import { Button } from "@/components/ui/Button";
import {
  ClipboardPlus,
  MapPin,
  Clock,
  ArrowRight,
  CalendarDays,
  TrendingUp,
  Gauge,
} from "lucide-react";

function categoryTone(category: string) {
  if (category.includes("Cash") || category.includes("Cheque"))
    return "success";
  if (category.includes("Fake") || category.includes("Debt")) return "warning";
  if (category.includes("Tender")) return "accent";
  return "brand";
}

export default function TechnicianHomePage() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    api.visits
      .list({ techCode: user.techCode })
      .then((res) => setVisits(res.visits))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate(),
    ).padStart(2, "0")}`;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 6);
    const startOfWeekStr = startOfWeek.toISOString().slice(0, 10);

    return {
      total: visits.length,
      today: visits.filter((v) => v.visitDate === todayStr).length,
      week: visits.filter((v) => v.visitDate >= startOfWeekStr).length,
    };
  }, [visits]);

  const recent = visits.slice(0, 4);
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <p className="text-sm text-muted">{greeting},</p>
        <h1 className="font-display text-2xl font-bold text-ink">
          {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-muted">
          Here&apos;s a summary of your service visit activity.
        </p>
      </div>

      {/* Quick action */}
      <Link href="/technician/site-visit" className="mb-3 block">
        <Card className="flex items-center gap-4 bg-brand p-4 text-white">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <ClipboardPlus size={24} />
          </div>
          <div className="flex-1">
            <p className="font-display font-bold">New Site Visit</p>
            <p className="text-sm text-white/80">
              Log a visit and capture GPS location
            </p>
          </div>
          <ArrowRight size={20} />
        </Card>
      </Link>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand-dark">
            <Gauge size={16} />
          </div>
          <p className="mt-2 font-display text-xl font-bold text-ink">
            {stats.today}
          </p>
          <p className="text-xs text-muted">Today</p>
        </Card>
        <Card className="p-3 text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-accent">
            <CalendarDays size={16} />
          </div>
          <p className="mt-2 font-display text-xl font-bold text-ink">
            {stats.week}
          </p>
          <p className="text-xs text-muted">This week</p>
        </Card>
        <Card className="p-3 text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-success-soft text-success">
            <TrendingUp size={16} />
          </div>
          <p className="mt-2 font-display text-xl font-bold text-ink">
            {stats.total}
          </p>
          <p className="text-xs text-muted">All time</p>
        </Card>
      </div>

      {/* Recent visits */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-ink">
            Recent Site Visits
          </h2>
          <Link
            href="/technician/history"
            className="text-sm font-semibold text-brand"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-sm text-brand-dark">{error}</p>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={<ClipboardPlus size={28} />}
            title="No site visits yet"
            description="Your completed visits will show up here."
            action={
              <Link href="/technician/site-visit">
                <Button size="sm">Log your first visit</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {recent.map((v) => (
              <Card key={v.id} className="p-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-ink">{v.machineRefNo}</p>
                    <p className="mt-0.5 text-sm text-muted">
                      {v.solutionCategory}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      categoryTone(v.solutionCategory) === "success"
                        ? "bg-success-soft text-success"
                        : categoryTone(v.solutionCategory) === "warning"
                          ? "bg-warning-soft text-warning"
                          : categoryTone(v.solutionCategory) === "accent"
                            ? "bg-accent-soft text-accent"
                            : "bg-brand-soft text-brand-dark"
                    }`}
                  >
                    {v.id}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {v.visitDate} · {v.visitTime}
                  </span>
                  {v.latitude != null && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> Location captured
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
