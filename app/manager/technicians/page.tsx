"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import type { TechnicianDto } from "@/lib/apiClient";
import { Card, FullPageSpinner, EmptyState } from "@/components/ui/Common";
import { ChevronRight, Users, Mail, CheckCircle, XCircle } from "lucide-react";

// Deterministic avatar colour from tech code
function avatarColor(techCode: string): string {
  const palette = [
    "#E4002B",
    "#1E40AF",
    "#059669",
    "#7C3AED",
    "#D97706",
    "#0891B2",
    "#BE185D",
    "#15803D",
  ];
  let hash = 0;
  for (const ch of techCode) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<TechnicianDto[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.technicians
      .list()
      .then(setTechnicians)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="p-6 text-sm text-brand-dark">{error}</p>;
  if (!technicians) return <FullPageSpinner />;

  const active = technicians.filter((t) => t.isActive).length;
  const inactive = technicians.length - active;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            Technicians
          </h1>
          <p className="text-sm text-muted">
            {active} active
            {inactive > 0 && `, ${inactive} inactive`}
          </p>
        </div>
      </div>

      {technicians.length === 0 ? (
        <EmptyState icon={<Users size={28} />} title="No technicians found" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {technicians.map((t) => (
            <Link
              key={t.technicianCode}
              href={`/manager/technicians/${t.technicianCode}`}
            >
              <Card
                className={`flex h-full flex-col p-5 transition-shadow hover:shadow-md ${
                  !t.isActive ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ backgroundColor: avatarColor(t.technicianCode) }}
                  >
                    {t.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-2">
                    {t.isActive ? (
                      <span className="flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                        <CheckCircle size={11} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-bg px-2 py-0.5 text-xs font-medium text-muted">
                        <XCircle size={11} /> Inactive
                      </span>
                    )}
                    <ChevronRight size={18} className="text-muted" />
                  </div>
                </div>

                <p className="mt-3 font-display text-lg font-bold text-ink">
                  {t.fullName}
                </p>
                <p className="text-sm text-muted">Code: {t.technicianCode}</p>

                {t.email && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted">
                    <Mail size={13} /> {t.email}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between rounded-xl bg-bg px-3 py-2.5">
                  <span className="text-sm text-muted">Total Visits</span>
                  <span className="font-display text-xl font-bold text-ink">
                    {t.visitCount}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
