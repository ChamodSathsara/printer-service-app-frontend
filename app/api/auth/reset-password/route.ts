import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const techCode = body?.techCode?.toString().trim();
  const currentPassword = body?.currentPassword?.toString();
  const newPassword = body?.newPassword?.toString();

  if (!techCode || !currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters long." },
      { status: 400 }
    );
  }

  const data = db.getUsers();

  const manager = data.managers.find((m) => m.techCode === techCode);
  const technician = data.technicians.find((t) => t.techCode === techCode);
  const account = manager ?? technician;

  if (!account) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  if (account.password !== currentPassword) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 }
    );
  }

  account.password = newPassword;
  db.saveUsers(data);

  return NextResponse.json({ success: true });
}
