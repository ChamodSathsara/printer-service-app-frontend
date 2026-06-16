"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import { Visit } from "@/lib/types";
import { Card, FullPageSpinner, EmptyState, Badge } from "@/components/ui/Common";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { exportVisitsToCSV, exportVisitsToPDF } from "@/lib/export";
import {
  ArrowLeft,
  Phone,
  MapPinned,
  Hash,
  CalendarRange,
  FileDown,
  FileSpreadsheet,
  ClipboardList,
  MapPin,
  X,
} from "lucide-react";

type TechResponse = Awaited<ReturnType<typeof api.technicians.get>>;

export default function TechnicianProfilePage() {
  const { techCode } = useParams<{ techCode: string }>();
  const router = useRouter();
  const [data, setData] = useState<TechResponse | null>(null);
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function load() {
    api.technicians
      .get(techCode, { from: from || undefined, to: to || undefined })
      .then(setData)
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [techCode]);

  if (error) return <p className="text-sm text-brand-dark">{error}</p>;
  if (!data) return <FullPageSpinner />;

  const { technician, visits, stats } = data;
  const topCategories = Object.entries(stats.categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to Technicians
      </button>

      {/* Header */}
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ backgroundColor: technician.avatarColor || "#E4002B" }}
            >
              {technician.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">{technician.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
                <span className="flex items-center gap-1">
                  <Hash size={13} /> {technician.techCode}
                </span>
                {technician.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={13} /> {technician.phone}
                  </span>
                )}
                {technician.region && (
                  <span className="flex items-center gap-1">
                    <MapPinned size={13} /> {technician.region}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportVisitsToCSV(visits, `${technician.techCode}-visit-history`)}
              disabled={visits.length === 0}
            >
              <FileSpreadsheet size={15} className="mr-1.5" /> Excel
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                exportVisitsToPDF(
                  visits,
                  `${technician.techCode}-visit-history`,
                  `Technician Report — ${technician.name}`,
                  `Technician Code ${technician.techCode}`
                )
              }
              disabled={visits.length === 0}
            >
              <FileDown size={15} className="mr-1.5" /> PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-muted">Total Visits</p>
          <p className="font-display text-3xl font-bold text-ink">{stats.totalVisits}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted">Last Visit</p>
          <p className="font-display text-lg font-bold text-ink">
            {stats.lastVisit ? new Date(stats.lastVisit).toLocaleString() : "—"}
          </p>
        </Card>
        <Card className="p-5 sm:col-span-2 lg:col-span-1">
          <p className="mb-2 text-sm text-muted">Top Categories</p>
          <div className="flex flex-wrap gap-1.5">
            {topCategories.length === 0 ? (
              <span className="text-sm text-muted">—</span>
            ) : (
              topCategories.map(([cat, count]) => (
                <Badge key={cat} tone="brand">
                  {cat} · {count}
                </Badge>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Date filter */}
      <Card className="flex flex-wrap items-end gap-3 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
          <CalendarRange size={16} /> Date range
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">From</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">To</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
        </div>
        <Button size="sm" onClick={load}>
          Apply
        </Button>
        {(from || to) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setFrom("");
              setTo("");
              setTimeout(load, 0);
            }}
          >
            <X size={14} className="mr-1" /> Clear
          </Button>
        )}
      </Card>

      {/* Visit history table */}
      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="font-display font-bold text-ink">Visit History</h2>
        </div>
        {visits.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={<ClipboardList size={28} />} title="No visits found" description="No site visits recorded in this date range." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-semibold">Visit ID</th>
                  <th className="px-4 py-3 font-semibold">Date &amp; Time</th>
                  <th className="px-4 py-3 font-semibold">Machine</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Meter Reading</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visits.map((v: Visit) => (
                  <tr key={v.id} className="hover:bg-bg/60">
                    <td className="px-4 py-3 font-medium text-ink">{v.id}</td>
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
        )}
      </Card>
    </div>
  );
}
