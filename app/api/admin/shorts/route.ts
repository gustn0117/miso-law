import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import { deleteShort, insertShort, listCategories } from "@/lib/db";
import { fail, ok, sanitize, sanitizeUrl } from "@/lib/sanitize";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads", "shorts");
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_BYTES = 2 * 1024 * 1024; // 2MB

function guard() {
  if (!isAdmin())
    return NextResponse.json(fail("인증이 필요합니다."), { status: 401 });
  return null;
}

async function saveThumbnail(file: File): Promise<string> {
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    throw new Error("지원하지 않는 이미지 형식입니다. (jpg/png/webp만 가능)");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("이미지는 2MB 이하여야 합니다.");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${crypto.randomUUID()}${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buf);
  return `/api/uploads/shorts/${filename}`;
}

async function handleMultipart(req: NextRequest) {
  const form = await req.formData();
  const title = sanitize(String(form.get("title") ?? ""), 200);
  const url = sanitizeUrl(String(form.get("url") ?? ""), 500);
  if (!title)
    return NextResponse.json(fail("제목을 입력해 주세요."), { status: 400 });
  if (!url)
    return NextResponse.json(fail("유효한 URL을 입력해 주세요. (http/https)"), {
      status: 400,
    });

  let category_id: number | null = null;
  const catRaw = form.get("category_id");
  if (catRaw) {
    const cid = Number(catRaw);
    if (Number.isInteger(cid) && cid > 0) {
      if (listCategories().some((c) => c.id === cid)) category_id = cid;
    }
  }

  // 우선순위: 파일 업로드 > URL 입력
  let thumbnail_url: string | null = null;
  const fileEntry = form.get("thumbnail_file");
  if (fileEntry && fileEntry instanceof File && fileEntry.size > 0) {
    try {
      thumbnail_url = await saveThumbnail(fileEntry);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "이미지 업로드 실패";
      return NextResponse.json(fail(msg), { status: 400 });
    }
  } else {
    const urlField = sanitizeUrl(String(form.get("thumbnail_url") ?? ""), 500);
    thumbnail_url = urlField || null;
  }

  const sortRaw = form.get("sort_order");
  const sort_order = Number.isFinite(Number(sortRaw)) ? Number(sortRaw) : 0;

  const id = insertShort({
    category_id,
    title,
    url,
    thumbnail_url,
    sort_order,
  });
  return NextResponse.json(ok({ id, thumbnail_url }));
}

async function handleJson(req: NextRequest) {
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
}

export async function POST(req: NextRequest) {
  const g = guard();
  if (g) return g;
  try {
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("multipart/form-data")) {
      return await handleMultipart(req);
    }
    return await handleJson(req);
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
