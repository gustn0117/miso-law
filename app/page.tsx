import SiteLayout from "./components/SiteLayout";
import AISearchBox from "./components/AISearchBox";
import CategoryGrid from "./components/CategoryGrid";
import MoneyBanner from "./components/MoneyBanner";
import QuickMenu from "./components/QuickMenu";
import LegalNotice from "./components/LegalNotice";
import Link from "next/link";
import {
  listCategories,
  listAllCases,
  listShorts,
  getSetting,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const categories = listCategories();
  const recentCases = listAllCases().slice(0, 4);
  const shorts = listShorts().slice(0, 4);
  const cafeUrl = getSetting("cafe_url") || "https://cafe.naver.com";
  const shortsUrl = getSetting("shorts_url") || "https://www.youtube.com";
  const bannerTitle =
    getSetting("money_banner_title") || "금전 문제, 혼자 고민하지 마세요.";
  const bannerDesc =
    getSetting("money_banner_desc") ||
    "회생, 파산, 채무조정까지 전문가가 도와드립니다.";

  return (
    <SiteLayout>
      {/* === Hero: Cinematic full-bleed === */}
      <section className="hero-cinematic">
        <div className="container">
          <div className="hero-eyebrow reveal">AI 법률 상담 · 2026</div>

          <h1 className="hero-headline reveal reveal-delay-1">
            법률 고민,
            <br />
            <span className="hero-headline-accent">AI가 먼저 듣습니다.</span>
          </h1>

          <p className="hero-subheadline reveal reveal-delay-2">
            사기·형사·민사·이혼·회생까지. 상황을 입력하면 카테고리에 맞춰 맞춤
            안내를 드립니다.
          </p>

          <div className="reveal reveal-delay-3">
            <AISearchBox autoFocus />
          </div>

          <div className="trust-section reveal reveal-delay-4">
            {[
              { value: "12,000+", label: "누적 상담" },
              { value: "8", label: "전문 분야" },
              { value: "24h", label: "평균 응답" },
            ].map((item) => (
              <div key={item.label} className="trust-item">
                <div className="trust-value">{item.value}</div>
                <div className="trust-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-scroll-cue" aria-hidden>
          <span>SCROLL</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </section>

      {/* === Quick Menu === */}
      <section className="container" style={{ paddingTop: 24 }}>
        <QuickMenu
          items={[
            {
              href: cafeUrl,
              label: "카페 바로가기",
              icon: "cafe",
              external: true,
            },
            {
              href: shortsUrl,
              label: "쇼츠 보기",
              icon: "shorts",
              external: true,
            },
            { href: "/cases", label: "사건/사고", icon: "cases" },
            { href: "/category/recovery", label: "금전상담", icon: "money" },
          ]}
        />
      </section>

      {/* === Category Section === */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>
              분야별 상담<span style={{ color: "var(--ink-mute)" }}>.</span>
            </h2>
            <p>상황에 맞는 카테고리를 선택하세요.</p>
          </div>
          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* === Money Banner === */}
      <section className="container" style={{ paddingBottom: 60 }}>
        <MoneyBanner title={bannerTitle} desc={bannerDesc} />
      </section>

      {/* === Recent Cases (Cinematic Dark) === */}
      {recentCases.length > 0 && (
        <section className="section section-dark">
          <div className="container">
            <div className="section-head">
              <h2>실제 상담 사례</h2>
              <p>해결로 이어진 케이스를 살펴보세요.</p>
              <Link href="/cases" className="more">
                전체 보기
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="case-list">
              {recentCases.map((c) => (
                <Link key={c.id} href={`/case/${c.id}`} className="case-card">
                  <div className="tag">사례 #{c.id}</div>
                  <div className="title">{c.title}</div>
                  <div className="excerpt">{c.excerpt}</div>
                  <div className="meta">
                    <span>조회 {c.view_count}</span>
                    <span>·</span>
                    <span>{c.created_at.slice(0, 10)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* === Shorts === */}
      {shorts.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2>1분 쇼츠</h2>
              <p>짧고 쉽게, 핵심만.</p>
              <Link href="/shorts" className="more">
                전체 보기
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
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
                    <span
                      style={{
                        position: "relative",
                        zIndex: 1,
                        padding: "0 8px",
                      }}
                    >
                      {s.title}
                    </span>
                    <span className="play" aria-hidden>
                      ▶
                    </span>
                  </div>
                  <div className="body">{s.title}</div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* === Legal Notice === */}
      <section>
        <LegalNotice />
      </section>
    </SiteLayout>
  );
}
