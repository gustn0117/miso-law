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

// 재택알바 신청은 기존 inquiries 테이블 재사용.
//   category_slug: 알바 카테고리 slug (일반 상담 카테고리와 별도 네임스페이스)
//   source:        "재택알바문의"
//   content:       [재택알바문의] 나이대·희망시간 요약 + 사용자 입력 note
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = sanitize(body.name, 30);
    const phone = normalizePhone(sanitize(body.phone, 30));
    const ageRange = sanitize(body.age_range, 20);
    const availability = sanitize(body.availability, 40);
    const categorySlug = sanitize(body.category_slug, 40);
    const note = sanitizeMultiline(body.note, 2000);
    const agree = !!body.agree;

    if (!name) return NextResponse.json(fail("이름을 입력해 주세요."), { status: 400 });
    if (!phone || !isValidPhone(phone))
      return NextResponse.json(fail("올바른 연락처를 입력해 주세요."), {
        status: 400,
      });
    if (!agree)
      return NextResponse.json(fail("개인정보 수집·이용 동의가 필요합니다."), {
        status: 400,
      });

    const summary = [
      "[재택알바문의]",
      ageRange ? `나이대: ${ageRange}` : null,
      availability ? `희망시간: ${availability}` : null,
      categorySlug ? `관심업무: ${categorySlug}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    const content = note ? `${summary}\n\n${note}` : summary;

    const member = getCurrentMember();
    const id = insertInquiry({
      member_id: member?.id ?? null,
      name,
      phone,
      email: null,
      // 카테고리 검증을 피하기 위해 category_slug는 저장하지 않음.
      // (알바 카테고리는 상담 분야 목록과 별도라서 categories 테이블에 존재하지 않음)
      category_slug: null,
      content,
      source: "재택알바문의",
    });

    notifyNewInquiry({
      id,
      name,
      phone,
      email: null,
      category_slug: `재택알바 · ${categorySlug || "미정"}`,
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
