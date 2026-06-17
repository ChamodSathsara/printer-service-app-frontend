"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import type { DashboardStatsResponse } from "@/lib/apiClient";
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
import {
  ClipboardList,
  Tags,
  Trophy,
  ArrowRight,
  Users,
  CalendarDays,
} from "lucide-react";

const CHART_COLORS = [
  "#E4002B", "#0F766E", "#D97706", "#2563EB", "#7C3AED", "#64748B",
  "#BE185D", "#15803D", "#0891B2", "#92400E",
];

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
}

export default function ManagerDashboardPage() {
  const [data, setData]   = useState<DashboardStatsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.dashboard
      .getStats()
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  // Build line chart data from weeklyTrend + byCategory breakdown
  const lineData = useMemo(() => {
    if (!data) return [];
    const topCats = data.topCategories.slice(0, 3).map((c) => c.categoryName);

    return data.weeklyTrend.map((day) => {
      const row: Record<string, number | string> = {
        date:  formatDateLabel(day.date),
        Total: day.totalCount,
      };
      topCats.forEach((cat) => {
        const match = day.byCategory.find((b) => b.categoryName === cat);
        row[cat] = match?.count ?? 0;
      });
      return row;
    });
  }, [data]);

  const topCatLines = useMemo(
    () => (data ? data.topCategories.slice(0, 3).map((c) => c.categoryName) : []),
    [data],
  );

  // Build pie chart data from topCategories
  const pieData = useMemo(() => {
    if (!data) return [];
    const total = data.topCategories.reduce((s, c) => s + c.count, 0);
    return data.topCategories.map((c) => ({
      category:   c.categoryName,
      count:      c.count,
      percentage: total > 0 ? Math.round((c.count / total) * 100 * 10) / 10 : 0,
    }));
  }, [data]);

  if (error) return <p className="p-6 text-sm text-brand-dark">{error}</p>;
  if (!data)  return <FullPageSpinner />;

  const mostVisited = data.topCategories[0];
  const topTech     = data.topTechnicians[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-muted">Service visit insights and analytics</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-dark">
              <ClipboardList size={20} />
            </div>
            <div>
              <p className="text-sm text-muted">Total Visits</p>
              <p className="font-display text-2xl font-bold text-ink">
                {data.totalVisits}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-sm text-muted">Today&apos;s Visits</p>
              <p className="font-display text-2xl font-bold text-ink">
                {data.todayVisits}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success">
              <Users size={20} />
            </div>
            <div>
              <p className="text-sm text-muted">Active Technicians</p>
              <p className="font-display text-2xl font-bold text-ink">
                {data.totalTechnicians}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-warning">
              <Tags size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted">Top Category</p>
              <p className="truncate font-display text-base font-bold text-ink">
                {mostVisited ? mostVisited.categoryName : "—"}
              </p>
              {mostVisited && (
                <p className="text-xs text-muted">{mostVisited.count} visits</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Line chart */}
        <Card className="p-5 lg:col-span-3">
          <h2 className="font-display font-bold text-ink">
            Last 7 Days — Visit Trend
          </h2>
          <p className="mb-4 text-sm text-muted">
            Daily visit count with top 3 categories highlighted.
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineData}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E8EC" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  allowDecimals={false}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="Total"
                  stroke="#14171F"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
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

        {/* Pie chart */}
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-display font-bold text-ink">
            Category Distribution
          </h2>
          <p className="mb-2 text-sm text-muted">
            Share of visits by solution category
          </p>
          {pieData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">No data yet.</p>
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      label={(entry) => `${entry.payload.percentage}%`}
                      labelLine={false}
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} visits`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
                {pieData.map((c, i) => (
                  <span
                    key={c.category}
                    className="flex items-center gap-1.5 text-xs text-muted"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                    {c.category}
                  </span>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Top technicians */}
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display font-bold text-ink">
            Top Performing Technicians
          </h2>
          <Link
            href="/manager/technicians"
            className="flex items-center gap-1 text-sm font-semibold text-brand"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {data.topTechnicians.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted">No site visit data yet.</p>
        ) : (
          <div className="space-y-1">
            {data.topTechnicians.map((t, i) => (
              <Link
                key={t.technicianCode}
                href={`/manager/technicians/${t.technicianCode}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-bg"
              >
                {/* Rank badge */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    i === 0
                      ? "bg-warning-soft text-warning"
                      : i === 1
                        ? "bg-bg text-ink-soft"
                        : i === 2
                          ? "bg-brand-soft text-brand-dark"
                          : "bg-bg text-ink-soft"
                  }`}
                >
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">{t.fullName}</p>
                  <p className="text-xs text-muted">Code: {t.technicianCode}</p>
                </div>

                <div className="text-right">
                  <p className="font-display font-bold text-ink">
                    {t.visitCount}
                  </p>
                  <p className="text-xs text-muted">visits</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}