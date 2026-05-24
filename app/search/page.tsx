import Link from "next/link";
import SiteLayout from "../components/SiteLayout";
import AISearchBox from "../components/AISearchBox";
import AIAnswerCard from "../components/AIAnswerCard";
import LegalNotice from "../components/LegalNotice";
import { answerQuery } from "@/lib/ai";
import {
  getCategoryBySlug,
  listCasesByCategory,
  listShortsByCategory,
  listSubcategories,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = (searchParams.q || "").trim();
  const answer = await answerQuery(query);
  const cat = answer.matched_category_slug
    ? getCategoryBySlug(answer.matched_category_slug)
    : null;
  const cases = cat ? listCasesByCategory(cat.id, 6) : [];
  const shorts = cat ? listShortsByCategory(cat.id) : [];
  const subs = cat ? listSubcategories(cat.id) : [];

  return (
    <SiteLayout>
      <section className="ai-search-wrap">
        <div className="container" style={{ paddingTop: 28, paddingBottom: 24 }}>
          <AISearchBox defaultValue={query} />
        </div>
      </section>

      <section className="container" style={{ paddingTop: 24 }}>
        {query ? (
          <AIAnswerCard query={query} answer={answer} />
        ) : (
          <div className="empty-state">
            상단 검색창에 고민을 입력해 주세요. 예: &quot;보이스피싱 당한 것
            같아요&quot;, &quot;전세보증금을 못 받고 있어요&quot;
          </div>
        )}
      </section>

      {cat && (
        <>
          <section className="container" style={{ paddingTop: 36 }}>
            <div className="section-head">
              <div>
                <h2>
                  {cat.emoji} {cat.name} 관련 안내
                </h2>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: "var(--ink-mute)",
                    fontSize: 14,
                  }}
                >
                  검색어와 가장 가까운 분야로 자동 추천된 콘텐츠입니다.
                </p>
              </div>
              <Link href={`/category/${cat.slug}`} className="more">
                카테고리 전체 보기 →
              </Link>
            </div>

            {subs.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 18,
                }}
              >
                {subs.map((s) => (
                  <Link
                    key={s.id}
                    href={`/category/${cat.slug}#sub-${s.slug}`}
                    className="suggest-chip"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            )}

            {cases.length === 0 ? (
              <div className="empty-state">
                이 분야의 사례가 아직 등록되어 있지 않습니다. 상담 신청을 통해
                개별 안내를 받아보실 수 있습니다.
              </div>
            ) : (
              <div className="case-list">
                {cases.map((c) => (
                  <Link key={c.id} href={`/case/${c.id}`} className="case-card">
                    <div className="tag">
                      {cat.emoji} {cat.name}
                    </div>
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
            )}
          </section>

          {shorts.length > 0 && (
            <section className="container" style={{ paddingTop: 36 }}>
              <div className="section-head">
                <h2>관련 쇼츠</h2>
                <Link href="/shorts" className="more">
                  전체 쇼츠 →
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
                      <span style={{ position: "relative", zIndex: 1 }}>
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
        </>
      )}

      <section className="container" style={{ paddingTop: 28 }}>
        <LegalNotice />
      </section>
    </SiteLayout>
  );
}
