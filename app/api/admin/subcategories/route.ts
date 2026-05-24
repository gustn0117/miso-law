import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { getDb, listCategories } from "@/lib/db";
import { fail, ok, sanitize } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

function guard() {
  if (!isAdmin()) return NextResponse.json(fail("인증이 필요합니다."), { status: 401 });
  return null;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export async function POST(req: NextRequest) {
  const g = guard();
  if (g) return g;
  try {
    const body = await req.json();
    const category_id = Number(body.category_id);
    const name = sanitize(body.name, 50);
    const slugInput = sanitize(body.slug, 60);
    const slug = slugInput || slugify(name);
    if (!Number.isInteger(category_id) || category_id <= 0)
      return NextResponse.json(fail("카테고리를 선택해 주세요."), { status: 400 });
    if (!listCategories().some((c) => c.id === category_id))
      return NextResponse.json(fail("존재하지 않는 카테고리"), { status: 400 });
    if (!name) return NextResponse.json(fail("이름을 입력해 주세요."), { status: 400 });
    if (!slug) return NextResponse.json(fail("slug 생성 실패"), { status: 400 });
    try {
      const r = getDb()
        .prepare(
          "INSERT INTO subcategories(category_id, slug, name, sort_order) VALUES (?, ?, ?, COALESCE((SELECT MAX(sort_order)+1 FROM subcategories WHERE category_id=?), 0))",
        )
        .run(category_id, slug, name, category_id);
      return NextResponse.json(ok({ id: Number(r.lastInsertRowid) }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("UNIQUE"))
        return NextResponse.json(fail("같은 slug가 이미 있습니다."), {
          status: 409,
        });
      throw e;
    }
  } catch (err) {
    console.error("[admin/sub POST] error:", err);
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
    getDb().prepare("DELETE FROM subcategories WHERE id = ?").run(id);
    return NextResponse.json(ok());
  } catch (err) {
    console.error("[admin/sub DELETE] error:", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}
