import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import {
  INQUIRY_STATUSES,
  deleteInquiry,
  updateInquiry,
  type InquiryStatus,
} from "@/lib/db";
import { fail, ok, sanitize, sanitizeMultiline } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

function guard() {
  if (!isAdmin()) return NextResponse.json(fail("인증이 필요합니다."), { status: 401 });
  return null;
}

export async function PATCH(req: NextRequest) {
  const g = guard();
  if (g) return g;
  try {
    const body = await req.json();
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0)
      return NextResponse.json(fail("잘못된 ID"), { status: 400 });

    const patch: { status?: InquiryStatus; admin_memo?: string | null } = {};
    if (body.status !== undefined) {
      const s = sanitize(body.status, 20) as InquiryStatus;
      if (!INQUIRY_STATUSES.includes(s))
        return NextResponse.json(fail("잘못된 상태값"), { status: 400 });
      patch.status = s;
    }
    if (body.admin_memo !== undefined) {
      patch.admin_memo = sanitizeMultiline(body.admin_memo, 2000) || null;
    }
    updateInquiry(id, patch);
    return NextResponse.json(ok());
  } catch (err) {
    console.error("[admin/inquiries PATCH] error:", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const g = guard();
  if (g) return g;
  try {
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0)
      return NextResponse.json(fail("잘못된 ID"), { status: 400 });
    deleteInquiry(id);
    return NextResponse.json(ok());
  } catch (err) {
    console.error("[admin/inquiries DELETE] error:", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}
