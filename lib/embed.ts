// 사례글 본문에서 YouTube URL 및 iframe HTML을 안전하게 임베드 처리.
// 관리자만 사례를 등록하지만, 계정 탈취 대비로 화이트리스트 호스트만 허용.

const YOUTUBE_ID_RE =
  /(?:youtube\.com\/(?:watch\?[^\s]*v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/i;

const ALLOWED_EMBED_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
  "player.vimeo.com",
  "vimeo.com",
  "tv.naver.com",
  "serviceapi.nmv.naver.com",
]);

export function extractYouTubeId(input: string): string | null {
  const m = input.match(YOUTUBE_ID_RE);
  return m?.[1] ?? null;
}

export function extractYouTubePlaylistId(input: string): string | null {
  const m = input.match(/[?&]list=([\w-]+)/);
  return m?.[1] ?? null;
}

export function buildYouTubeEmbedUrl(
  videoId: string,
  listId?: string | null,
): string {
  const params = new URLSearchParams();
  if (listId) params.set("list", listId);
  const q = params.toString();
  return `https://www.youtube.com/embed/${videoId}${q ? `?${q}` : ""}`;
}

function escapeAttr(s: string): string {
  return s.replace(
    /["'<>&]/g,
    (c) =>
      (
        ({
          '"': "&quot;",
          "'": "&#39;",
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
        }) as Record<string, string>
      )[c] ?? c,
  );
}

// 사용자가 <iframe ...> 태그를 그대로 붙여넣은 경우.
// src 호스트가 화이트리스트에 있을 때만 안전한 iframe으로 재구성.
export function sanitizePastedIframe(html: string): string | null {
  const iframeMatch = html.match(
    /<iframe[^>]*\s(?:src)=["']([^"']+)["'][^>]*>[\s\S]*?<\/iframe>/i,
  );
  if (!iframeMatch) return null;
  const src = iframeMatch[1];
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (!ALLOWED_EMBED_HOSTS.has(url.hostname)) return null;
  return renderSafeIframe(url.toString());
}

export function renderSafeIframe(src: string, title = "임베드 영상"): string {
  return (
    `<iframe src="${escapeAttr(src)}" ` +
    `title="${escapeAttr(title)}" ` +
    `loading="lazy" ` +
    `referrerpolicy="strict-origin-when-cross-origin" ` +
    `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ` +
    `allowfullscreen ` +
    `frameborder="0"></iframe>`
  );
}

// 블록이 실질적으로 URL 하나로만 구성됐는지 (예: 관리자가 유튜브 링크만 한 줄에 붙여넣기)
export function isBlockJustUrl(block: string): boolean {
  const trimmed = block.trim();
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  return tokens.length === 1 && /^https?:\/\/\S+$/i.test(trimmed);
}

export type EmbedResult =
  | { kind: "iframe"; html: string }
  | { kind: "youtube"; videoId: string; listId: string | null }
  | { kind: "none" };

// 블록 단위로 임베드 가능 여부 판정.
export function detectEmbed(block: string): EmbedResult {
  const trimmed = block.trim();

  // 1) 사용자가 <iframe> 태그를 그대로 붙여넣은 경우
  if (/<iframe[\s>]/i.test(trimmed)) {
    const safe = sanitizePastedIframe(trimmed);
    if (safe) return { kind: "iframe", html: safe };
  }

  // 2) 블록이 순수 URL이고 YouTube면 자동 임베드
  const isJustUrl = isBlockJustUrl(trimmed);
  const videoId = extractYouTubeId(trimmed);
  if (isJustUrl && videoId) {
    return {
      kind: "youtube",
      videoId,
      listId: extractYouTubePlaylistId(trimmed),
    };
  }

  return { kind: "none" };
}
