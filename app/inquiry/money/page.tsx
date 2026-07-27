import { Suspense } from "react";
import SiteLayout from "../../components/SiteLayout";
import LegalNotice from "../../components/LegalNotice";
import TabbedInquiry from "../TabbedInquiry";
import { listCategories } from "@/lib/db";
import { getCurrentMember } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "무료 대출상담 · 재택알바 신청 · 미소 법률 · 대출 상담",
  description:
    "회생·파산·압류·채무조정·필요자금 검토, 그리고 재택알바 신청까지 — 담당자가 확인 후 회신드립니다.",
};

export default function MoneyInquiryPage() {
  const categories = listCategories().map((c) => ({
    slug: c.slug,
    name: c.name,
  }));
  const member = getCurrentMember();

  return (
    <SiteLayout>
      <div className="page-head is-hero page-head--contract">
        <div className="container">
          <h1>무료 상담 신청</h1>
          <p>
            대출 상담과 재택알바 신청을 한 페이지에서. 상단 탭을 눌러 원하는
            상담 유형을 선택해 주세요.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24, maxWidth: 820 }}>
        <Suspense
          fallback={<div style={{ minHeight: 480 }} aria-hidden />}
        >
          <TabbedInquiry
            categories={categories}
            defaultName={member?.name}
            defaultPhone={member?.phone}
          />
        </Suspense>
        <LegalNotice />
      </div>
    </SiteLayout>
  );
}
