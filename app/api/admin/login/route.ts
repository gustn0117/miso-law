import { NextRequest, NextResponse } from "next/server";
import { loginAdmin } from "@/lib/admin-guard";
import { fail, ok } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = String(body.password || "");
    if (!loginAdmin(password))
      return NextResponse.json(fail("비밀번호가 일치하지 않습니다."), {
        status: 401,
      });
    return NextResponse.json(ok());
  } catch {
    return NextResponse.json(fail("로그인 처리 오류"), { status: 500 });
  }
}
