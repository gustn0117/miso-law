import SiteLayout from "./components/SiteLayout";
import AISearchBox from "./components/AISearchBox";
import CategoryGrid from "./components/CategoryGrid";
import MobileConsultationHero from "./components/MobileConsultationHero";
import QuickMenu from "./components/QuickMenu";
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
  const cafeUrl =
    getSetting("cafe_url") ||
    "https://cafe.naver.com/MyCafeIntro.nhn?clubid=31738518";
  // 쇼츠는 내부 쇼츠 게시판으로 (사용자 요청 — 외부 블로그 연동 해제)

  return (
    <SiteLayout>
      {/* =================================================================
          1. HERO — Responsive consultation intake
          ================================================================= */}
      <section className="hero">
        <MobileConsultationHero />
      </section>

      {/* =================================================================
          1.5. QUICK MENU — 카페/쇼츠/사건사고/대출상담 (요청서 §2)
          ================================================================= */}
      <section className="sec-quick">
        <div className="w-default">
          <QuickMenu
            items={[
              { href: cafeUrl, label: "카페 바로가기", icon: "cafe", external: true },
              { href: "/shorts", label: "사건관련 쇼츠보기", icon: "shorts" },
              { href: "/reviews", label: "상담후기", icon: "cases" },
              { href: "/inquiry/money?tab=job", label: "재택알바/부업 문의", icon: "money" },
            ]}
          />
        </div>
      </section>

      {/* =================================================================
          2. SEARCH BAND — Light section, the actual action
          ================================================================= */}
      <section className="sec" id="search">
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
            <h2>사건 / 사고 사례</h2>
            <span className="sec-num">N° 01 — N° {String(categories.length).padStart(2, "0")}</span>
          </header>

          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* =================================================================
          5. CASES — Dark section, file index
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
              무료 법률상담 신청
              <span className="btn-icon"><ArrowRight size={18} /></span>
            </Link>
            <Link
              href="/inquiry/money"
              className="btn btn-lg btn-stack"
              style={{
                background: "rgb(var(--c-bg))",
                color: "rgb(var(--c-fg))",
                borderColor: "rgb(var(--c-bg))",
              }}
            >
              <span className="btn-main">
                무료 대출상담 신청
                <span className="btn-icon"><ArrowRight size={18} /></span>
              </span>
              <span className="btn-sub">고액 재택알바/부업 알아보기</span>
            </Link>
            <Link
              href="/chat"
              className="btn btn-lg"
              style={{
                background: "transparent",
                color: "rgb(var(--c-bg))",
                borderColor: "rgb(var(--c-bg) / 0.4)",
              }}
            >
              나의 사례 우선 진단하기
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
