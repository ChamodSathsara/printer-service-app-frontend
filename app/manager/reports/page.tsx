"use client";

import { useEffect, useState, useCallback } from "react";
import { api, type SiteVisitDto, type TechnicianDto } from "@/lib/apiClient";
import { Card, EmptyState, Spinner, Badge } from "@/components/ui/Common";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import {
  FileBarChart,
  FileDown,
  FileSpreadsheet,
  Search,
  CalendarRange,
  MapPin,
  X,
  User,
  Globe,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Trigger a browser download from a Blob returned by the export endpoints. */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function stamp() {
  return new Date()
    .toISOString()
    .slice(0, 16)
    .replace("T", "_")
    .replace(":", "");
}

// ─────────────────────────────────────────────────────────────────────────────
// Page root
// ─────────────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [tab, setTab] = useState<"overall" | "technician">("overall");
  const [technicians, setTechnicians] = useState<TechnicianDto[]>([]);

  useEffect(() => {
    api.technicians
      .list()
      .then((data) => setTechnicians(data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Reports</h1>
        <p className="text-sm text-muted">
          Generate and export site visit reports
        </p>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-border bg-surface p-1">
        <button
          onClick={() => setTab("overall")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            tab === "overall"
              ? "bg-brand text-white"
              : "text-ink-soft hover:bg-bg",
          )}
        >
          <Globe size={15} /> Overall Report
        </button>
        <button
          onClick={() => setTab("technician")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            tab === "technician"
              ? "bg-brand text-white"
              : "text-ink-soft hover:bg-bg",
          )}
        >
          <User size={15} /> Technician Report
        </button>
      </div>

      {tab === "overall" ? (
        <OverallReport technicians={technicians} />
      ) : (
        <TechnicianReport technicians={technicians} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared visit table
// ─────────────────────────────────────────────────────────────────────────────

function VisitTable({ visits }: { visits: SiteVisitDto[] }) {
  if (visits.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<FileBarChart size={28} />}
          title="No visits found"
          description="Try adjusting your filters."
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-bg text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-semibold">ID</th>
            <th className="px-4 py-3 font-semibold">Technician</th>
            <th className="px-4 py-3 font-semibold">Date &amp; Time</th>
            <th className="px-4 py-3 font-semibold">Machine</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Meter Reading</th>
            <th className="px-4 py-3 font-semibold">Location</th>
            <th className="px-4 py-3 font-semibold">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {visits.map((v) => (
            <tr key={v.visitId} className="hover:bg-bg/60">
              <td className="px-4 py-3 font-medium text-ink">{v.visitId}</td>
              <td className="px-4 py-3 text-muted">
                {v.technicianName}
                <span className="ml-1 text-xs">({v.technicianCode})</span>
              </td>
              <td className="px-4 py-3 text-muted">
                {v.visitDate} <span className="text-xs">{v.visitTime}</span>
              </td>
              <td className="px-4 py-3 font-medium text-ink">
                {v.machineRefNumber}
              </td>
              <td className="px-4 py-3">
                <Badge tone="accent">{v.categoryName}</Badge>
              </td>
              <td className="px-4 py-3 text-muted">
                {v.meterReadingValue != null
                  ? v.meterReadingValue.toLocaleString()
                  : "—"}
              </td>
              <td className="px-4 py-3 text-muted">
                {v.latitude != null ? (
                  <a
                    href={`https://www.google.com/maps?q=${v.latitude},${v.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-brand hover:underline"
                  >
                    <MapPin size={12} /> View
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td
                className="max-w-xs truncate px-4 py-3 text-muted"
                title={v.note ?? ""}
              >
                {v.note || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination controls
// ─────────────────────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border text-sm">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
      >
        ← Prev
      </Button>
      <span className="text-muted">
        Page {page} of {totalPages}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
      >
        Next →
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Overall Report  (Manager: all visits, optional tech filter)
// ─────────────────────────────────────────────────────────────────────────────

function OverallReport({ technicians }: { technicians: TechnicianDto[] }) {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [techCode, setTechCode] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [visits, setVisits] = useState<SiteVisitDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);

  const buildParams = useCallback(
    (p: number) => ({
      techCode: techCode || undefined,
      fromDate: from || undefined,
      toDate: to || undefined,
      search: search || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      page: p,
      pageSize: PAGE_SIZE,
    }),
    [techCode, from, to, search, categoryId],
  );

  const load = useCallback(
    (p = 1) => {
      setLoading(true);
      setError("");
      api.visits
        .listAll(buildParams(p))
        .then((res) => {
          setVisits(res.items);
          setTotalCount(res.totalCount);
          setTotalPages(res.totalPages);
          setPage(res.page);
        })
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    },
    [buildParams],
  );

  // Load on mount
  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clear() {
    setSearch("");
    setFrom("");
    setTo("");
    setTechCode("");
    setCategoryId("");
    // reset then load — use setTimeout so state has flushed
    setTimeout(() => load(1), 0);
  }

  async function handleExportExcel() {
    setExporting("excel");
    try {
      const blob = await api.visits.exportExcel({
        fromDate: from || undefined,
        toDate: to || undefined,
        search: search || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
      });
      downloadBlob(blob, `SiteVisitReport_${stamp()}.xlsx`);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setExporting(null);
    }
  }

  async function handleExportPdf() {
    setExporting("pdf");
    try {
      const blob = await api.visits.exportPdf({
        fromDate: from || undefined,
        toDate: to || undefined,
        search: search || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
      });
      downloadBlob(blob, `SiteVisitReport_${stamp()}.pdf`);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setExporting(null);
    }
  }

  const hasFilters = search || from || to || techCode || categoryId;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <Label className="!mb-1">Search</Label>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <Input
                placeholder="Machine ref, tech name, note…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load(1)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="w-48">
            <Label className="!mb-1">Technician</Label>
            <Select
              value={techCode}
              onChange={(e) => setTechCode(e.target.value)}
            >
              <option value="">All technicians</option>
              {technicians.map((t) => (
                <option key={t.technicianCode} value={t.technicianCode}>
                  {t.fullName} ({t.technicianCode})
                </option>
              ))}
            </Select>
          </div>

          <div className="w-40">
            <Label className="!mb-1 flex items-center gap-1">
              <CalendarRange size={13} /> From
            </Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Label className="!mb-1">To</Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <Button size="md" onClick={() => load(1)}>
            Apply
          </Button>
          {hasFilters && (
            <Button size="md" variant="ghost" onClick={clear}>
              <X size={14} className="mr-1" /> Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {loading
            ? "Loading…"
            : `${totalCount} record${totalCount === 1 ? "" : "s"} found`}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportExcel}
            disabled={totalCount === 0 || exporting !== null}
            loading={exporting === "excel"}
          >
            <FileSpreadsheet size={15} className="mr-1.5" /> Export Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportPdf}
            disabled={totalCount === 0 || exporting !== null}
            loading={exporting === "pdf"}
          >
            <FileDown size={15} className="mr-1.5" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : error ? (
          <p className="p-4 text-sm text-brand-dark">{error}</p>
        ) : (
          <>
            <VisitTable visits={visits} />
            <Pagination page={page} totalPages={totalPages} onPage={load} />
          </>
        )}
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Technician Report  (Manager: pick a tech and filter by date)
// ─────────────────────────────────────────────────────────────────────────────

function TechnicianReport({ technicians }: { technicians: TechnicianDto[] }) {
  const [techCode, setTechCode] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [visits, setVisits] = useState<SiteVisitDto[] | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);

  const selectedTech = technicians.find((t) => t.technicianCode === techCode);

  function loadPage(p: number) {
    if (!techCode) {
      setError("Please select a technician.");
      return;
    }
    setError("");
    setLoading(true);
    api.visits
      .listAll({
        techCode,
        fromDate: from || undefined,
        toDate: to || undefined,
        page: p,
        pageSize: PAGE_SIZE,
      })
      .then((res) => {
        setVisits(res.items);
        setTotalCount(res.totalCount);
        setTotalPages(res.totalPages);
        setPage(res.page);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  async function handleExportExcel() {
    if (!techCode) return;
    setExporting("excel");
    try {
      const blob = await api.visits.exportExcel({
        fromDate: from || undefined,
        toDate: to || undefined,
      });
      const name = selectedTech?.fullName ?? techCode;
      downloadBlob(blob, `${name}_Report_${stamp()}.xlsx`);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setExporting(null);
    }
  }

  async function handleExportPdf() {
    if (!techCode) return;
    setExporting("pdf");
    try {
      const blob = await api.visits.exportPdf({
        fromDate: from || undefined,
        toDate: to || undefined,
      });
      const name = selectedTech?.fullName ?? techCode;
      downloadBlob(blob, `${name}_Report_${stamp()}.pdf`);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-56">
            <Label required className="!mb-1">
              Technician
            </Label>
            <Select
              value={techCode}
              onChange={(e) => setTechCode(e.target.value)}
            >
              <option value="">Select a technician</option>
              {technicians.map((t) => (
                <option key={t.technicianCode} value={t.technicianCode}>
                  {t.fullName} ({t.technicianCode})
                </option>
              ))}
            </Select>
          </div>

          <div className="w-40">
            <Label className="!mb-1 flex items-center gap-1">
              <CalendarRange size={13} /> From
            </Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="w-40">
            <Label className="!mb-1">To</Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <Button size="md" onClick={() => loadPage(1)} loading={loading}>
            Generate
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-brand-dark">{error}</p>}
      </Card>

      {/* Results */}
      {visits !== null && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              {totalCount} record{totalCount === 1 ? "" : "s"}
              {selectedTech && (
                <>
                  {" "}
                  for{" "}
                  <span className="font-semibold text-ink">
                    {selectedTech.fullName}
                  </span>
                </>
              )}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportExcel}
                disabled={totalCount === 0 || exporting !== null}
                loading={exporting === "excel"}
              >
                <FileSpreadsheet size={15} className="mr-1.5" /> Export Excel
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportPdf}
                disabled={totalCount === 0 || exporting !== null}
                loading={exporting === "pdf"}
              >
                <FileDown size={15} className="mr-1.5" /> Export PDF
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : (
              <>
                <VisitTable visits={visits} />
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPage={loadPage}
                />
              </>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
