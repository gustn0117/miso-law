import { NextRequest, NextResponse } from "next/server";
import { getMemberByPhone, insertMember } from "@/lib/db";
import {
  hashPassword,
  isValidEmail,
  isValidPhone,
  loginMember,
  normalizePhone,
} from "@/lib/auth";
import { sanitize, fail, ok } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = sanitize(body.name, 30);
    const phone = normalizePhone(sanitize(body.phone, 30));
    const email = sanitize(body.email, 100);
    const password = String(body.password || "");
    const passwordConfirm = String(body.passwordConfirm || "");
    const agree = !!body.agree;

    if (!name)
      return NextResponse.json(fail("이름을 입력해 주세요."), { status: 400 });
    if (!phone || !isValidPhone(phone))
      return NextResponse.json(fail("올바른 휴대폰 번호를 입력해 주세요."), {
        status: 400,
      });
    if (email && !isValidEmail(email))
      return NextResponse.json(fail("올바른 이메일 형식이 아닙니다."), {
        status: 400,
      });
    if (password.length < 6)
      return NextResponse.json(fail("비밀번호는 6자 이상이어야 합니다."), {
        status: 400,
      });
    if (password !== passwordConfirm)
      return NextResponse.json(fail("비밀번호 확인이 일치하지 않습니다."), {
        status: 400,
      });
    if (!agree)
      return NextResponse.json(fail("개인정보 수집·이용 동의가 필요합니다."), {
        status: 400,
      });

    if (getMemberByPhone(phone))
      return NextResponse.json(fail("이미 가입된 휴대폰 번호입니다."), {
        status: 409,
      });

    const id = insertMember({
      name,
      phone,
      email: email || null,
      password_hash: hashPassword(password),
    });
    loginMember(id);
    return NextResponse.json(ok({ id }));
  } catch (err) {
    console.error("[signup] error:", err);
    return NextResponse.json(fail("회원가입 처리 중 오류가 발생했습니다."), {
      status: 500,
    });
  }
}
