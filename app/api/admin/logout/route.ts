import { NextResponse } from "next/server";
import { logoutAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export async function POST() {
  logoutAdmin();
  return NextResponse.json({ ok: true });
}
