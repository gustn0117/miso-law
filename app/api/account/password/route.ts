import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getCurrentMember,
  hashPassword,
  verifyPassword,
  MEMBER_COOKIE,
} from "@/lib/auth";
import {
  deleteMemberSessions,
  getMemberById,
  updateMemberPassword,
} from "@/lib/db";
import { fail, ok } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const current = getCurrentMember();
  if (!current)
    return NextResponse.json(fail("로그인이 필요합니다."), { status: 401 });

  try {
    const body = await req.json();
    const currentPw = String(body.current || "");
    const next = String(body.next || "");
    const nextConfirm = String(body.nextConfirm || "");

    const member = getMemberById(current.id);
    if (!member)
      return NextResponse.json(fail("회원 정보를 찾을 수 없습니다."), {
        status: 404,
      });

    if (!verifyPassword(currentPw, member.password_hash))
      return NextResponse.json(fail("현재 비밀번호가 일치하지 않습니다."), {
        status: 400,
      });
    if (next.length < 6)
      return NextResponse.json(fail("새 비밀번호는 6자 이상이어야 합니다."), {
        status: 400,
      });
    if (next !== nextConfirm)
      return NextResponse.json(fail("새 비밀번호 확인이 일치하지 않습니다."), {
        status: 400,
      });
    if (next === currentPw)
      return NextResponse.json(
        fail("현재 비밀번호와 다른 비밀번호를 입력해 주세요."),
        { status: 400 },
      );

    updateMemberPassword(member.id, hashPassword(next));
    // 현재 세션은 유지하고 그 외 세션은 무효화
    const token = cookies().get(MEMBER_COOKIE)?.value;
    deleteMemberSessions(member.id, token);

    return NextResponse.json(ok());
  } catch (err) {
    console.error("[account/password POST] error:", err);
    return NextResponse.json(fail("비밀번호 변경 중 오류가 발생했습니다."), {
      status: 500,
    });
  }
}
