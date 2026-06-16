"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { api, SolutionCategory } from "@/lib/apiClient";
import { Visit } from "@/lib/types";
import { Card } from "@/components/ui/Common";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Field";
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ClipboardPlus,
  Loader2,
  Printer,
} from "lucide-react";

type LocationState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "success"; lat: number; lng: number; accuracy: number }
  | { status: "error"; message: string };

export default function SiteVisitPage() {
  const { user } = useAuth();
  const [machineRefNo, setMachineRefNo] = useState("");

  // Category now comes from the backend (SolutionCategory table), not a
  // hardcoded list — CreateSiteVisitRequest needs a numeric CategoryId.
  const [categories, setCategories] = useState<SolutionCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [note, setNote] = useState("");
  const [meterReading, setMeterReading] = useState("");
  const [location, setLocation] = useState<LocationState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<any | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.categories
      .list()
      .then((list) => {
        if (!cancelled) setCategories(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setCategoriesError(
            err instanceof Error
              ? err.message
              : "Couldn't load solution categories.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function captureLocation(): Promise<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null> {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) {
        setLocation({
          status: "error",
          message: "Location services are not supported on this device.",
        });
        resolve(null);
        return;
      }
      setLocation({ status: "locating" });
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const result = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setLocation({ status: "success", ...result });
          resolve(result);
        },
        (err) => {
          setLocation({
            status: "error",
            message:
              err.code === err.PERMISSION_DENIED
                ? "Location permission denied. Enable it to capture your visit location."
                : "Unable to capture location. The visit will be saved without coordinates.",
          });
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSubmitting(true);

    try {
      const loc = await captureLocation();

      // Technician identity is derived from the JWT on the backend, so it's
      // not part of the payload — only the visit details go in the body.
      const visit = await api.visits.create({
        machineRefNumber: machineRefNo.trim(),
        categoryId: Number(categoryId),
        note: note.trim() || null,
        meterReadingValue: meterReading === "" ? null : Number(meterReading),
        latitude: loc?.lat ?? null,
        longitude: loc?.lng ?? null,
        locationAddress: null,
      });

      setSubmitted(visit);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save site visit.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSubmitted(null);
    setMachineRefNo("");
    setCategoryId("");
    setNote("");
    setMeterReading("");
    setLocation({ status: "idle" });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-ink">
          Site visit saved
        </h2>
        <p className="mt-1 max-w-xs text-sm text-muted">
          Visit <span className="font-semibold text-ink">{submitted.id}</span>{" "}
          for machine{" "}
          <span className="font-semibold text-ink">
            {submitted.machineRefNo}
          </span>{" "}
          has been recorded.
        </p>

        <Card className="mt-6 w-full p-4 text-left">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Solution category</span>
              <span className="font-medium text-ink">
                {submitted.solutionCategory}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Date &amp; time</span>
              <span className="font-medium text-ink">
                {submitted.visitDate} · {submitted.visitTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Location</span>
              <span className="font-medium text-ink">
                {submitted.latitude != null
                  ? `${submitted.latitude.toFixed(4)}, ${submitted.longitude?.toFixed(4)}`
                  : "Not captured"}
              </span>
            </div>
          </div>
        </Card>

        <Button className="mt-6" fullWidth size="lg" onClick={resetForm}>
          Log another visit
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-dark">
            <ClipboardPlus size={20} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-ink">
              New Site Visit
            </h1>
            <p className="text-sm text-muted">Fill in the details below</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="space-y-4 p-4">
          <div>
            <Label required>Machine Reference Number</Label>
            <div className="relative">
              <Printer
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <Input
                placeholder="e.g. GST-2201"
                value={machineRefNo}
                onChange={(e) => setMachineRefNo(e.target.value)}
                required
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label required>Solution Category</Label>
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              disabled={categoriesLoading || !!categoriesError}
            >
              <option value="" disabled>
                {categoriesLoading
                  ? "Loading categories…"
                  : "Select a category"}
              </option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </Select>
            {categoriesError && (
              <p className="mt-1 text-xs text-warning">{categoriesError}</p>
            )}
          </div>

          <div>
            <Label>Note</Label>
            <Textarea
              placeholder="Add any observations or follow-up details (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div>
            <Label>Meter Reading Value</Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 45210"
              value={meterReading}
              onChange={(e) => setMeterReading(e.target.value)}
              min={0}
            />
          </div>
        </Card>

        {/* Location status */}
        <Card className="flex items-start gap-3 p-4">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              location.status === "success"
                ? "bg-success-soft text-success"
                : location.status === "error"
                  ? "bg-warning-soft text-warning"
                  : "bg-accent-soft text-accent"
            }`}
          >
            {location.status === "locating" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : location.status === "error" ? (
              <AlertTriangle size={16} />
            ) : (
              <MapPin size={16} />
            )}
          </div>
          <div className="text-sm">
            <p className="font-medium text-ink">Location tracking</p>
            {location.status === "idle" && (
              <p className="text-muted">
                Your GPS location is captured automatically when you submit this
                form.
              </p>
            )}
            {location.status === "locating" && (
              <p className="text-muted">Capturing your current location…</p>
            )}
            {location.status === "success" && (
              <p className="text-muted">
                Captured: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}{" "}
                (±{Math.round(location.accuracy)}m)
              </p>
            )}
            {location.status === "error" && (
              <p className="text-warning">{location.message}</p>
            )}
          </div>
        </Card>

        {error && (
          <div className="rounded-xl bg-brand-soft px-3 py-2.5 text-sm text-brand-dark">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={submitting}>
          {submitting ? "Saving visit…" : "Submit Site Visit"}
        </Button>
      </form>
    </div>
  );
}
