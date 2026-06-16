"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/apiClient";
import { Visit } from "@/lib/types";
import { Card, EmptyState, Spinner } from "@/components/ui/Common";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { exportVisitsToCSV, exportVisitsToPDF } from "@/lib/export";
import {
  Search,
  CalendarRange,
  MapPin,
  ChevronRight,
  FileDown,
  FileSpreadsheet,
  History as HistoryIcon,
  X,
} from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  function load() {
    if (!user) return;
    setLoading(true);
    api.visits
      .list({ techCode: user.techCode, from: from || undefined, to: to || undefined, search: search || undefined })
      .then((res) => setVisits(res.visits))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault();
    load();
  }

  function clearFilters() {
    setSearch("");
    setFrom("");
    setTo("");
    setTimeout(load, 0);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Visit History</h1>
        <p className="text-sm text-muted">All your completed site visits</p>
      </div>

      {/* Search + filter toggle */}
      <form onSubmit={applyFilters} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Search by machine, category, note…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          variant={showFilters ? "secondary" : "outline"}
          size="md"
          className="!px-3"
          onClick={() => setShowFilters((s) => !s)}
          aria-label="Toggle date filters"
        >
          <CalendarRange size={18} />
        </Button>
      </form>

      {showFilters && (
        <Card className="space-y-3 p-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">From</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">To</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => applyFilters()} className="flex-1">
              Apply filters
            </Button>
            <Button size="sm" variant="ghost" onClick={clearFilters}>
              <X size={14} className="mr-1" /> Clear
            </Button>
          </div>
        </Card>
      )}

      {/* Export */}
      {visits.length > 0 && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => exportVisitsToCSV(visits, `visit-history-${user?.techCode}`)}
          >
            <FileSpreadsheet size={15} className="mr-1.5" /> Export Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() =>
              exportVisitsToPDF(
                visits,
                `visit-history-${user?.techCode}`,
                `Site Visit History — ${user?.name}`,
                `Technician Code ${user?.techCode}`
              )
            }
          >
            <FileDown size={15} className="mr-1.5" /> Export PDF
          </Button>
        </div>
      )}

      {/* List */}
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
          description="Try adjusting your search or date filters."
        />
      ) : (
        <div className="space-y-3">
          {visits.map((v) => (
            <Link key={v.id} href={`/technician/history/${v.id}`}>
              <Card className="flex items-center gap-3 p-3.5">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ink">{v.machineRefNo}</p>
                    <span className="text-xs text-muted">{v.id}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{v.solutionCategory}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted">
                    <span>{v.visitDate} · {v.visitTime}</span>
                    {v.latitude != null && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> Tracked
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
