import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import {
  deleteMemberSessions,
  deletePasswordResetRequest,
  getMemberById,
  getPasswordResetRequest,
  updateMemberPassword,
  updatePasswordResetRequestStatus,
} from "@/lib/db";
import { generateTempPassword, hashPassword } from "@/lib/auth";
import { fail, ok } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

// 재설정 요청 처리
// - action: "reset" → 매칭된 회원 비번 초기화 + 임시비번 반환 + 요청 '처리완료'
// - action: "done"  → 초기화 없이 요청만 '처리완료'로 표시
export async function POST(req: NextRequest) {
  if (!isAdmin())
    return NextResponse.json(fail("인증이 필요합니다."), { status: 401 });
  try {
    const body = await req.json();
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0)
      return NextResponse.json(fail("잘못된 ID"), { status: 400 });

    const request = getPasswordResetRequest(id);
    if (!request)
      return NextResponse.json(fail("요청을 찾을 수 없습니다."), {
        status: 404,
      });

    if (body.action === "reset") {
      if (!request.member_id || !getMemberById(request.member_id))
        return NextResponse.json(
          fail("매칭된 회원이 없어 초기화할 수 없습니다. 회원 목록에서 직접 처리해 주세요."),
          { status: 400 },
        );
      const tempPassword = generateTempPassword();
      updateMemberPassword(request.member_id, hashPassword(tempPassword));
      deleteMemberSessions(request.member_id);
      updatePasswordResetRequestStatus(id, "처리완료");
      return NextResponse.json(ok({ tempPassword }));
    }

    if (body.action === "done") {
      updatePasswordResetRequestStatus(id, "처리완료");
      return NextResponse.json(ok());
    }

    return NextResponse.json(fail("알 수 없는 요청"), { status: 400 });
  } catch (err) {
    console.error("[admin/password-requests POST] error:", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin())
    return NextResponse.json(fail("인증이 필요합니다."), { status: 401 });
  try {
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0)
      return NextResponse.json(fail("잘못된 ID"), { status: 400 });
    deletePasswordResetRequest(id);
    return NextResponse.json(ok());
  } catch (err) {
    console.error("[admin/password-requests DELETE] error:", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}
