import { NextRequest, NextResponse } from "next/server";
import {
  getMemberByEmail,
  getMemberByPhone,
  insertPasswordResetRequest,
} from "@/lib/db";
import { isValidEmail, normalizePhone } from "@/lib/auth";
import { sanitize, fail, ok } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = sanitize(body.name, 30);
    const phoneRaw = sanitize(body.phone, 30);
    const phone = phoneRaw ? normalizePhone(phoneRaw) : "";
    const email = sanitize(body.email, 100);

    // 전화·이메일 중 최소 하나는 있어야 본인 확인이 가능
    if (!phone && !email)
      return NextResponse.json(
        fail("전화번호 또는 이메일 중 하나 이상을 입력해 주세요."),
        { status: 400 },
      );
    if (email && !isValidEmail(email))
      return NextResponse.json(fail("올바른 이메일 형식이 아닙니다."), {
        status: 400,
      });

    // 회원 매칭 — 전화번호 우선, 없으면 이메일
    let matched = phone ? getMemberByPhone(phone) : null;
    if (!matched && email) matched = getMemberByEmail(email);

    insertPasswordResetRequest({
      member_id: matched ? matched.id : null,
      name: name || null,
      phone: phone || null,
      email: email || null,
    });

    // 계정 존재 여부를 노출하지 않기 위해 항상 동일한 성공 응답
    return NextResponse.json(ok());
  } catch (err) {
    console.error("[auth/find-password POST] error:", err);
    return NextResponse.json(fail("요청 처리 중 오류가 발생했습니다."), {
      status: 500,
    });
  }
}
