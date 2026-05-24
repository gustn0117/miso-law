import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { deleteShort, insertShort, listCategories } from "@/lib/db";
import { fail, ok, sanitize, sanitizeUrl } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

function guard() {
  if (!isAdmin()) return NextResponse.json(fail("인증이 필요합니다."), { status: 401 });
  return null;
}

export async function POST(req: NextRequest) {
  const g = guard();
  if (g) return g;
  try {
    const body = await req.json();
    const title = sanitize(body.title, 200);
    const url = sanitizeUrl(body.url, 500);
    if (!title)
      return NextResponse.json(fail("제목을 입력해 주세요."), { status: 400 });
    if (!url)
      return NextResponse.json(fail("유효한 URL을 입력해 주세요. (http/https)"), {
        status: 400,
      });
    let category_id: number | null = null;
    if (body.category_id) {
      const cid = Number(body.category_id);
      if (Number.isInteger(cid) && cid > 0) {
        if (listCategories().some((c) => c.id === cid)) category_id = cid;
      }
    }
    const thumb = sanitizeUrl(body.thumbnail_url, 500);
    const id = insertShort({
      category_id,
      title,
      url,
      thumbnail_url: thumb || null,
      sort_order: Number.isFinite(Number(body.sort_order))
        ? Number(body.sort_order)
        : 0,
    });
    return NextResponse.json(ok({ id }));
  } catch (err) {
    console.error("[admin/shorts POST] error:", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const g = guard();
  if (g) return g;
  try {
    const id = Number(req.nextUrl.searchParams.get("id"));
    if (!Number.isInteger(id) || id <= 0)
      return NextResponse.json(fail("잘못된 ID"), { status: 400 });
    deleteShort(id);
    return NextResponse.json(ok());
  } catch (err) {
    console.error("[admin/shorts DELETE] error:", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}
