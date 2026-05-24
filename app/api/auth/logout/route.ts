import { NextResponse } from "next/server";
import { logoutMember } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  logoutMember();
  return NextResponse.json({ ok: true });
}
