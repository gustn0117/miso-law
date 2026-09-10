import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { setSetting } from "@/lib/db";
import { fail, ok, sanitize } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

const ALLOWED_KEYS = new Set([
  "cafe_url",
  "shorts_url",
  "kakao_url",
  "money_banner_title",
  "money_banner_desc",
  "sms_notify_to",
]);

// "010-1111-2222, 01033334444" → "01011112222,01033334444". 형식 오류 시 null
function normalizeSmsRecipients(raw: string): string | null {
  const nums = raw
    .split(",")
    .map((s) => s.replace(/[^0-9]/g, ""))
    .filter(Boolean);
  if (nums.some((n) => !/^01[016789]\d{7,8}$/.test(n))) return null;
  return Array.from(new Set(nums)).join(",");
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin())
    return NextResponse.json(fail("인증이 필요합니다."), { status: 401 });
  try {
    const body = await req.json();
    if (!body || typeof body !== "object")
      return NextResponse.json(fail("잘못된 요청"), { status: 400 });
    // 전부 검증한 뒤 저장 — 일부만 저장되는 상황 방지
    const updates: [string, string][] = [];
    for (const [k, v] of Object.entries(body)) {
      if (!ALLOWED_KEYS.has(k)) continue;
      let value = sanitize(v, 500);
      if (k === "sms_notify_to") {
        const normalized = normalizeSmsRecipients(value);
        if (normalized === null)
          return NextResponse.json(
            fail("문자 알림 번호는 휴대폰 번호(콤마로 여러 개)로 입력해 주세요."),
            { status: 400 },
          );
        value = normalized;
      }
      updates.push([k, value]);
    }
    for (const [k, value] of updates) setSetting(k, value);
    return NextResponse.json(ok());
  } catch (err) {
    console.error("[admin/settings PATCH] error:", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}
