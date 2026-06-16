import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;
  const machines = db.getMachines();
  const machine = machines.find(
    (m) => m.refNo.toLowerCase() === ref.toLowerCase()
  );

  if (!machine) {
    return NextResponse.json({ error: "Machine not found." }, { status: 404 });
  }

  return NextResponse.json({ machine });
}
