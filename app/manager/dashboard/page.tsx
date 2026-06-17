"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import type { DashboardStatsResponse } from "@/lib/apiClient";
import { Card, FullPageSpinner } from "@/components/ui/Common";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ClipboardList,
  Tags,
  Trophy,
  ArrowRight,
  Users,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
} from "lucide-react";

const CHART_COLORS = [
  "#E4002B",
  "#0F766E",
  "#D97706",
  "#2563EB",
  "#7C3AED",
  "#64748B",
  "#BE185D",
  "#15803D",
  "#0891B2",
  "#92400E",
];

const INK = "#14171F";
const GRID = "#E6E8EC";
const AXIS_TEXT = "#6B7280";

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
}

/** Small up/down/flat indicator used inside stat cards. */
function TrendBadge({ pct }: { pct: number }) {
  if (pct === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-muted">
        <Minus size={12} /> 0%
      </span>
    );
  }
  const up = pct > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
        up ? "text-success" : "text-brand"
      }`}
    >
      <Icon size={12} />
      {Math.abs(pct)}%
    </span>
  );
}

/** Tooltip for the trend chart (area + lines). */
function TrendTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-black/5 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <p className="mb-1.5 text-xs font-semibold text-ink">{label}</p>
      <div className="space-y-1">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted">{entry.dataKey}</span>
            <span className="ml-auto font-semibold text-ink">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ManagerDashboardPage() {
  const [data, setData] = useState<DashboardStatsResponse | null>(null);
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
        date: formatDateLabel(day.date),
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
    () =>
      data ? data.topCategories.slice(0, 3).map((c) => c.categoryName) : [],
    [data],
  );

  // Build pie chart data from topCategories
  const pieData = useMemo(() => {
    if (!data) return [];
    const total = data.topCategories.reduce((s, c) => s + c.count, 0);
    return data.topCategories.map((c) => ({
      category: c.categoryName,
      count: c.count,
      percentage: total > 0 ? Math.round((c.count / total) * 100 * 10) / 10 : 0,
    }));
  }, [data]);

  // Day-over-day movement for "Today's Visits", derived from existing weeklyTrend data
  const todayDelta = useMemo(() => {
    if (!data || data.weeklyTrend.length < 2) return null;
    const prev = data.weeklyTrend[data.weeklyTrend.length - 2].totalCount;
    if (prev === 0) return data.todayVisits > 0 ? 100 : 0;
    return Math.round(((data.todayVisits - prev) / prev) * 100);
  }, [data]);

  // Average visits per day this week, derived from existing weeklyTrend data
  const weeklyAvg = useMemo(() => {
    if (!data || data.weeklyTrend.length === 0) return null;
    const total = data.weeklyTrend.reduce((s, d) => s + d.totalCount, 0);
    return Math.round((total / data.weeklyTrend.length) * 10) / 10;
  }, [data]);

  function PieTooltip({ active, payload }: any) {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0];
    const idx = pieData.findIndex((p) => p.category === item.name);
    const color = CHART_COLORS[idx >= 0 ? idx % CHART_COLORS.length : 0];
    return (
      <div className="rounded-xl border border-black/5 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="font-semibold text-ink">{item.name}</span>
        </div>
        <p className="mt-1 text-xs text-muted">
          {item.value} visits · {item.payload.percentage}%
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-brand-dark">
        <AlertCircle size={18} className="shrink-0 text-brand" />
        <p>{error}</p>
      </div>
    );
  }
  if (!data) return <FullPageSpinner />;

  const mostVisited = data.topCategories[0];
  const mostVisitedShare = pieData[0]?.percentage;
  const topVisitCount = data.topTechnicians[0]?.visitCount ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-muted">
          Service visit insights and analytics
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden border-l-[3px] border-brand p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-dark transition-transform duration-200 group-hover:scale-105">
              <ClipboardList size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted">Total Visits</p>
              <p className="font-display text-2xl font-bold text-ink">
                {data.totalVisits}
              </p>
              {weeklyAvg !== null && (
                <p className="text-xs text-muted">
                  avg {weeklyAvg}/day this week
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="group relative overflow-hidden border-l-[3px] border-accent p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent transition-transform duration-200 group-hover:scale-105">
              <CalendarDays size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted">Today&apos;s Visits</p>
              <div className="flex items-baseline gap-2">
                <p className="font-display text-2xl font-bold text-ink">
                  {data.todayVisits}
                </p>
                {todayDelta !== null && <TrendBadge pct={todayDelta} />}
              </div>
              {todayDelta !== null && (
                <p className="text-xs text-muted">vs yesterday</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="group relative overflow-hidden border-l-[3px] border-success p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success transition-transform duration-200 group-hover:scale-105">
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

        <Card className="group relative overflow-hidden border-l-[3px] border-warning p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-warning transition-transform duration-200 group-hover:scale-105">
              <Tags size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted">Top Category</p>
              <p className="truncate font-display text-base font-bold text-ink">
                {mostVisited ? mostVisited.categoryName : "—"}
              </p>
              {mostVisited && (
                <p className="text-xs text-muted">
                  {mostVisited.count} visits
                  {mostVisitedShare !== undefined
                    ? ` · ${mostVisitedShare}% of total`
                    : ""}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Trend chart */}
        <Card className="p-5 lg:col-span-3">
          <h2 className="font-display font-bold text-ink">
            Last 7 Days — Visit Trend
          </h2>
          <p className="mb-4 text-sm text-muted">
            Daily visit count with top 3 categories highlighted.
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={lineData}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={INK} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={INK} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={GRID} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: AXIS_TEXT }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: AXIS_TEXT }}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<TrendTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Total"
                  stroke={INK}
                  strokeWidth={2.5}
                  fill="url(#totalFill)"
                  activeDot={{ r: 4 }}
                  dot={{ r: 2.5, strokeWidth: 0, fill: INK }}
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
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-black/5 pt-3">
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: INK }}
              />
              Total
            </span>
            {topCatLines.map((cat, i) => (
              <span
                key={cat}
                className="flex items-center gap-1.5 text-xs text-muted"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor:
                      CHART_COLORS[(i + 1) % CHART_COLORS.length],
                  }}
                />
                {cat}
              </span>
            ))}
          </div>
        </Card>

        {/* Donut chart */}
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
              <div className="relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={86}
                      paddingAngle={2}
                      cornerRadius={4}
                      stroke="none"
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="font-display text-2xl font-bold text-ink">
                    {data.totalVisits}
                  </p>
                  <p className="text-xs text-muted">total visits</p>
                </div>
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
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                    {c.category}
                    <span className="text-ink-soft">{c.percentage}%</span>
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
            className="flex items-center gap-1 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {data.topTechnicians.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted">
            No site visit data yet.
          </p>
        ) : (
          <div className="space-y-1">
            {data.topTechnicians.map((t, i) => (
              <Link
                key={t.technicianCode}
                href={`/manager/technicians/${t.technicianCode}`}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-bg"
              >
                {/* Rank badge */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-transform duration-200 group-hover:scale-105 ${
                    i === 0
                      ? "bg-warning-soft text-warning"
                      : i === 1
                        ? "bg-bg text-ink-soft"
                        : i === 2
                          ? "bg-brand-soft text-brand-dark"
                          : "bg-bg text-ink-soft"
                  }`}
                >
                  {i === 0 ? <Trophy size={15} /> : i + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{t.fullName}</p>
                  <p className="text-xs text-muted">Code: {t.technicianCode}</p>
                  <div className="mt-1.5 h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-bg">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-300"
                      style={{
                        width: `${topVisitCount > 0 ? (t.visitCount / topVisitCount) * 100 : 0}%`,
                      }}
                    />
                  </div>
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
