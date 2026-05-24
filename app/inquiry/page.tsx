import SiteLayout from "../components/SiteLayout";
import LegalNotice from "../components/LegalNotice";
import InquiryForm from "./InquiryForm";
import { listCategories } from "@/lib/db";
import { getCurrentMember } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function InquiryPage({
  searchParams,
}: {
  searchParams: { category?: string; sub?: string };
}) {
  const categories = listCategories().map((c) => ({
    slug: c.slug,
    name: c.name,
  }));
  const member = getCurrentMember();

  return (
    <SiteLayout>
      <div className="page-head">
        <div className="container">
          <h1>상담 신청</h1>
          <p>
            담당자가 확인 후 입력하신 번호로 연락드립니다. 전화 연결이 원활할 수
            있도록 연락을 받아주세요.
          </p>
        </div>
      </div>

      <div
        className="container"
        style={{ paddingTop: 24, maxWidth: 820 }}
      >
        <InquiryForm
          categories={categories}
          defaultCategorySlug={searchParams.category}
          defaultName={member?.name}
          defaultPhone={member?.phone}
          defaultEmail={member?.email || ""}
        />
        <LegalNotice />
      </div>
    </SiteLayout>
  );
}
