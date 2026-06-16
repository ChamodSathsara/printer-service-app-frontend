import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const visits = db.getVisits();
  const visit = visits.find((v) => v.id === id);

  if (!visit) {
    return NextResponse.json({ error: "Visit not found." }, { status: 404 });
  }

  return NextResponse.json({ visit });
}
