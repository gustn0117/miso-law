import SiteLayout from "../components/SiteLayout";
import { listAllCases, listCategories } from "@/lib/db";
import LegalNotice from "../components/LegalNotice";
import CasesSearch, { type CaseListItem } from "./CasesSearch";

export const dynamic = "force-dynamic";

export default function CasesPage() {
  const cats = listCategories();
  const catMap = new Map(cats.map((c) => [c.id, c]));
  const cases: CaseListItem[] = listAllCases()
    .filter((c) => c.published === 1)
    .map((c) => ({
      id: c.id,
      title: c.title,
      excerpt: c.excerpt,
      categoryName: catMap.get(c.category_id)?.name ?? "",
      viewCount: c.view_count,
      createdAt: c.created_at,
    }));

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
          <CasesSearch cases={cases} />
        )}
        <LegalNotice />
      </div>
    </SiteLayout>
  );
}
