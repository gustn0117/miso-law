import { NextResponse } from "next/server";
import { chatWithAI, type ChatMessage } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { messages } = body as { messages?: unknown };

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "messages 배열이 필요합니다" },
      { status: 400 },
    );
  }

  const sanitized: ChatMessage[] = [];
  for (const m of messages) {
    if (!m || typeof m !== "object") continue;
    const obj = m as Record<string, unknown>;
    if (
      (obj.role === "user" || obj.role === "assistant") &&
      typeof obj.content === "string" &&
      obj.content.trim().length > 0 &&
      obj.content.length < 4000
    ) {
      sanitized.push({
        role: obj.role,
        content: obj.content.trim().slice(0, 4000),
      });
    }
  }

  if (sanitized.length === 0) {
    return NextResponse.json(
      { error: "유효한 메시지가 없습니다" },
      { status: 400 },
    );
  }

  if (sanitized[sanitized.length - 1].role !== "user") {
    return NextResponse.json(
      { error: "마지막 메시지는 user여야 합니다" },
      { status: 400 },
    );
  }

  try {
    const result = await chatWithAI(sanitized);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/chat]", err);
    return NextResponse.json(
      { error: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
