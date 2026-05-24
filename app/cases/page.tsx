import SiteLayout from "../components/SiteLayout";
import Link from "next/link";
import { listAllCases, listCategories } from "@/lib/db";
import LegalNotice from "../components/LegalNotice";

export const dynamic = "force-dynamic";

export default function CasesPage() {
  const cases = listAllCases().filter((c) => c.published === 1);
  const cats = listCategories();
  const catMap = new Map(cats.map((c) => [c.id, c]));

  return (
    <SiteLayout>
      <div className="page-head is-hero page-head--docs">
        <div className="container">
          <h1>전체 사례</h1>
          <p>
            카테고리별 실제 상담·대응 사례입니다. 사례는 일반 정보 제공
            목적이며, 개별 상황에는 전문가 상담이 필요합니다.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 28 }}>
        {cases.length === 0 ? (
          <div className="empty-state">아직 등록된 사례가 없습니다.</div>
        ) : (
          <div className="case-list">
            {cases.map((c) => {
              const cat = catMap.get(c.category_id);
              return (
                <Link key={c.id} href={`/case/${c.id}`} className="case-card">
                  <div className="tag">{cat?.name}</div>
                  <div className="title">{c.title}</div>
                  <div className="excerpt">{c.excerpt}</div>
                  <div className="meta">
                    <span>조회 {c.view_count}</span>
                    <span>·</span>
                    <span>{c.created_at.slice(0, 10)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        <LegalNotice />
      </div>
    </SiteLayout>
  );
}
