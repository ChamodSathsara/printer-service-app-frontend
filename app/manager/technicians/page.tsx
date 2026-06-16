"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import { Card, FullPageSpinner, EmptyState } from "@/components/ui/Common";
import { Phone, MapPinned, ChevronRight, Users } from "lucide-react";

type TechItem = Awaited<ReturnType<typeof api.technicians.list>>["technicians"][number];

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<TechItem[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.technicians
      .list()
      .then((res) => setTechnicians(res.technicians))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-sm text-brand-dark">{error}</p>;
  if (!technicians) return <FullPageSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Technicians</h1>
        <p className="text-sm text-muted">{technicians.length} technicians in the field</p>
      </div>

      {technicians.length === 0 ? (
        <EmptyState icon={<Users size={28} />} title="No technicians found" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {technicians.map((t) => (
            <Link key={t.techCode} href={`/manager/technicians/${t.techCode}`}>
              <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ backgroundColor: t.avatarColor || "#E4002B" }}
                  >
                    {t.name.charAt(0)}
                  </div>
                  <ChevronRight size={18} className="text-muted" />
                </div>
                <p className="mt-3 font-display text-lg font-bold text-ink">{t.name}</p>
                <p className="text-sm text-muted">Code: {t.techCode}</p>

                <div className="mt-3 space-y-1.5 text-sm text-muted">
                  {t.phone && (
                    <p className="flex items-center gap-2">
                      <Phone size={13} /> {t.phone}
                    </p>
                  )}
                  {t.region && (
                    <p className="flex items-center gap-2">
                      <MapPinned size={13} /> {t.region}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl bg-bg px-3 py-2.5">
                  <span className="text-sm text-muted">Site Visits</span>
                  <span className="font-display text-xl font-bold text-ink">{t.visitCount}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
