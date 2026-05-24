import SiteLayout from "./components/SiteLayout";
import AISearchBox from "./components/AISearchBox";
import CategoryGrid from "./components/CategoryGrid";
import MoneyBanner from "./components/MoneyBanner";
import Counter from "./components/Counter";
import { ArrowRight, ArrowUpRight } from "./components/icons";
import Link from "next/link";
import {
  listCategories,
  listAllCases,
  listShorts,
  getSetting,
} from "@/lib/db";

export const dynamic = "force-dynamic";

function fmtDate(iso: string) {
  return iso.slice(0, 10).replace(/-/g, ".");
}

export default function HomePage() {
  const categories = listCategories();
  const recentCases = listAllCases().slice(0, 6);
  const shorts = listShorts().slice(0, 5);
  const bannerTitle =
    getSetting("money_banner_title") || "금전 문제, 혼자 고민하지 마세요.";
  const bannerDesc =
    getSetting("money_banner_desc") ||
    "회생, 파산, 채무조정까지 — 전문가가 처음부터 끝까지 함께합니다.";

  return (
    <SiteLayout>
      {/* =================================================================
          1. HERO — Full-bleed image, text bottom-left (guide §2-1, §6-1)
          ================================================================= */}
      <section className="hero">
        <div className="hero-top">
          <div className="w-wide">
            <div className="hero-top-row">
              <span className="ml">— Vol. 01 / 2026</span>
              <span className="rule line-in d-1" aria-hidden />
              <span className="ml">Miso Law · AI Legal Brief</span>
            </div>
          </div>
        </div>

        <div className="w-wide">
          <h1 className="hero-h1">
            <span className="line">
              <span className="mask"><span className="d-1">정리되지</span></span>{" "}
              <span className="mask"><span className="d-2">않은</span></span>
            </span>
            <span className="line ko">
              <span className="mask"><span className="d-3">법률 고민,</span></span>
            </span>
            <span className="line ko">
              <span className="mask"><span className="d-4">한 줄로 충분합니다.</span></span>
            </span>
          </h1>

          <div className="hero-deck fade d-5">
            <p className="hero-lede">
              사기·형사·민사·이혼·회생까지 — 복잡한 상황을 한 줄로 입력하면
              카테고리·핵심 포인트·다음 액션을 정리해 드리고, 분야 전문 상담으로
              안전하게 이어드립니다.
            </p>
            <div className="hero-actions">
              <Link href="/inquiry" className="btn btn-primary btn-lg">
                무료 상담 신청
                <span className="btn-icon"><ArrowRight size={18} /></span>
              </Link>
              <Link href="#stats" className="btn btn-lg">
                서비스 살펴보기
              </Link>
            </div>
          </div>
        </div>

        <div className="hero-scroll" aria-hidden>
          <span>SCROLL</span>
        </div>
      </section>

      {/* =================================================================
          2. COUNTER — Dark section with big stats (guide §8-6)
          ================================================================= */}
      <section className="sec sec-dark" id="stats">
        <div className="w-default">
          <div className="counter-grid">
            <div className="counter-intro">
              <h2>
                AI가 먼저 듣고, 사람이 정리합니다.
              </h2>
              <p>
                자동 응답이 아닌, 운영자가 확인 후 영업일 기준 평균 24시간 안에
                회신을 드립니다.
              </p>
            </div>

            <div className="counter-list">
              <div className="counter-cell">
                <span className="counter-num">
                  <Counter end={12000} suffix="+" />
                </span>
                <span className="counter-label">누적 상담</span>
              </div>
              <div className="counter-cell">
                <span className="counter-num">
                  <Counter end={8} format="padStart" padLength={2} />
                </span>
                <span className="counter-label">전문 분야</span>
              </div>
              <div className="counter-cell">
                <span className="counter-num">
                  <Counter end={24} format="none" />h
                </span>
                <span className="counter-label">평균 응답</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          3. SEARCH BAND — Light section, the actual action
          ================================================================= */}
      <section className="sec">
        <div className="w-default">
          <header className="sec-head">
            <h2>한 줄로 시작</h2>
            <span className="sec-num">— Step 01</span>
          </header>
          <AISearchBox />
        </div>
      </section>

      {/* =================================================================
          4. PRACTICE INDEX — Light section, list (guide §8-4)
          ================================================================= */}
      <section className="sec">
        <div className="w-default">
          <header className="sec-head">
            <h2>분야</h2>
            <span className="sec-num">N° 01 — N° {String(categories.length).padStart(2, "0")}</span>
          </header>

          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* =================================================================
          5. NOTICE — Quiet statement
          ================================================================= */}
      <div className="w-default">
        <MoneyBanner title={bannerTitle} desc={bannerDesc} />
      </div>

      {/* =================================================================
          6. CASES — Dark section, file index
          ================================================================= */}
      {recentCases.length > 0 && (
        <section className="sec sec-dark">
          <div className="w-default">
            <header className="sec-head">
              <h2>최근 사례</h2>
              <Link href="/cases" className="more">
                전체 보기 <ArrowRight size={14} />
              </Link>
            </header>

            <ul className="case-index" role="list">
              {recentCases.map((c) => (
                <li key={c.id}>
                  <Link href={`/case/${c.id}`} className="case-row">
                    <div className="case-meta-col">
                      <span className="case-date">{fmtDate(c.created_at)}</span>
                      <span className="case-tag">사례 N° {String(c.id).padStart(3, "0")}</span>
                    </div>
                    <h3 className="case-title">{c.title}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* =================================================================
          7. SHORTS — Light section
          ================================================================= */}
      {shorts.length > 0 && (
        <section className="sec">
          <div className="w-default">
            <header className="sec-head">
              <h2>쇼츠</h2>
              <Link href="/shorts" className="more">
                전체 보기 <ArrowRight size={14} />
              </Link>
            </header>

            <ol className="shorts-list">
              {shorts.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="short-row"
                  >
                    <span className="short-num">N° {String(i + 1).padStart(2, "0")}</span>
                    <span className="short-title">{s.title}</span>
                    <span className="short-runtime">
                      01:00 <ArrowUpRight size={12} />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* =================================================================
          8. FINAL — Dark section, single statement
          ================================================================= */}
      <section className="final sec-dark" style={{ borderTopColor: "rgb(var(--c-bg) / 0.2)" }}>
        <div className="w-default">
          <h2 className="final-h" style={{ color: "rgb(var(--c-bg))" }}>
            먼저 들어드리겠습니다.
          </h2>
          <div className="final-actions">
            <Link
              href="/inquiry"
              className="btn btn-lg"
              style={{
                background: "rgb(var(--c-bg))",
                color: "rgb(var(--c-fg))",
                borderColor: "rgb(var(--c-bg))",
              }}
            >
              무료 상담 신청
              <span className="btn-icon"><ArrowRight size={18} /></span>
            </Link>
            <Link
              href="/search"
              className="btn btn-lg"
              style={{
                background: "transparent",
                color: "rgb(var(--c-bg))",
                borderColor: "rgb(var(--c-bg) / 0.4)",
              }}
            >
              AI에게 먼저 묻기
            </Link>
            <span className="final-fine" style={{ color: "rgb(var(--c-bg) / 0.5)" }}>
              무료 · 익명 가능 · 1분
            </span>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
