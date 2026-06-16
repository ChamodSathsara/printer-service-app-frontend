"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import { Card, FullPageSpinner } from "@/components/ui/Common";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ClipboardList, Tags, Trophy, ArrowRight } from "lucide-react";

type DashboardData = Awaited<ReturnType<typeof api.dashboard.get>>;

const CHART_COLORS = ["#E4002B", "#0F766E", "#D97706", "#2563EB", "#7C3AED", "#64748B"];

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
}

export default function ManagerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard
      .get()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  const lineData = useMemo(() => {
    if (!data) return [];
    const topCats = data.topCategories.slice(0, 3).map((c) => c.category);
    return data.dailyTrend.map((d) => {
      const row: Record<string, number | string> = {
        date: formatDateLabel(d.date),
        Total: d.total,
      };
      topCats.forEach((cat) => {
        row[cat] = d.categories[cat] ?? 0;
      });
      return row;
    });
  }, [data]);

  const topCatLines = useMemo(
    () => (data ? data.topCategories.slice(0, 3).map((c) => c.category) : []),
    [data]
  );

  if (error) return <p className="text-sm text-brand-dark">{error}</p>;
  if (!data) return <FullPageSpinner />;

  const mostVisited = data.topCategories[0];
  const topTech = data.topTechnicians[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-muted">Service visit insights and analytics</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-dark">
              <ClipboardList size={20} />
            </div>
            <div>
              <p className="text-sm text-muted">Total Site Visits</p>
              <p className="font-display text-2xl font-bold text-ink">{data.totalVisits}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Tags size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted">Most Visited Category</p>
              <p className="truncate font-display text-lg font-bold text-ink">
                {mostVisited ? mostVisited.category : "—"}
              </p>
              {mostVisited && <p className="text-xs text-muted">{mostVisited.count} visits</p>}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-soft text-success">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-sm text-muted">Top Performing Technician</p>
              <p className="font-display text-lg font-bold text-ink">{topTech ? topTech.name : "—"}</p>
              {topTech && <p className="text-xs text-muted">{topTech.count} visits</p>}
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-display font-bold text-ink">Last 7 Days — Visit Trend</h2>
          </div>
          <p className="mb-4 text-sm text-muted">
            Daily visit count, with the top 3 solution categories highlighted.
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E8EC" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Total" stroke="#14171F" strokeWidth={2.5} dot={{ r: 3 }} />
                {topCatLines.map((cat, i) => (
                  <Line
                    key={cat}
                    type="monotone"
                    dataKey={cat}
                    stroke={CHART_COLORS[(i + 1) % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="font-display font-bold text-ink">Category Distribution</h2>
          <p className="mb-2 text-sm text-muted">Share of visits by solution category</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={(entry) => `${entry.payload.percentage}%`}
                  labelLine={false}
                >
                  {data.categoryDistribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} visits`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.categoryDistribution.slice(0, 6).map((c, i) => (
              <span key={c.category} className="flex items-center gap-1.5 text-xs text-muted">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                {c.category}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Top technicians */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display font-bold text-ink">Top Performing Technicians</h2>
          <Link href="/manager/technicians" className="flex items-center gap-1 text-sm font-semibold text-brand">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-2">
          {data.topTechnicians.map((t, i) => (
            <Link
              key={t.techCode}
              href={`/manager/technicians/${t.techCode}`}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-bg"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg text-sm font-bold text-ink-soft">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-ink">{t.name}</p>
                <p className="text-xs text-muted">Code: {t.techCode}</p>
              </div>
              <p className="font-display font-bold text-ink">{t.count}</p>
              <p className="text-xs text-muted">visits</p>
            </Link>
          ))}
          {data.topTechnicians.length === 0 && (
            <p className="px-3 py-4 text-sm text-muted">No site visit data yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
