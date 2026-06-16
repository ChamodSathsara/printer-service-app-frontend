import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AuthUser } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const techCode = body?.techCode?.toString().trim();
  const password = body?.password?.toString();

  if (!techCode || !password) {
    return NextResponse.json(
      { error: "Technician code and password are required." },
      { status: 400 }
    );
  }

  const { managers, technicians } = db.getUsers();

  const manager = managers.find((m) => m.techCode === techCode);
  const technician = technicians.find((t) => t.techCode === techCode);
  const account = manager ?? technician;

  if (!account || account.password !== password) {
    return NextResponse.json(
      { error: "Invalid technician code or password." },
      { status: 401 }
    );
  }

  const user: AuthUser = {
    techCode: account.techCode,
    name: account.name,
    role: account.role,
    ...(technician
      ? { phone: technician.phone, region: technician.region, avatarColor: technician.avatarColor }
      : {}),
    ...(manager ? { designation: manager.designation } : {}),
  };

  return NextResponse.json({ user });
}
