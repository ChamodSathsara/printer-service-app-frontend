"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";
import { Machine } from "@/lib/types";
import { Card, EmptyState, Spinner, Badge } from "@/components/ui/Common";
import { Input } from "@/components/ui/Field";
import {
  Search,
  Printer,
  Hash,
  CalendarCheck,
  Building2,
  User,
  Phone,
  MapPin,
} from "lucide-react";

const statusTone: Record<Machine["status"], "success" | "warning" | "neutral"> = {
  Active: "success",
  "Under Service": "warning",
  Decommissioned: "neutral",
};

export default function MachinesPage() {
  const [query, setQuery] = useState("");
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Machine | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      api.machines
        .list(query || undefined)
        .then((res) => setMachines(res.machines))
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-bold text-ink">Machines</h1>
        <p className="text-sm text-muted">Search by machine reference number</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input
          placeholder="e.g. GST-2201"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          className="pl-9"
        />
      </div>

      {selected ? (
        <MachineDetail machine={selected} onBack={() => setSelected(null)} />
      ) : loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : error ? (
        <p className="text-sm text-brand-dark">{error}</p>
      ) : machines.length === 0 ? (
        <EmptyState icon={<Printer size={28} />} title="No machines found" description="Try a different reference number." />
      ) : (
        <div className="space-y-3">
          {machines.map((m) => (
            <button key={m.refNo} onClick={() => setSelected(m)} className="block w-full text-left">
              <Card className="flex items-center gap-3 p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-dark">
                  <Printer size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-ink">{m.refNo}</p>
                    <Badge tone={statusTone[m.status]}>{m.status}</Badge>
                  </div>
                  <p className="text-sm text-muted">{m.model}</p>
                  <p className="mt-0.5 text-xs text-muted">{m.customer.name}</p>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MachineDetail({ machine, onBack }: { machine: Machine; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm font-semibold text-brand">
        ← Back to results
      </button>

      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-lg font-bold text-ink">{machine.refNo}</p>
            <p className="text-sm text-muted">{machine.model}</p>
          </div>
          <Badge tone={statusTone[machine.status]}>{machine.status}</Badge>
        </div>
      </Card>

      <Card className="p-1">
        <p className="px-3.5 pt-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Machine details
        </p>
        <div className="divide-y divide-border">
          <Row icon={Printer} label="Type" value={machine.type} />
          <Row icon={Hash} label="Serial Number" value={machine.serialNumber} />
          <Row icon={CalendarCheck} label="Installed On" value={machine.installDate} />
        </div>
      </Card>

      <Card className="p-1">
        <p className="px-3.5 pt-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Customer details
        </p>
        <div className="divide-y divide-border">
          <Row icon={Building2} label="Customer" value={machine.customer.name} />
          <Row icon={User} label="Contact Person" value={machine.customer.contactPerson} />
          <Row icon={Phone} label="Phone" value={machine.customer.phone} />
          <Row icon={MapPin} label="Address" value={machine.customer.address} />
        </div>
      </Card>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 px-3.5 py-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg text-muted">
        <Icon size={15} />
      </div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}
