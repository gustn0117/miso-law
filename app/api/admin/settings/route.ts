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
]);

export async function PATCH(req: NextRequest) {
  if (!isAdmin())
    return NextResponse.json(fail("인증이 필요합니다."), { status: 401 });
  try {
    const body = await req.json();
    if (!body || typeof body !== "object")
      return NextResponse.json(fail("잘못된 요청"), { status: 400 });
    for (const [k, v] of Object.entries(body)) {
      if (!ALLOWED_KEYS.has(k)) continue;
      setSetting(k, sanitize(v, 500));
    }
    return NextResponse.json(ok());
  } catch (err) {
    console.error("[admin/settings PATCH] error:", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}
