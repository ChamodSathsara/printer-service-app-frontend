"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import type { TechnicianProfileResponse } from "@/lib/apiClient";
import { Card, FullPageSpinner, EmptyState, Badge } from "@/components/ui/Common";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Hash,
  Mail,
  CheckCircle,
  XCircle,
  ClipboardList,
  MapPin,
  FileDown,
  FileSpreadsheet,
} from "lucide-react";

function avatarColor(techCode: string): string {
  const palette = [
    "#E4002B", "#1E40AF", "#059669", "#7C3AED",
    "#D97706", "#0891B2", "#BE185D", "#15803D",
  ];
  let hash = 0;
  for (const ch of techCode) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export default function TechnicianProfilePage() {
  const { techCode } = useParams<{ techCode: string }>();
  const router       = useRouter();

  const [data, setData]     = useState<TechnicianProfileResponse | null>(null);
  const [error, setError]   = useState("");
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);

  useEffect(() => {
    api.technicians
      .get(techCode)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [techCode]);

  async function handleExport(format: "excel" | "pdf") {
    setExporting(format);
    try {
      const blob = format === "excel"
        ? await api.visits.exportExcel({ })
        : await api.visits.exportPdf({ });

      // Note: manager export for a specific tech — pass techCode via listAll instead
      // For now exports all visits; extend exportExcel/exportPdf to accept techCode if needed
      const ext      = format === "excel" ? "xlsx" : "pdf";
      const mimeType = format === "excel"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "application/pdf";
      const typedBlob = new Blob([blob], { type: mimeType });
      const fileUrl   = URL.createObjectURL(typedBlob);
      const anchor    = document.createElement("a");
      anchor.href     = fileUrl;
      anchor.download = `${techCode}-visits-${new Date().toISOString().slice(0, 10)}.${ext}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(fileUrl);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setExporting(null);
    }
  }

  if (error) return <p className="p-6 text-sm text-brand-dark">{error}</p>;
  if (!data)  return <FullPageSpinner />;

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
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ backgroundColor: avatarColor(data.technicianCode) }}
            >
              {data.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-ink">
                  {data.fullName}
                </h1>
                {data.isActive ? (
                  <span className="flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                    <CheckCircle size={11} /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-bg px-2 py-0.5 text-xs font-medium text-muted">
                    <XCircle size={11} /> Inactive
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
                <span className="flex items-center gap-1">
                  <Hash size={13} /> {data.technicianCode}
                </span>
                {data.email && (
                  <span className="flex items-center gap-1">
                    <Mail size={13} /> {data.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Export buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={data.totalVisits === 0 || exporting === "excel"}
              onClick={() => handleExport("excel")}
            >
              <FileSpreadsheet size={15} className="mr-1.5" />
              {exporting === "excel" ? "Exporting…" : "Excel"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={data.totalVisits === 0 || exporting === "pdf"}
              onClick={() => handleExport("pdf")}
            >
              <FileDown size={15} className="mr-1.5" />
              {exporting === "pdf" ? "Exporting…" : "PDF"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-muted">Total Visits</p>
          <p className="font-display text-3xl font-bold text-ink">
            {data.totalVisits}
          </p>
        </Card>

        <Card className="p-5">
          <p className="mb-2 text-sm text-muted">Category Breakdown</p>
          {data.categoryBreakdown.length === 0 ? (
            <span className="text-sm text-muted">—</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {data.categoryBreakdown.slice(0, 5).map((c) => (
                <Badge key={c.categoryName} tone="brand">
                  {c.categoryName} · {c.count}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent visits table */}
      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="font-display font-bold text-ink">
            Recent Visits
            <span className="ml-2 text-sm font-normal text-muted">
              (last 10)
            </span>
          </h2>
        </div>

        {data.recentVisits.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<ClipboardList size={28} />}
              title="No visits recorded"
              description="This technician has no site visits yet."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Date &amp; Time</th>
                  <th className="px-4 py-3 font-semibold">Machine</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Meter Reading</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recentVisits.map((v) => (
                  <tr key={v.visitId} className="hover:bg-bg/60">
                    <td className="px-4 py-3 font-medium text-ink">
                      #{v.visitId}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {v.visitDate}{" "}
                      <span className="text-xs">{v.visitTime}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {v.machineRefNumber}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="accent">{v.categoryName}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {v.meterReadingValue != null
                        ? Number(v.meterReadingValue).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {v.latitude != null && v.latitude !== 0 ? (
                        <a
                          href={`https://www.google.com/maps?q=${v.latitude},${v.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-brand hover:underline"
                        >
                          <MapPin size={12} /> View
                        </a>
                      ) : v.locationAddress ? (
                        <span className="truncate">{v.locationAddress}</span>
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
        )}
      </Card>
    </div>
  );
}