import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase().trim();

  let machines = db.getMachines();

  if (search) {
    machines = machines.filter((m) =>
      [m.refNo, m.model, m.type, m.customer.name]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }

  return NextResponse.json({ machines });
}
