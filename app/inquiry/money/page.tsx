import SiteLayout from "../../components/SiteLayout";
import LegalNotice from "../../components/LegalNotice";
import InquiryForm from "../InquiryForm";
import { listCategories } from "@/lib/db";
import { getCurrentMember } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "무료 대출상담 신청 · 미소 법률 · 대출 상담",
  description:
    "회생·파산·압류·채무조정·필요자금 검토까지 — 담당자가 영업일 기준 평균 24시간 안에 회신합니다.",
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
          <h1>무료 대출상담 신청</h1>
          <p>
            회생·파산·압류·채무조정·필요자금 검토까지. 담당자가 확인 후
            입력하신 번호로 연락드립니다.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24, maxWidth: 820 }}>
        <InquiryForm
          categories={categories}
          lockedCategorySlug="recovery"
          contentLabel="필요자금 및 상담 내용"
          contentPlaceholder="예: 필요자금 5,000만원 / 현재 채무 1억 원 (제2금융권 6건) / 신용등급 6등급 / 연체 3개월 / 직장 재직 중·월 소득 350만 원 — 개인회생 가능 여부 검토 요청"
          contentHelp="필요자금·현재 채무 규모·소득·연체 여부를 적어 주시면 더 정확한 안내가 가능합니다."
          submitLabel="무료 대출상담 신청"
          defaultName={member?.name}
          defaultPhone={member?.phone}
          defaultEmail={member?.email || ""}
        />
        <LegalNotice />
      </div>
    </SiteLayout>
  );
}
