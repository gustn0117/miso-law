import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { deleteMember } from "@/lib/db";
import { fail, ok } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  if (!isAdmin())
    return NextResponse.json(fail("인증이 필요합니다."), { status: 401 });
  try {
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0)
      return NextResponse.json(fail("잘못된 ID"), { status: 400 });
    deleteMember(id);
    return NextResponse.json(ok());
  } catch (err) {
    console.error("[admin/members DELETE] error:", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}
