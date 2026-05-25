import Link from "next/link";
import { notFound } from "next/navigation";
import SiteLayout from "../../components/SiteLayout";
import LegalNotice from "../../components/LegalNotice";
import { ArrowRight } from "../../components/icons";
import {
  getCategoryBySlug,
  listCasesByCategory,
  listCasesBySubcategory,
  listShortsByCategory,
  listSubcategories,
} from "@/lib/db";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export default function CategoryPage({ params }: Props) {
  const cat = getCategoryBySlug(params.slug);
  if (!cat) return notFound();

  const subs = listSubcategories(cat.id);
  const allCases = listCasesByCategory(cat.id, 50);
  const shorts = listShortsByCategory(cat.id);

  // 중분류별로 사례 그룹화
  const casesBySubId = new Map<number | null, typeof allCases>();
  for (const c of allCases) {
    const k = c.subcategory_id ?? null;
    if (!casesBySubId.has(k)) casesBySubId.set(k, []);
    casesBySubId.get(k)!.push(c);
  }

  return (
    <SiteLayout>
      <div className="page-head is-hero page-head--docs">
        <div className="container">
          <div
            style={{
              fontSize: 13,
              color: "var(--ink-mute)",
              marginBottom: 6,
            }}
          >
            <Link href="/">홈</Link> ·{" "}
            <Link href="/cases">전체 사례</Link>
          </div>
          <h1 className="page-title-with-icon">{cat.name}</h1>
          {cat.description && <p>{cat.description}</p>}
        </div>
      </div>

      <section className="container category-content">
        <div className="subnav-chips">
          {subs.map((s) => (
            <a
              key={s.id}
              href={`#sub-${s.slug}`}
              className="suggest-chip"
            >
              {s.name}
            </a>
          ))}
        </div>

        {subs.length === 0 ? (
          <div className="empty-state">중분류가 아직 등록되지 않았습니다.</div>
        ) : (
          subs.map((s) => {
            const cases = listCasesBySubcategory(s.id);
            return (
              <div
                key={s.id}
                id={`sub-${s.slug}`}
                className="category-section"
              >
                <div className="section-head">
                  <h2>{s.name}</h2>
                  <Link
                    href={`/inquiry?category=${cat.slug}&sub=${s.slug}`}
                    className="more"
                  >
                    이 분야 상담 <ArrowRight size={14} />
                  </Link>
                </div>
                {cases.length === 0 ? (
                  <div className="empty-state">
                    {s.name} 관련 사례는 아직 등록 전입니다.{" "}
                    <Link
                      href={`/inquiry?category=${cat.slug}&sub=${s.slug}`}
                      style={{
                        color: "var(--brand)",
                        fontWeight: 600,
                      }}
                    >
                      상담 신청하기
                    </Link>
                  </div>
                ) : (
                  <div className="case-list">
                    {cases.map((c) => (
                      <Link
                        key={c.id}
                        href={`/case/${c.id}`}
                        className="case-card"
                      >
                        <div className="tag">{s.name}</div>
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
              </div>
            );
          })
        )}

        {/* 중분류 미지정 사례 */}
        {casesBySubId.has(null) && (
          <div className="category-section">
            <div className="section-head">
              <h2>기타 사례</h2>
            </div>
            <div className="case-list">
              {casesBySubId.get(null)!.map((c) => (
                <Link key={c.id} href={`/case/${c.id}`} className="case-card">
                  <div className="tag">{cat.name}</div>
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
        )}
      </section>

      {shorts.length > 0 && (
        <section className="container category-extra-section">
          <div className="section-head">
            <h2>관련 쇼츠</h2>
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
            ))}
          </div>
        </section>
      )}

      <section className="container category-cta-section">
        <div
          style={{
            background: "var(--brand-soft)",
            border: "1px solid #cdd9f0",
            borderRadius: 14,
            padding: 22,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 800,
                color: "var(--brand)",
                fontSize: 18,
              }}
            >
              {cat.name} 관련 상담을 받고 싶다면
            </div>
            <div
              style={{
                color: "var(--ink-soft)",
                fontSize: 14,
                marginTop: 4,
              }}
            >
              담당자가 확인 후 입력하신 번호로 연락드립니다.
            </div>
          </div>
          <Link
            href={`/inquiry?category=${cat.slug}`}
            className="btn btn-primary"
          >
            상담 신청하기
          </Link>
        </div>

        <LegalNotice />
      </section>
    </SiteLayout>
  );
}
