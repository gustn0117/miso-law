import type { Short } from "@/lib/db-types";
import {
  extractYouTubeId,
  extractYouTubePlaylistId,
  buildYouTubeEmbedUrl,
} from "@/lib/embed";

const FILL_STYLE = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
} as const;

/**
 * 쇼츠 한 장 렌더링 — 쇼츠 페이지와 사례 상세의 "관련 쇼츠"가 공용으로 사용.
 * 1) 자체 호스팅 영상(video_path) → <video>로 사이트 내 재생
 * 2) YouTube URL → iframe으로 사이트 내 재생
 * 3) 그 외 외부 URL → 새 창 링크 (fallback)
 */
export default function ShortCard({ short: s }: { short: Short }) {
  // 1) 업로드 영상
  if (s.video_path) {
    return (
      <div className="short-card">
        <div className="short-thumb">
          <video
            src={s.video_path}
            poster={s.thumbnail_url || undefined}
            controls
            preload="metadata"
            playsInline
            style={{
              ...FILL_STYLE,
              objectFit: "cover",
              background: "rgb(var(--c-fg))",
            }}
          />
        </div>
        <div className="body">{s.title}</div>
      </div>
    );
  }

  // 2) YouTube
  const ytId = extractYouTubeId(s.url);
  if (ytId) {
    const src = buildYouTubeEmbedUrl(ytId, extractYouTubePlaylistId(s.url));
    return (
      <div className="short-card">
        <div className="short-thumb">
          <iframe
            src={src}
            title={s.title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ ...FILL_STYLE, border: 0 }}
          />
        </div>
        <div className="body">{s.title}</div>
      </div>
    );
  }

  // 3) 그 외 외부 URL → 새 창
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className="short-card"
    >
      <div className="short-thumb">
        {s.thumbnail_url ? (
          <img src={s.thumbnail_url} alt="" loading="lazy" />
        ) : (
          <span style={{ position: "relative", zIndex: 1 }}>{s.title}</span>
        )}
        <span className="play" aria-hidden>
          ▶
        </span>
      </div>
      <div className="body">{s.title}</div>
    </a>
  );
}
