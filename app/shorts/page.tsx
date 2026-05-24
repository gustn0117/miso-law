import SiteLayout from "../components/SiteLayout";
import { listShorts } from "@/lib/db";
import LegalNotice from "../components/LegalNotice";

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
            {shorts.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="short-card"
              >
                <div className="short-thumb">
                  {s.thumbnail_url ? (
                    <img src={s.thumbnail_url} alt="" />
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
            ))}
          </div>
        )}
        <LegalNotice />
      </div>
    </SiteLayout>
  );
}
