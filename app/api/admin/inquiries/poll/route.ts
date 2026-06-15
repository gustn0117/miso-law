import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { getLatestInquiryId, listInquiriesSince } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdmin()) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  const sinceRaw = req.nextUrl.searchParams.get("since");
  const since = sinceRaw ? Math.max(0, Number(sinceRaw) || 0) : 0;

  // since=0이면 (초기 호출) 새 항목 없이 latest만 반환 — 첫 진입 시 사운드 폭발 방지
  if (since === 0) {
    return NextResponse.json({
      ok: true,
      items: [],
      latestId: getLatestInquiryId(),
    });
  }

  const items = listInquiriesSince(since);
  return NextResponse.json({
    ok: true,
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      phone: i.phone,
      category_slug: i.category_slug,
      created_at: i.created_at,
    })),
    latestId: items.length > 0 ? items[0].id : since,
  });
}
