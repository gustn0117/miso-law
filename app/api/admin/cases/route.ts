import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import {
  deleteCase,
  insertCase,
  listCategories,
  listSubcategories,
  updateCase,
} from "@/lib/db";
import { fail, ok, sanitize, sanitizeMultiline } from "@/lib/sanitize";

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
    const category_id = Number(body.category_id);
    if (!Number.isInteger(category_id) || category_id <= 0)
      return NextResponse.json(fail("카테고리를 선택해 주세요."), {
        status: 400,
      });
    if (!listCategories().some((c) => c.id === category_id))
      return NextResponse.json(fail("존재하지 않는 카테고리"), {
        status: 400,
      });
    const subRaw = body.subcategory_id;
    let subcategory_id: number | null = null;
    if (subRaw !== undefined && subRaw !== null && subRaw !== "") {
      const sid = Number(subRaw);
      if (!Number.isInteger(sid) || sid <= 0)
        return NextResponse.json(fail("잘못된 중분류"), { status: 400 });
      if (!listSubcategories(category_id).some((s) => s.id === sid))
        return NextResponse.json(fail("해당 카테고리의 중분류가 아닙니다."), {
          status: 400,
        });
      subcategory_id = sid;
    }
    const title = sanitize(body.title, 200);
    const excerpt = sanitize(body.excerpt, 400);
    const body_text = sanitizeMultiline(body.body, 20000);
    const published = body.published === false ? 0 : 1;
    if (!title)
      return NextResponse.json(fail("제목을 입력해 주세요."), { status: 400 });
    if (!body_text)
      return NextResponse.json(fail("본문을 입력해 주세요."), { status: 400 });
    const id = insertCase({
      category_id,
      subcategory_id,
      title,
      excerpt: excerpt || null,
      body: body_text,
      published,
    });
    return NextResponse.json(ok({ id }));
  } catch (err) {
    console.error("[admin/cases POST] error:", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const g = guard();
  if (g) return g;
  try {
    const body = await req.json();
    const id = Number(body.id);
    if (!Number.isInteger(id) || id <= 0)
      return NextResponse.json(fail("잘못된 ID"), { status: 400 });
    const patch: Parameters<typeof updateCase>[1] = {};
    if (body.title !== undefined) patch.title = sanitize(body.title, 200);
    if (body.excerpt !== undefined)
      patch.excerpt = sanitize(body.excerpt, 400) || null;
    if (body.body !== undefined)
      patch.body = sanitizeMultiline(body.body, 20000);
    if (body.published !== undefined)
      patch.published = body.published ? 1 : 0;
    if (body.category_id !== undefined) {
      const cid = Number(body.category_id);
      if (Number.isInteger(cid) && cid > 0) patch.category_id = cid;
    }
    if (body.subcategory_id !== undefined) {
      if (body.subcategory_id === null || body.subcategory_id === "") {
        patch.subcategory_id = null;
      } else {
        const sid = Number(body.subcategory_id);
        if (Number.isInteger(sid) && sid > 0) patch.subcategory_id = sid;
      }
    }
    updateCase(id, patch);
    return NextResponse.json(ok());
  } catch (err) {
    console.error("[admin/cases PATCH] error:", err);
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
    deleteCase(id);
    return NextResponse.json(ok());
  } catch (err) {
    console.error("[admin/cases DELETE] error:", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}
