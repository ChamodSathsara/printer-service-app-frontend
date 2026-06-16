"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Visit } from "@/lib/types";
import { Card, EmptyState, Spinner, Badge } from "@/components/ui/Common";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label } from "@/components/ui/Field";
import { exportVisitsToCSV, exportVisitsToPDF } from "@/lib/export";
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

type TechItem = Awaited<ReturnType<typeof api.technicians.list>>["technicians"][number];

export default function ReportsPage() {
  const [tab, setTab] = useState<"overall" | "technician">("overall");
  const [technicians, setTechnicians] = useState<TechItem[]>([]);

  useEffect(() => {
    api.technicians.list().then((res) => setTechnicians(res.technicians)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Reports</h1>
        <p className="text-sm text-muted">Generate and export site visit reports</p>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-border bg-surface p-1">
        <button
          onClick={() => setTab("overall")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            tab === "overall" ? "bg-brand text-white" : "text-ink-soft hover:bg-bg"
          )}
        >
          <Globe size={15} /> Overall Report
        </button>
        <button
          onClick={() => setTab("technician")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            tab === "technician" ? "bg-brand text-white" : "text-ink-soft hover:bg-bg"
          )}
        >
          <User size={15} /> Technician-wise Report
        </button>
      </div>

      {tab === "overall" ? <OverallReport technicians={technicians} /> : <TechnicianReport technicians={technicians} />}
    </div>
  );
}

function FilterBar({
  search,
  setSearch,
  from,
  setFrom,
  to,
  setTo,
  techCode,
  setTechCode,
  technicians,
  onApply,
  onClear,
  showSearch = true,
  showTech = true,
}: {
  search: string;
  setSearch: (v: string) => void;
  from: string;
  setFrom: (v: string) => void;
  to: string;
  setTo: (v: string) => void;
  techCode: string;
  setTechCode: (v: string) => void;
  technicians: TechItem[];
  onApply: () => void;
  onClear: () => void;
  showSearch?: boolean;
  showTech?: boolean;
}) {
  const hasFilters = search || from || to || techCode;

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-end gap-3">
        {showSearch && (
          <div className="min-w-[200px] flex-1">
            <Label className="!mb-1">Search</Label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input
                placeholder="Machine, category, technician…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        )}

        {showTech && (
          <div className="w-48">
            <Label className="!mb-1">Technician</Label>
            <Select value={techCode} onChange={(e) => setTechCode(e.target.value)}>
              <option value="">All technicians</option>
              {technicians.map((t) => (
                <option key={t.techCode} value={t.techCode}>
                  {t.name} ({t.techCode})
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="w-40">
          <Label className="!mb-1 flex items-center gap-1">
            <CalendarRange size={13} /> From
          </Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="w-40">
          <Label className="!mb-1">To</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>

        <Button size="md" onClick={onApply}>
          Apply
        </Button>
        {hasFilters && (
          <Button size="md" variant="ghost" onClick={onClear}>
            <X size={14} className="mr-1" /> Clear
          </Button>
        )}
      </div>
    </Card>
  );
}

function VisitTable({ visits }: { visits: Visit[] }) {
  if (visits.length === 0) {
    return (
      <div className="p-6">
        <EmptyState icon={<FileBarChart size={28} />} title="No visits found" description="Try adjusting your filters." />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-bg text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-semibold">Visit ID</th>
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
            <tr key={v.id} className="hover:bg-bg/60">
              <td className="px-4 py-3 font-medium text-ink">{v.id}</td>
              <td className="px-4 py-3 text-muted">
                {v.techName}
                <span className="ml-1 text-xs">({v.techCode})</span>
              </td>
              <td className="px-4 py-3 text-muted">
                {v.visitDate} <span className="text-xs">{v.visitTime}</span>
              </td>
              <td className="px-4 py-3 font-medium text-ink">{v.machineRefNo}</td>
              <td className="px-4 py-3">
                <Badge tone="accent">{v.solutionCategory}</Badge>
              </td>
              <td className="px-4 py-3 text-muted">
                {v.meterReading != null ? v.meterReading.toLocaleString() : "—"}
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
              <td className="max-w-xs truncate px-4 py-3 text-muted" title={v.note || ""}>
                {v.note || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OverallReport({ technicians }: { technicians: TechItem[] }) {
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [techCode, setTechCode] = useState("");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api.reports
      .overall({
        search: search || undefined,
        from: from || undefined,
        to: to || undefined,
        techCode: techCode || undefined,
      })
      .then((res) => setVisits(res.visits))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clear() {
    setSearch("");
    setFrom("");
    setTo("");
    setTechCode("");
    setTimeout(load, 0);
  }

  return (
    <div className="space-y-4">
      <FilterBar
        search={search}
        setSearch={setSearch}
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        techCode={techCode}
        setTechCode={setTechCode}
        technicians={technicians}
        onApply={load}
        onClear={clear}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{visits.length} record{visits.length === 1 ? "" : "s"} found</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportVisitsToCSV(visits, "overall-visit-report")}
            disabled={visits.length === 0}
          >
            <FileSpreadsheet size={15} className="mr-1.5" /> Export Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              exportVisitsToPDF(visits, "overall-visit-report", "Overall Site Visit Report")
            }
            disabled={visits.length === 0}
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
        ) : error ? (
          <p className="p-4 text-sm text-brand-dark">{error}</p>
        ) : (
          <VisitTable visits={visits} />
        )}
      </Card>
    </div>
  );
}

function TechnicianReport({ technicians }: { technicians: TechItem[] }) {
  const [techCode, setTechCode] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [visits, setVisits] = useState<Visit[] | null>(null);
  const [techName, setTechName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function load() {
    if (!techCode) {
      setError("Please select a technician.");
      return;
    }
    setError("");
    setLoading(true);
    api.reports
      .technician(techCode, { from: from || undefined, to: to || undefined })
      .then((res) => {
        setVisits(res.visits);
        setTechName(res.technician.name);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-56">
            <Label required className="!mb-1">
              Technician
            </Label>
            <Select value={techCode} onChange={(e) => setTechCode(e.target.value)}>
              <option value="">Select a technician</option>
              {technicians.map((t) => (
                <option key={t.techCode} value={t.techCode}>
                  {t.name} ({t.techCode})
                </option>
              ))}
            </Select>
          </div>
          <div className="w-40">
            <Label className="!mb-1 flex items-center gap-1">
              <CalendarRange size={13} /> From
            </Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="w-40">
            <Label className="!mb-1">To</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <Button size="md" onClick={load} loading={loading}>
            Generate
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-brand-dark">{error}</p>}
      </Card>

      {visits !== null && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              {visits.length} record{visits.length === 1 ? "" : "s"} for <span className="font-semibold text-ink">{techName}</span>
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => exportVisitsToCSV(visits, `${techCode}-visit-report`)}
                disabled={visits.length === 0}
              >
                <FileSpreadsheet size={15} className="mr-1.5" /> Export Excel
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  exportVisitsToPDF(visits, `${techCode}-visit-report`, `Technician Report — ${techName}`, `Technician Code ${techCode}`)
                }
                disabled={visits.length === 0}
              >
                <FileDown size={15} className="mr-1.5" /> Export PDF
              </Button>
            </div>
          </div>
          <Card className="overflow-hidden">
            <VisitTable visits={visits} />
          </Card>
        </>
      )}
    </div>
  );
}
