import { NextRequest, NextResponse } from "next/server";
import { insertInquiry } from "@/lib/db";
import { sanitize, sanitizeMultiline, fail, ok } from "@/lib/sanitize";
import {
  getCurrentMember,
  isValidPhone,
  normalizePhone,
} from "@/lib/auth";
import { notifyNewInquiry } from "@/lib/notify";

export const dynamic = "force-dynamic";

// 재택알바 신청. 스텝 wizard(6단계)에서 수집한 항목을 요약해
// 기존 inquiries 테이블에 저장.
// source = "재택알바문의", category_slug = null (검증 우회)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = sanitize(body.name, 30);
    const phone = normalizePhone(sanitize(body.phone, 30));
    const occupation = sanitize(body.occupation, 20);
    const region = sanitize(body.region, 20);
    const district = sanitizeMultiline(body.district, 100);
    const availability = sanitize(body.availability, 40);
    const ageRange = sanitize(body.age_range, 20);
    const agree = !!body.agree;

    if (!name)
      return NextResponse.json(fail("이름을 입력해 주세요."), { status: 400 });
    if (!phone || !isValidPhone(phone))
      return NextResponse.json(fail("올바른 연락처를 입력해 주세요."), {
        status: 400,
      });
    if (!agree)
      return NextResponse.json(fail("개인정보 수집·이용 동의가 필요합니다."), {
        status: 400,
      });

    const content = [
      "[재택알바문의]",
      occupation ? `직업: ${occupation}` : null,
      region ? `거주지역: ${region}` : null,
      district ? `거주지: ${district}` : null,
      availability ? `상담 가능 시간: ${availability}` : null,
      ageRange ? `연령대: ${ageRange}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const member = getCurrentMember();
    const id = insertInquiry({
      member_id: member?.id ?? null,
      name,
      phone,
      email: null,
      category_slug: null,
      content,
      source: "재택알바문의",
    });

    notifyNewInquiry({
      id,
      name,
      phone,
      email: null,
      category_slug: `재택알바 · ${occupation || "미정"}`,
      content,
      source: "재택알바문의",
    }).catch((e) => console.error("[job-inquiries] notify failed:", e));

    return NextResponse.json(ok({ id }));
  } catch (err) {
    console.error("[job-inquiries] insert error:", err);
    return NextResponse.json(
      fail("서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."),
      { status: 500 },
    );
  }
}
