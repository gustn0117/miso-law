import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import {
  deleteMember,
  deleteMemberSessions,
  getMemberById,
  updateMemberPassword,
} from "@/lib/db";
import { generateTempPassword, hashPassword } from "@/lib/auth";
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

// 비밀번호 초기화 — 임시 비밀번호 자동 생성 후 1회 반환
export async function POST(req: NextRequest) {
  if (!isAdmin())
    return NextResponse.json(fail("인증이 필요합니다."), { status: 401 });
  try {
    const body = await req.json();
    if (body.action !== "reset")
      return NextResponse.json(fail("알 수 없는 요청"), { status: 400 });

    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0)
      return NextResponse.json(fail("잘못된 ID"), { status: 400 });
    if (!getMemberById(id))
      return NextResponse.json(fail("존재하지 않는 회원입니다."), {
        status: 404,
      });

    const tempPassword = generateTempPassword();
    updateMemberPassword(id, hashPassword(tempPassword));
    // 초기화 후 해당 회원의 기존 로그인 세션 전부 무효화
    deleteMemberSessions(id);
    return NextResponse.json(ok({ tempPassword }));
  } catch (err) {
    console.error("[admin/members POST reset] error:", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}
