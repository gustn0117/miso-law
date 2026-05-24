import { NextRequest, NextResponse } from "next/server";
import { insertInquiry, listCategories } from "@/lib/db";
import { sanitize, sanitizeMultiline, fail, ok } from "@/lib/sanitize";
import {
  getCurrentMember,
  isValidEmail,
  isValidPhone,
  normalizePhone,
} from "@/lib/auth";
import { notifyNewInquiry } from "@/lib/notify";

export const dynamic = "force-dynamic";

const ALLOWED_SOURCES = [
  "검색",
  "카페",
  "블로그",
  "지인추천",
  "SNS",
  "유튜브",
  "기타",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = sanitize(body.name, 30);
    const phoneRaw = sanitize(body.phone, 30);
    const phone = normalizePhone(phoneRaw);
    const email = sanitize(body.email, 100);
    const category_slug = sanitize(body.category_slug, 50);
    const content = sanitizeMultiline(body.content, 4000);
    const sourceRaw = sanitize(body.source, 40);
    const source =
      sourceRaw && ALLOWED_SOURCES.includes(sourceRaw) ? sourceRaw : sourceRaw || null;
    const agree = !!body.agree;

    // ---- 검증 ----
    if (!name) return NextResponse.json(fail("이름을 입력해 주세요."), { status: 400 });
    if (!phone || !isValidPhone(phone))
      return NextResponse.json(fail("올바른 휴대폰 번호를 입력해 주세요."), {
        status: 400,
      });
    if (!email)
      return NextResponse.json(fail("이메일을 입력해 주세요."), { status: 400 });
    if (!isValidEmail(email))
      return NextResponse.json(fail("올바른 이메일 형식이 아닙니다."), {
        status: 400,
      });
    if (!category_slug)
      return NextResponse.json(fail("상담 분야를 선택해 주세요."), {
        status: 400,
      });
    const cats = listCategories();
    if (!cats.some((c) => c.slug === category_slug))
      return NextResponse.json(fail("올바르지 않은 상담 분야입니다."), {
        status: 400,
      });
    if (!content || content.trim().length < 5)
      return NextResponse.json(fail("상담 내용을 5자 이상 입력해 주세요."), {
        status: 400,
      });
    if (!agree)
      return NextResponse.json(fail("개인정보 수집·이용 동의가 필요합니다."), {
        status: 400,
      });

    const member = getCurrentMember();
    const id = insertInquiry({
      member_id: member?.id ?? null,
      name,
      phone,
      email,
      category_slug,
      content,
      source: source || null,
    });

    // 알림 (SMTP 미설정 시 조용히 스킵)
    notifyNewInquiry({
      id,
      name,
      phone,
      email,
      category_slug,
      content,
      source,
    }).catch((e) => console.error("[inquiries] notify failed:", e));

    return NextResponse.json(ok({ id }));
  } catch (err) {
    console.error("[inquiries] insert error:", err);
    return NextResponse.json(
      fail("서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."),
      { status: 500 },
    );
  }
}
