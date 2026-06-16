"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/apiClient";
import type { SiteVisitDto } from "@/lib/apiClient";
import { Card, FullPageSpinner, Badge } from "@/components/ui/Common";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Printer,
  Tag,
  StickyNote,
  Gauge,
  CalendarClock,
  MapPin,
  ExternalLink,
} from "lucide-react";

export default function VisitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [visit, setVisit] = useState<SiteVisitDto | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.visits
      .get(Number(id)) // id is now a number
      .then((dto) => setVisit(dto)) // unwrap returns SiteVisitDto directly
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <FullPageSpinner />;

  if (error || !visit) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-brand-dark">{error || "Visit not found."}</p>
        <Button className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const hasLocation =
    visit.latitude != null &&
    visit.latitude !== 0 &&
    visit.longitude != null &&
    visit.longitude !== 0;

  const rows = [
    {
      icon: Printer,
      label: "Machine Reference Number",
      value: visit.machineRefNumber,
    },
    { icon: Tag, label: "Solution Category", value: visit.categoryName },
    {
      icon: Gauge,
      label: "Meter Reading",
      value:
        visit.meterReadingValue != null
          ? visit.meterReadingValue.toLocaleString()
          : "Not recorded",
    },
    {
      icon: CalendarClock,
      label: "Visit Date & Time",
      value: `${visit.visitDate} · ${visit.visitTime}`,
    },
  ];

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Visit ID
            </p>
            <p className="font-display text-lg font-bold text-ink">
              #{visit.visitId}
            </p>
          </div>
          <Badge tone="brand">{visit.categoryName}</Badge>
        </div>
      </Card>

      <Card className="divide-y divide-border p-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-3 px-3.5 py-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg text-muted">
              <r.icon size={15} />
            </div>
            <div>
              <p className="text-xs text-muted">{r.label}</p>
              <p className="font-medium text-ink">{r.value}</p>
            </div>
          </div>
        ))}

        <div className="flex items-start gap-3 px-3.5 py-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg text-muted">
            <StickyNote size={15} />
          </div>
          <div>
            <p className="text-xs text-muted">Note</p>
            <p className="font-medium text-ink">
              {visit.note || "No additional notes."}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-3.5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg text-muted">
            <MapPin size={15} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted">Location</p>
            {visit.locationAddress && (
              <p className="font-medium text-ink">{visit.locationAddress}</p>
            )}
            {hasLocation ? (
              <>
                <p
                  className={`font-medium text-ink ${visit.locationAddress ? "text-sm text-muted" : ""}`}
                >
                  {visit.latitude!.toFixed(6)}, {visit.longitude!.toFixed(6)}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${visit.latitude},${visit.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand"
                >
                  View on map <ExternalLink size={13} />
                </a>
              </>
            ) : !visit.locationAddress ? (
              <p className="font-medium text-ink">
                Not captured for this visit.
              </p>
            ) : null}
          </div>
        </div>
      </Card>

      <Card className="p-3.5 text-sm text-muted">
        Logged by{" "}
        <span className="font-medium text-ink">{visit.technicianName}</span> (
        {visit.technicianCode}) on {new Date(visit.createdAt).toLocaleString()}
      </Card>
    </div>
  );
}
