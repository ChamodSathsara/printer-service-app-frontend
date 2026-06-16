import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Visit, VisitInput } from "@/lib/types";

function withinRange(dateStr: string, from?: string | null, to?: string | null) {
  if (from && dateStr < from) return false;
  if (to && dateStr > to) return false;
  return true;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const techCode = searchParams.get("techCode");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const search = searchParams.get("search")?.toLowerCase().trim();

  let visits = db.getVisits();

  if (techCode) {
    visits = visits.filter((v) => v.techCode === techCode);
  }

  if (from || to) {
    visits = visits.filter((v) => withinRange(v.visitDate, from, to));
  }

  if (search) {
    visits = visits.filter((v) =>
      [v.machineRefNo, v.solutionCategory, v.note ?? "", v.techName]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }

  visits = [...visits].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({ visits });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as VisitInput | null;

  if (!body?.techCode || !body?.techName || !body?.machineRefNo || !body?.solutionCategory) {
    return NextResponse.json(
      { error: "Machine reference number and solution category are required." },
      { status: 400 }
    );
  }

  const visits = db.getVisits();

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const visitDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const visitTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const maxIdNum = visits.reduce((max, v) => {
    const n = parseInt(v.id.replace(/\D/g, ""), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);

  const newVisit: Visit = {
    id: `V${String(maxIdNum + 1).padStart(5, "0")}`,
    techCode: body.techCode,
    techName: body.techName,
    machineRefNo: body.machineRefNo.trim(),
    solutionCategory: body.solutionCategory,
    note: body.note?.trim() || "",
    meterReading:
      body.meterReading !== undefined && body.meterReading !== null && `${body.meterReading}` !== ""
        ? Number(body.meterReading)
        : null,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    visitDate,
    visitTime,
    createdAt: now.toISOString(),
  };

  visits.unshift(newVisit);
  db.saveVisits(visits);

  return NextResponse.json({ visit: newVisit }, { status: 201 });
}
