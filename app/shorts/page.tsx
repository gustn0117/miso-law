import SiteLayout from "../components/SiteLayout";
import { listShorts } from "@/lib/db";
import LegalNotice from "../components/LegalNotice";
import {
  extractYouTubeId,
  extractYouTubePlaylistId,
  buildYouTubeEmbedUrl,
} from "@/lib/embed";

export const dynamic = "force-dynamic";

export default function ShortsPage() {
  const shorts = listShorts();

  return (
    <SiteLayout>
      <div className="page-head is-hero page-head--docs">
        <div className="container">
          <h1>1분 쇼츠</h1>
          <p>실제 사례·법률 상식을 짧고 빠르게.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 28 }}>
        {shorts.length === 0 ? (
          <div className="empty-state">
            아직 등록된 쇼츠가 없습니다. 관리자 페이지에서 영상을 등록해 주세요.
          </div>
        ) : (
          <div className="shorts-grid">
            {shorts.map((s) => {
              // 1) 자체 호스팅 영상 → <video>로 사이트 내 재생
              if (s.video_path) {
                return (
                  <div key={s.id} className="short-card">
                    <div className="short-thumb">
                      <video
                        src={s.video_path}
                        poster={s.thumbnail_url || undefined}
                        controls
                        preload="metadata"
                        playsInline
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          background: "rgb(var(--c-fg))",
                        }}
                      />
                    </div>
                    <div className="body">{s.title}</div>
                  </div>
                );
              }
              // 2) YouTube URL → iframe으로 사이트 내 재생 (새창 X)
              const ytId = extractYouTubeId(s.url);
              if (ytId) {
                const src = buildYouTubeEmbedUrl(
                  ytId,
                  extractYouTubePlaylistId(s.url),
                );
                return (
                  <div key={s.id} className="short-card">
                    <div className="short-thumb">
                      <iframe
                        src={src}
                        title={s.title}
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          border: 0,
                        }}
                      />
                    </div>
                    <div className="body">{s.title}</div>
                  </div>
                );
              }
              // 3) 그 외 외부 URL → 새 창 (기존 fallback 유지)
              return (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="short-card"
                >
                  <div className="short-thumb">
                    {s.thumbnail_url ? (
                      <img src={s.thumbnail_url} alt="" loading="lazy" />
                    ) : (
                      <span style={{ position: "relative", zIndex: 1 }}>
                        {s.title}
                      </span>
                    )}
                    <span className="play" aria-hidden>
                      ▶
                    </span>
                  </div>
                  <div className="body">{s.title}</div>
                </a>
              );
            })}
          </div>
        )}
        <LegalNotice />
      </div>
    </SiteLayout>
  );
}
