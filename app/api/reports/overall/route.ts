import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const techCode = searchParams.get("techCode");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const search = searchParams.get("search")?.toLowerCase().trim();

  let visits = db.getVisits();

  if (techCode) visits = visits.filter((v) => v.techCode === techCode);
  if (from) visits = visits.filter((v) => v.visitDate >= from);
  if (to) visits = visits.filter((v) => v.visitDate <= to);

  if (search) {
    visits = visits.filter((v) =>
      [v.machineRefNo, v.solutionCategory, v.note ?? "", v.techName, v.techCode]
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
