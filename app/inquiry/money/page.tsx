import SiteLayout from "../../components/SiteLayout";
import LegalNotice from "../../components/LegalNotice";
import InquiryForm from "../InquiryForm";
import JobInquiryForm from "../JobInquiryForm";
import { listCategories } from "@/lib/db";
import { getCurrentMember } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "무료 대출상담 신청 · 미소 법률 · 대출 상담",
  description:
    "회생·파산·압류·채무조정·필요자금 검토까지 — 담당자가 영업일 기준 평균 24시간 안에 회신합니다.",
};

const JOB_BENEFITS = [
  {
    kicker: "출퇴근 부담 없이, 하루 1시간이면 돼요",
    highlight: "시간 없어도 시작할 수 있어요",
  },
  {
    kicker: "기본 교육 이수 후 바로 시작",
    highlight: "첫 달 평균 150만원부터 벌고 있어요",
  },
  {
    kicker: "처음이라도 괜찮아요",
    highlight: "전담 멘토가 옆에서 같이 해줘요",
  },
];

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
        {/* -------- 1) 대출 상담 신청 (기존) -------- */}
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

        {/* -------- 2) 재택알바 신청 (신규) -------- */}
        <section className="job-section" aria-labelledby="job-section-title">
          <div className="job-rule" aria-hidden />
          <div className="job-eyebrow">JOB · REMOTE WORK</div>
          <h2 id="job-section-title" className="job-h">
            지금 바로 상담 신청하면
            <br />
            혜택을 받아요
          </h2>

          <ul className="job-benefits" role="list">
            {JOB_BENEFITS.map((b, i) => (
              <li key={i}>
                <span className="job-benefits-idx">
                  N° {String(i + 1).padStart(2, "0")}
                </span>
                <div className="job-benefits-body">
                  <span className="job-benefits-kicker">{b.kicker}</span>
                  <span className="job-benefits-highlight">{b.highlight}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="job-form-wrap">
            <div className="job-form-head">
              <h3>재택알바 신청</h3>
              <p>
                이름과 연락처만 남겨주시면 담당 멘토가 안내 전화드립니다.
              </p>
            </div>
            <JobInquiryForm
              defaultName={member?.name}
              defaultPhone={member?.phone}
            />
          </div>
        </section>

        <LegalNotice />
      </div>
    </SiteLayout>
  );
}
