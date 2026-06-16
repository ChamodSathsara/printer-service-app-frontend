import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ techCode: string }> }
) {
  const { techCode } = await params;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const { technicians } = db.getUsers();
  const technician = technicians.find((t) => t.techCode === techCode);

  if (!technician) {
    return NextResponse.json({ error: "Technician not found." }, { status: 404 });
  }

  let visits = db.getVisits().filter((v) => v.techCode === techCode);
  if (from) visits = visits.filter((v) => v.visitDate >= from);
  if (to) visits = visits.filter((v) => v.visitDate <= to);

  visits = [...visits].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({
    technician: {
      techCode: technician.techCode,
      name: technician.name,
      role: technician.role,
      phone: technician.phone,
      region: technician.region,
    },
    visits,
  });
}
