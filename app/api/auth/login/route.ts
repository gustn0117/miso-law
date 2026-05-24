import { NextRequest, NextResponse } from "next/server";
import { getMemberByPhone } from "@/lib/db";
import { loginMember, normalizePhone, verifyPassword } from "@/lib/auth";
import { fail, ok, sanitize } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = normalizePhone(sanitize(body.phone, 30));
    const password = String(body.password || "");
    if (!phone || !password)
      return NextResponse.json(fail("휴대폰 번호와 비밀번호를 입력해 주세요."), {
        status: 400,
      });
    const m = getMemberByPhone(phone);
    if (!m || !verifyPassword(password, m.password_hash))
      return NextResponse.json(
        fail("휴대폰 번호 또는 비밀번호가 일치하지 않습니다."),
        { status: 401 },
      );
    loginMember(m.id);
    return NextResponse.json(ok({ id: m.id, name: m.name }));
  } catch (err) {
    console.error("[login] error:", err);
    return NextResponse.json(fail("로그인 처리 중 오류가 발생했습니다."), {
      status: 500,
    });
  }
}
