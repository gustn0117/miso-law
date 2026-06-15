import { NextRequest } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VIDEO_DIR = path.join(process.cwd(), "data", "uploads", "shorts", "videos");
const SAFE_FILENAME = /^[a-zA-Z0-9_-]+\.(mp4|webm|mov|m4v)$/i;
const MIME: Record<string, string> = {
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

/**
 * 영상 스트리밍 — Range 헤더 지원 (필수: <video> 태그가 seek 동작 위해 Range 요청)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } },
) {
  const { filename } = params;
  if (!SAFE_FILENAME.test(filename)) {
    return new Response("Bad filename", { status: 400 });
  }
  const filepath = path.normalize(path.join(VIDEO_DIR, filename));
  if (!filepath.startsWith(VIDEO_DIR + path.sep)) {
    return new Response("Forbidden", { status: 403 });
  }

  let fileStat;
  try {
    fileStat = await stat(filepath);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(filename).toLowerCase();
  const mime = MIME[ext] || "application/octet-stream";
  const total = fileStat.size;
  const range = req.headers.get("range");

  // Range 요청 — partial content (HTTP 206)
  if (range) {
    const m = /bytes=(\d+)-(\d*)/.exec(range);
    if (m) {
      const start = Number(m[1]);
      const end = m[2] ? Math.min(Number(m[2]), total - 1) : total - 1;
      if (start <= end && start < total) {
        const chunkSize = end - start + 1;
        const stream = createReadStream(filepath, { start, end });
        return new Response(stream as unknown as ReadableStream, {
          status: 206,
          headers: {
            "Content-Type": mime,
            "Content-Length": String(chunkSize),
            "Content-Range": `bytes ${start}-${end}/${total}`,
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }
  }

  // 전체 파일 (Range 없음) — 200 OK
  const stream = createReadStream(filepath);
  return new Response(stream as unknown as ReadableStream, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Length": String(total),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
