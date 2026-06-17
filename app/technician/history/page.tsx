"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/apiClient";
import type { SiteVisitDto, SolutionCategory } from "@/lib/apiClient";
import { Card, EmptyState, Spinner } from "@/components/ui/Common";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import {
  Search,
  CalendarRange,
  MapPin,
  ChevronRight,
  FileDown,
  FileSpreadsheet,
  History as HistoryIcon,
  X,
  ChevronLeft,
  SlidersHorizontal,
} from "lucide-react";

const PAGE_SIZE = 20;

export default function HistoryPage() {
  const { user } = useAuth();

  // ── visits state ────────────────────────────────────────────
  const [visits, setVisits] = useState<SiteVisitDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── filter state ────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  // ── categories for the filter dropdown ──────────────────────
  const [categories, setCategories] = useState<SolutionCategory[]>([]);
  useEffect(() => {
    api.categories
      .list()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // ── export loading ───────────────────────────────────────────
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);

  // ── load visits ──────────────────────────────────────────────
  const load = useCallback(
    (targetPage = 1) => {
      if (!user) return;
      setLoading(true);
      setError("");
      api.visits
        .listMy({
          from: from || undefined,
          to: to || undefined,
          search: search || undefined,
          categoryId: categoryId || undefined,
          page: targetPage,
          pageSize: PAGE_SIZE,
        })
        .then((res) => {
          setVisits(res.items);
          setTotalCount(res.totalCount);
          setTotalPages(res.totalPages);
          setPage(targetPage);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, from, to, search, categoryId],
  );

  useEffect(() => {
    load(1);
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── filter actions ───────────────────────────────────────────
  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault();
    load(1);
  }

  function clearFilters() {
    setSearch("");
    setFrom("");
    setTo("");
    setCategoryId(undefined);
    // load after state flushes
    setTimeout(() => load(1), 0);
  }

  const hasActiveFilters = !!(search || from || to || categoryId);

  // ── server-side export ───────────────────────────────────────
  async function handleExport(format: "excel" | "pdf") {
    setExporting(format);
    try {
      const params = {
        from: from || undefined,
        to: to || undefined,
        search: search || undefined,
        categoryId: categoryId || undefined,
      };

      const blob =
        format === "excel"
          ? await api.visits.exportExcel(params)
          : await api.visits.exportPdf(params);

      const ext = format === "excel" ? "xlsx" : "pdf";
      const fileUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = fileUrl;
      anchor.download = `visit-history-${user?.techCode}-${new Date().toISOString().slice(0, 10)}.${ext}`;
      anchor.click();
      URL.revokeObjectURL(fileUrl);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setExporting(null);
    }
  }

  // ── render ───────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">
            Visit History
          </h1>
          <p className="text-sm text-muted">
            {totalCount > 0
              ? `${totalCount} visit${totalCount !== 1 ? "s" : ""} total`
              : "All your completed site visits"}
          </p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-medium text-brand"
          >
            <X size={13} /> Clear filters
          </button>
        )}
      </div>

      {/* Search bar + filter toggle */}
      <form onSubmit={applyFilters} className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            placeholder="Machine, category, note…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" size="md" className="!px-3" aria-label="Search">
          <Search size={16} />
        </Button>
        <Button
          type="button"
          variant={showFilters || hasActiveFilters ? "secondary" : "outline"}
          size="md"
          className="!px-3 relative"
          onClick={() => setShowFilters((s) => !s)}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal size={16} />
          {hasActiveFilters && (
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand" />
          )}
        </Button>
      </form>

      {/* Expanded filters panel */}
      {showFilters && (
        <Card className="space-y-3 p-3.5">
          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">
                From
              </label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">
                To
              </label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>

          {/* Category dropdown */}
          {categories.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">
                Category
              </label>
              <select
                value={categoryId ?? ""}
                onChange={(e) =>
                  setCategoryId(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.categoryName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button size="sm" onClick={() => applyFilters()} className="flex-1">
              <CalendarRange size={14} className="mr-1.5" /> Apply filters
            </Button>
            <Button size="sm" variant="ghost" onClick={clearFilters}>
              <X size={14} className="mr-1" /> Clear
            </Button>
          </div>
        </Card>
      )}

      {/* Export — server-side */}
      {totalCount > 0 && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={exporting === "excel"}
            onClick={() => handleExport("excel")}
          >
            <FileSpreadsheet size={15} className="mr-1.5" />
            {exporting === "excel" ? "Exporting…" : "Export Excel"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={exporting === "pdf"}
            onClick={() => handleExport("pdf")}
          >
            <FileDown size={15} className="mr-1.5" />
            {exporting === "pdf" ? "Exporting…" : "Export PDF"}
          </Button>
        </div>
      )}

      {/* Visit list */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : error ? (
        <p className="text-sm text-brand-dark">{error}</p>
      ) : visits.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon size={28} />}
          title="No visits found"
          description={
            hasActiveFilters
              ? "Try adjusting or clearing your filters."
              : "Your completed visits will appear here."
          }
          action={
            hasActiveFilters ? (
              <Button size="sm" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {visits.map((v) => (
            <Link key={v.visitId} href={`/technician/history/${v.visitId}`}>
              <Card className="flex items-center gap-3 p-3.5 active:bg-bg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink truncate">
                      {v.machineRefNumber}
                    </p>
                    <span className="shrink-0 text-xs text-muted">
                      #{v.visitId}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted truncate">
                    {v.categoryName}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted">
                    <span className="shrink-0">
                      {v.visitDate} · {v.visitTime}
                    </span>
                    {v.locationAddress ? (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">{v.locationAddress}</span>
                      </span>
                    ) : v.latitude != null && v.latitude !== 0 ? (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> Tracked
                      </span>
                    ) : null}
                  </div>
                </div>
                <ChevronRight size={18} className="shrink-0 text-muted" />
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between pt-1">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => load(page - 1)}
            className="!px-3"
          >
            <ChevronLeft size={16} />
          </Button>
          <p className="text-xs text-muted">
            Page <span className="font-semibold text-ink">{page}</span> of{" "}
            <span className="font-semibold text-ink">{totalPages}</span>
          </p>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => load(page + 1)}
            className="!px-3"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
