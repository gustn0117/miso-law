import { NextRequest, NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/auth";
import { deleteReview, insertReview } from "@/lib/db";
import { fail, ok, sanitize } from "@/lib/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const member = getCurrentMember();
  if (!member) {
    return NextResponse.json(
      fail("로그인 후 작성하실 수 있습니다."),
      { status: 401 },
    );
  }

  let body: { title?: unknown; content?: unknown; rating?: unknown; category_slug?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(fail("잘못된 요청입니다."), { status: 400 });
  }

  const title = sanitize(String(body.title ?? ""), 80);
  const content = sanitize(String(body.content ?? ""), 4000);
  if (!title) {
    return NextResponse.json(fail("제목을 입력해 주세요."), { status: 400 });
  }
  if (content.length < 10) {
    return NextResponse.json(
      fail("내용은 10자 이상 입력해 주세요."),
      { status: 400 },
    );
  }

  const rating = Number(body.rating);
  const categorySlugRaw = body.category_slug;
  const category_slug =
    typeof categorySlugRaw === "string" && categorySlugRaw.length <= 40
      ? categorySlugRaw
      : null;

  try {
    const id = insertReview({
      member_id: member.id,
      title,
      content,
      rating: Number.isFinite(rating) ? rating : 5,
      category_slug,
    });
    return NextResponse.json(ok({ id }));
  } catch (err) {
    console.error("[/api/reviews POST]", err);
    return NextResponse.json(fail("서버 오류"), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const member = getCurrentMember();
  if (!member) {
    return NextResponse.json(fail("로그인이 필요합니다."), { status: 401 });
  }
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(fail("잘못된 ID"), { status: 400 });
  }
  // 본인 글만 삭제 가능
  const removed = deleteReview(id, member.id);
  if (!removed) {
    return NextResponse.json(
      fail("삭제 권한이 없거나 이미 삭제되었습니다."),
      { status: 403 },
    );
  }
  return NextResponse.json(ok());
}
