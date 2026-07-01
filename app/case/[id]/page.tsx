import Link from "next/link";
import { notFound } from "next/navigation";
import SiteLayout from "../../components/SiteLayout";
import LegalNotice from "../../components/LegalNotice";
import { ArrowRight } from "../../components/icons";
import {
  getCaseById,
  getDb,
  incrementCaseView,
  listCasesByCategory,
  listShortsByCategory,
} from "@/lib/db";
import type { Category } from "@/lib/db";
import { detectEmbed, buildYouTubeEmbedUrl } from "@/lib/embed";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export default function CaseDetailPage({ params }: Props) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return notFound();
  const c = getCaseById(id);
  if (!c || c.published !== 1) return notFound();

  incrementCaseView(id);

  const cat = getDb()
    .prepare("SELECT * FROM categories WHERE id = ?")
    .get(c.category_id) as Category | undefined;
  const sub = c.subcategory_id
    ? (getDb()
        .prepare("SELECT * FROM subcategories WHERE id = ?")
        .get(c.subcategory_id) as { id: number; name: string; slug: string } | undefined)
    : undefined;

  const related = cat
    ? listCasesByCategory(cat.id, 5).filter((x) => x.id !== c.id).slice(0, 4)
    : [];
  const shorts = cat ? listShortsByCategory(cat.id) : [];

  return (
    <SiteLayout>
      <div className="page-head is-hero page-head--docs">
        <div className="container">
          <div
            style={{
              fontSize: 13,
              color: "rgb(var(--c-bg) / 0.7)",
              marginBottom: 6,
            }}
          >
            <Link href="/">홈</Link> ·{" "}
            {cat && (
              <>
                <Link href={`/category/${cat.slug}`}>{cat.name}</Link>
                {sub && <> · {sub.name}</>}
              </>
            )}
          </div>
          <h1>{c.title}</h1>
          <div
            style={{
              marginTop: 8,
              color: "var(--ink-mute)",
              fontSize: 13,
            }}
          >
            등록일 {c.created_at.slice(0, 10)} · 조회 {c.view_count + 1}
          </div>
        </div>
      </div>

      <article
        className="container"
        style={{
          paddingTop: 28,
          maxWidth: 820,
        }}
      >
        {c.image_url && (
          <figure style={{ margin: "0 0 24px" }}>
            <img
              src={c.image_url}
              alt=""
              style={{
                width: "100%",
                maxHeight: 480,
                objectFit: "cover",
                border: "1px solid rgb(var(--c-line))",
              }}
            />
          </figure>
        )}
        {c.excerpt && (
          <div
            style={{
              padding: 16,
              background: "var(--bg-cream)",
              border: "1px solid #f1e7c4",
              borderRadius: 12,
              color: "var(--ink-soft)",
              fontSize: 15,
              marginBottom: 24,
              lineHeight: 1.7,
            }}
          >
            {c.excerpt}
          </div>
        )}
        <CaseBody body={c.body} />

        <div
          style={{
            marginTop: 30,
            padding: 22,
            background: "var(--brand)",
            color: "#fff",
            borderRadius: 14,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>
              개별 상황에 맞는 안내가 필요하다면
            </div>
            <div style={{ opacity: 0.9, fontSize: 14, marginTop: 4 }}>
              담당자가 확인 후 입력하신 번호로 연락드립니다.
            </div>
          </div>
          <Link
            href={`/inquiry?category=${cat?.slug || ""}${sub ? `&sub=${sub.slug}` : ""}`}
            className="btn"
            style={{ background: "#fff", color: "var(--brand)" }}
          >
            상담 신청하기
          </Link>
        </div>

        <LegalNotice />
      </article>

      {(related.length > 0 || shorts.length > 0) && (
        <section
          className="container"
          style={{ paddingTop: 32, paddingBottom: 16 }}
        >
          {related.length > 0 && (
            <>
              <div className="section-head">
                <h2>관련 사례</h2>
                {cat && (
                  <Link href={`/category/${cat.slug}`} className="more">
                    카테고리 전체 <ArrowRight size={14} />
                  </Link>
                )}
              </div>
              <div className="case-list">
                {related.map((r) => (
                  <Link key={r.id} href={`/case/${r.id}`} className="case-card">
                    <div className="tag">{cat?.name}</div>
                    <div className="title">{r.title}</div>
                    <div className="excerpt">{r.excerpt}</div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {shorts.length > 0 && (
            <div style={{ marginTop: 32 }}>
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
            </div>
          )}
        </section>
      )}
    </SiteLayout>
  );
}

// ----- 본문 렌더링 (간이 마크다운: ##, -, 빈줄 + YouTube/iframe 임베드) -----
function CaseBody({ body }: { body: string }) {
  const blocks = body.split(/\n\s*\n/);
  return (
    <div
      style={{
        fontSize: 16,
        lineHeight: 1.8,
        color: "var(--ink)",
      }}
    >
      {blocks.map((block, i) => {
        const trimmed = block.trim();

        // 임베드 우선 처리 — YouTube URL 자체 or <iframe> 붙여넣기
        const embed = detectEmbed(trimmed);
        if (embed.kind === "youtube") {
          const src = buildYouTubeEmbedUrl(embed.videoId, embed.listId);
          return (
            <div key={i} className="case-embed">
              <iframe
                src={src}
                title="YouTube 영상"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          );
        }
        if (embed.kind === "iframe") {
          return (
            <div
              key={i}
              className="case-embed"
              dangerouslySetInnerHTML={{ __html: embed.html }}
            />
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={i}
              style={{
                fontSize: 19,
                marginTop: 28,
                marginBottom: 10,
                color: "var(--brand)",
              }}
            >
              {trimmed.slice(3).trim()}
            </h2>
          );
        }
        const lines = trimmed.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul
              key={i}
              style={{
                paddingLeft: 20,
                color: "var(--ink-soft)",
                margin: "6px 0 14px",
              }}
            >
              {lines.map((l, j) => (
                <li key={j} style={{ margin: "4px 0" }}>
                  {l.replace(/^- /, "")}
                </li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\d+\.\s/.test(l.trim()))) {
          return (
            <ol
              key={i}
              style={{
                paddingLeft: 20,
                color: "var(--ink-soft)",
                margin: "6px 0 14px",
              }}
            >
              {lines.map((l, j) => (
                <li key={j} style={{ margin: "4px 0" }}>
                  {l.replace(/^\d+\.\s/, "")}
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} style={{ margin: "10px 0", color: "var(--ink-soft)" }}>
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
