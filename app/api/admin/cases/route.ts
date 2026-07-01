import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-guard";
import {
  deleteCase,
  insertCase,
  listCategories,
  listSubcategories,
  updateCase,
} from "@/lib/db";
import { fail, ok, sanitize, sanitizeMultiline, sanitizeUrl } from "@/lib/sanitize";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads", "cases");
const ALLOWED_IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_IMG_BYTES = 5 * 1024 * 1024; // 5MB

function guard() {
  if (!isAdmin())
    return NextResponse.json(fail("인증이 필요합니다."), { status: 401 });
  return null;
}

async function saveImage(file: File): Promise<string> {
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_IMG_EXT.has(ext)) {
    throw new Error("지원하지 않는 이미지 형식입니다. (jpg/png/webp만 가능)");
  }
  if (file.size > MAX_IMG_BYTES) {
    throw new Error("이미지는 5MB 이하여야 합니다.");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${crypto.randomUUID()}${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buf);
  return `/api/uploads/cases/${filename}`;
}

async function handleMultipart(req: NextRequest) {
  const form = await req.formData();
  const category_id = Number(form.get("category_id"));
  if (!Number.isInteger(category_id) || category_id <= 0)
    return NextResponse.json(fail("카테고리를 선택해 주세요."), { status: 400 });
  if (!listCategories().some((c) => c.id === category_id))
    return NextResponse.json(fail("존재하지 않는 카테고리"), { status: 400 });

  let subcategory_id: number | null = null;
  const subRaw = form.get("subcategory_id");
  if (subRaw && subRaw !== "") {
    const sid = Number(subRaw);
    if (Number.isInteger(sid) && sid > 0) {
      if (listSubcategories(category_id).some((s) => s.id === sid))
        subcategory_id = sid;
    }
  }

  const title = sanitize(String(form.get("title") ?? ""), 200);
  const excerpt = sanitize(String(form.get("excerpt") ?? ""), 400);
  const body_text = sanitizeMultiline(String(form.get("body") ?? ""), 20000);
  const published = form.get("published") === "0" ? 0 : 1;
  if (!title)
    return NextResponse.json(fail("제목을 입력해 주세요."), { status: 400 });
  if (!body_text)
    return NextResponse.json(fail("본문을 입력해 주세요."), { status: 400 });

  // 우선순위: 파일 업로드 > URL 입력
  let image_url: string | null = null;
  const imgEntry = form.get("image_file");
  if (imgEntry && imgEntry instanceof File && imgEntry.size > 0) {
    try {
      image_url = await saveImage(imgEntry);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "이미지 업로드 실패";
      return NextResponse.json(fail(msg), { status: 400 });
    }
  } else {
    const urlField = sanitizeUrl(String(form.get("image_url") ?? ""), 500);
    image_url = urlField || null;
  }

  const case_no = sanitize(String(form.get("case_no") ?? ""), 120);
  const case_url = sanitizeUrl(String(form.get("case_url") ?? ""), 500);
  const result = sanitize(String(form.get("result") ?? ""), 40);

  const id = insertCase({
    category_id,
    subcategory_id,
    title,
    excerpt: excerpt || null,
    body: body_text,
    image_url,
    case_no: case_no || null,
    case_url: case_url || null,
    result: result || null,
    published,
  });
  return NextResponse.json(ok({ id, image_url }));
}

async function handleJson(req: NextRequest) {
  const body = await req.json();
  const category_id = Number(body.category_id);
  if (!Number.isInteger(category_id) || category_id <= 0)
    return NextResponse.json(fail("카테고리를 선택해 주세요."), { status: 400 });
  if (!listCategories().some((c) => c.id === category_id))
    return NextResponse.json(fail("존재하지 않는 카테고리"), { status: 400 });
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
  const image_url = sanitizeUrl(body.image_url, 500);
  const case_no = sanitize(body.case_no, 120);
  const case_url = sanitizeUrl(body.case_url, 500);
  const result = sanitize(body.result, 40);
  const id = insertCase({
    category_id,
    subcategory_id,
    title,
    excerpt: excerpt || null,
    body: body_text,
    image_url: image_url || null,
    case_no: case_no || null,
    case_url: case_url || null,
    result: result || null,
    published,
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
    if (body.image_url !== undefined) {
      patch.image_url = sanitizeUrl(body.image_url, 500) || null;
    }
    if (body.case_no !== undefined) {
      patch.case_no = sanitize(body.case_no, 120) || null;
    }
    if (body.case_url !== undefined) {
      patch.case_url = sanitizeUrl(body.case_url, 500) || null;
    }
    if (body.result !== undefined) {
      patch.result = sanitize(body.result, 40) || null;
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
