import Link from "next/link";
import SiteLayout from "../components/SiteLayout";
import LegalNotice from "../components/LegalNotice";
import ReviewForm from "./ReviewForm";
import { listCategories, listReviews } from "@/lib/db";
import { getCurrentMember } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "실제 상담 이용 후기 · 미소 법률 · 금융 상담",
  description:
    "회원들이 직접 남긴 실제 상담 이용 후기. 솔직한 만족도와 경험을 확인해보세요.",
};

function fmtDate(iso: string) {
  return iso.slice(0, 10).replace(/-/g, ".");
}

function mask(name: string | null): string {
  if (!name) return "익명";
  const n = name.trim();
  if (n.length <= 1) return n;
  if (n.length === 2) return n[0] + "*";
  return n[0] + "*".repeat(Math.max(1, n.length - 2)) + n[n.length - 1];
}

export default function ReviewsPage() {
  const member = getCurrentMember();
  const reviews = listReviews(100);
  const categories = listCategories().map((c) => ({
    slug: c.slug,
    name: c.name,
  }));
  const catMap = new Map(categories.map((c) => [c.slug, c.name]));

  return (
    <SiteLayout>
      <div className="page-head is-hero page-head--contract">
        <div className="container">
          <h1>실제 상담 이용 후기</h1>
          <p>
            회원들이 직접 남긴 솔직한 후기를 확인하고, 본인의 경험도
            남겨주세요.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24, maxWidth: 880 }}>
        {/* 작성 영역 */}
        {member ? (
          <ReviewForm categories={categories} memberName={member.name} />
        ) : (
          <div className="review-login-prompt">
            <strong>후기 작성은 회원만 가능합니다.</strong>
            <div className="review-login-actions">
              <Link href="/login?next=/reviews" className="btn btn-primary">
                로그인
              </Link>
              <Link href="/signup" className="btn btn-ghost">
                회원가입
              </Link>
            </div>
          </div>
        )}

        {/* 목록 */}
        <section className="review-list" aria-label="후기 목록">
          <header className="review-list-head">
            <h2>총 {reviews.length}개의 후기</h2>
          </header>

          {reviews.length === 0 ? (
            <div className="empty-state">
              아직 등록된 후기가 없습니다. 첫 후기를 남겨주세요.
            </div>
          ) : (
            <ul className="review-items">
              {reviews.map((r) => (
                <li key={r.id} className="review-item">
                  <div className="review-meta">
                    <span className="review-stars" aria-label={`별점 ${r.rating}점`}>
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </span>
                    <span className="review-author">{mask(r.author_name)}</span>
                    <span className="review-date">{fmtDate(r.created_at)}</span>
                    {r.category_slug && catMap.has(r.category_slug) && (
                      <span className="review-cat">
                        {catMap.get(r.category_slug)}
                      </span>
                    )}
                  </div>
                  <h3 className="review-title">{r.title}</h3>
                  <p className="review-content">{r.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <LegalNotice />
      </div>
    </SiteLayout>
  );
}
