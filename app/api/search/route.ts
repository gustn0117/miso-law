import { NextRequest, NextResponse } from "next/server";
import { answerQuery } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  const result = await answerQuery(q);
  return NextResponse.json({ ok: true, query: q, ...result });
}

export async function POST(req: NextRequest) {
  let q = "";
  try {
    const body = await req.json();
    q = String(body.q || "").trim();
  } catch {}
  const result = await answerQuery(q);
  return NextResponse.json({ ok: true, query: q, ...result });
}
