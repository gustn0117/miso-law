import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { deleteAIAnswer, insertAIAnswer, updateAIAnswer } from "@/lib/db";
import { fail, ok, sanitize, sanitizeMultiline } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

function guard() {
  if (!isAdmin()) return NextResponse.json(fail("인증이 필요합니다."), { status: 401 });
  return null;
}

function parseBullets(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((s) => sanitize(s, 300))
      .filter((s) => s.length > 0)
      .slice(0, 10);
  }
  if (typeof input === "string") {
    return input
      .split("\n")
      .map((s) => s.replace(/^[-•\s]+/, "").trim())
      .filter((s) => s.length > 0)
      .slice(0, 10);
  }
  return [];
}

export async function POST(req: NextRequest) {
  const g = guard();
  if (g) return g;
  try {
    const body = await req.json();
    const keyword = sanitize(body.keyword, 80);
    const summary = sanitizeMultiline(body.summary, 1000);
    if (!keyword)
      return NextResponse.json(fail("키워드를 입력해 주세요."), { status: 400 });
    if (!summary)
      return NextResponse.json(fail("요약을 입력해 주세요."), { status: 400 });
    const bullets = parseBullets(body.bullets);
    const next_steps = parseBullets(body.next_steps);
    const priority = Number.isFinite(Number(body.priority))
      ? Number(body.priority)
      : 50;
    const id = insertAIAnswer({
      keyword,
      category_slug: sanitize(body.category_slug, 50) || null,
      summary,
      bullets,
      next_steps,
      priority,
    });
    return NextResponse.json(ok({ id }));
  } catch (err) {
    console.error("[admin/ai-answers POST] error:", err);
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
    const patch: Parameters<typeof updateAIAnswer>[1] = {};
    if (body.keyword !== undefined) patch.keyword = sanitize(body.keyword, 80);
    if (body.category_slug !== undefined)
      patch.category_slug = sanitize(body.category_slug, 50) || null;
    if (body.summary !== undefined)
      patch.summary = sanitizeMultiline(body.summary, 1000);
    if (body.bullets !== undefined) patch.bullets = parseBullets(body.bullets);
    if (body.next_steps !== undefined)
      patch.next_steps = parseBullets(body.next_steps);
    if (body.priority !== undefined) {
      const p = Number(body.priority);
      if (Number.isFinite(p)) patch.priority = p;
    }
    updateAIAnswer(id, patch);
    return NextResponse.json(ok());
  } catch (err) {
    console.error("[admin/ai-answers PATCH] error:", err);
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
    deleteAIAnswer(id);
    return NextResponse.json(ok());
  } catch (err) {
    console.error("[admin/ai-answers DELETE] error:", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}
