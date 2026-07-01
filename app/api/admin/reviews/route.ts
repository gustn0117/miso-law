import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { deleteReview, setReviewStatus } from "@/lib/db";
import { fail, ok } from "@/lib/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function guard() {
  if (!isAdmin())
    return NextResponse.json(fail("인증이 필요합니다."), { status: 401 });
  return null;
}

// 후기 상태 변경 (게시 / 숨김)
export async function PATCH(req: NextRequest) {
  const g = guard();
  if (g) return g;
  try {
    const body = await req.json();
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0)
      return NextResponse.json(fail("잘못된 ID"), { status: 400 });
    const status = body.status === "숨김" ? "숨김" : "게시";
    const okChange = setReviewStatus(id, status);
    if (!okChange)
      return NextResponse.json(fail("해당 후기를 찾을 수 없습니다."), {
        status: 404,
      });
    return NextResponse.json(ok({ id, status }));
  } catch (err) {
    console.error("[admin/reviews PATCH] error:", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}

// 후기 삭제 (관리자 — 회원ID 없이 완전 삭제)
export async function DELETE(req: NextRequest) {
  const g = guard();
  if (g) return g;
  try {
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0)
      return NextResponse.json(fail("잘못된 ID"), { status: 400 });
    const removed = deleteReview(id);
    if (!removed)
      return NextResponse.json(fail("이미 삭제되었거나 없는 후기입니다."), {
        status: 404,
      });
    return NextResponse.json(ok());
  } catch (err) {
    console.error("[admin/reviews DELETE] error:", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}
