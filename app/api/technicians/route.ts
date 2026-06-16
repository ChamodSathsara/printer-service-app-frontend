import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { technicians } = db.getUsers();
  const visits = db.getVisits();

  const result = technicians.map((t) => ({
    techCode: t.techCode,
    name: t.name,
    role: t.role,
    phone: t.phone,
    region: t.region,
    avatarColor: t.avatarColor,
    visitCount: visits.filter((v) => v.techCode === t.techCode).length,
  }));

  return NextResponse.json({ technicians: result });
}
