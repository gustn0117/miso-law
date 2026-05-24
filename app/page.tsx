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
    getSetting("money_banner_title") ||
    "금전 문제로 막막하시다면 — 무료 상담";
  const bannerDesc =
    getSetting("money_banner_desc") || "회생/파산·압류·채무조정 등 상황별 안내";

  return (
    <SiteLayout>
      {/* Hero — Deep Navy */}
      <section className="ai-search-wrap">
        <div
          className="container"
          style={{ paddingTop: 56, paddingBottom: 52 }}
        >
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(201, 151, 42, 0.18)",
                border: "1px solid rgba(201, 151, 42, 0.35)",
                color: "#f0c96a",
                padding: "5px 14px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                marginBottom: 20,
                textTransform: "uppercase",
              }}
            >
              AI 법률 안내 서비스
            </div>
            <h1
              style={{
                fontSize: "clamp(26px, 5vw, 38px)",
                margin: "0 0 12px",
                color: "#ffffff",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
              }}
            >
              어떤 고민이 있으신가요?
            </h1>
            <p
              style={{
                margin: 0,
                color: "rgba(255, 255, 255, 0.65)",
                fontSize: 15,
                lineHeight: 1.7,
                fontWeight: 400,
              }}
            >
              사기·형사·음주운전·보이스피싱·민사·회생/파산·이혼·노동까지
              <br />
              상황을 입력하시면 AI가 1차 안내와 함께 관련 사례를 보여드립니다.
            </p>
          </div>
          <AISearchBox autoFocus />

          {/* Trust bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 40,
              marginTop: 36,
              flexWrap: "wrap",
              borderTop: "1px solid rgba(255,255,255,0.12)",
              paddingTop: 28,
            }}
          >
            {[
              { label: "누적 상담", value: "12,000+" },
              { label: "전문 분야", value: "8개" },
              { label: "응답 시간", value: "24시간 이내" },
            ].map((item) => (
              <div
                key={item.label}
                style={{ textAlign: "center" }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#fff",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                  }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    marginTop: 4,
                    color: "rgba(255,255,255,0.55)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 머니 배너 + 빠른 메뉴 */}
      <section className="container" style={{ paddingTop: 32 }}>
        <MoneyBanner title={bannerTitle} desc={bannerDesc} />
        <div style={{ marginTop: 16 }}>
          <QuickMenu
            items={[
              { href: cafeUrl, label: "카페 바로가기", emoji: "💬", external: true },
              { href: shortsUrl, label: "쇼츠 보기", emoji: "🎬", external: true },
              { href: "/cases", label: "사건/사고", emoji: "📚" },
              { href: "/category/recovery", label: "금전상담", emoji: "💰" },
            ]}
          />
        </div>
      </section>

      {/* 대분류 카테고리 */}
      <section className="container" style={{ paddingTop: 48 }}>
        <div className="section-head">
          <div>
            <h2>분야별 상담</h2>
            <p
              style={{
                margin: "5px 0 0",
                color: "var(--ink-mute)",
                fontSize: 14,
              }}
            >
              상황에 맞는 카테고리를 선택하시면 관련 사례와 안내를 보실 수 있습니다.
            </p>
          </div>
        </div>
        <CategoryGrid categories={categories} />
      </section>

      {/* 최근 사례 */}
      {recentCases.length > 0 && (
        <section className="container" style={{ paddingTop: 48 }}>
          <div className="section-head">
            <h2>최근 사례</h2>
            <Link href="/cases" className="more">
              전체 보기 →
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
        </section>
      )}

      {/* 쇼츠 */}
      {shorts.length > 0 && (
        <section className="container" style={{ paddingTop: 48 }}>
          <div className="section-head">
            <h2>1분 쇼츠</h2>
            <Link href="/shorts" className="more">
              전체 보기 →
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
                    style={{ position: "relative", zIndex: 1, padding: "0 8px" }}
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
        </section>
      )}

      <section className="container" style={{ paddingTop: 32, paddingBottom: 16 }}>
        <LegalNotice />
      </section>
    </SiteLayout>
  );
}
