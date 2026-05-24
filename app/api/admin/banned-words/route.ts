import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { addBannedWord, deleteBannedWord } from "@/lib/db";
import { fail, ok, sanitize } from "@/lib/sanitize";

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
    const word = sanitize(body.word, 100);
    const note = sanitize(body.note, 300);
    if (!word)
      return NextResponse.json(fail("금지어를 입력해 주세요."), { status: 400 });
    addBannedWord(word, note || undefined);
    return NextResponse.json(ok());
  } catch (err) {
    console.error("[admin/banned POST] error:", err);
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
    deleteBannedWord(id);
    return NextResponse.json(ok());
  } catch (err) {
    console.error("[admin/banned DELETE] error:", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}
