"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import InquiryForm from "./InquiryForm";
import JobInquiryForm from "./JobInquiryForm";

type Tab = "loan" | "job";

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

type Category = { slug: string; name: string };

type Props = {
  categories: Category[];
  defaultName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
};

export default function TabbedInquiry({
  categories,
  defaultName,
  defaultPhone,
  defaultEmail = "",
}: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initial: Tab = params.get("tab") === "job" ? "job" : "loan";
  const [tab, setTab] = useState<Tab>(initial);

  // URL의 ?tab= 이 바뀌면(뒤로가기 등) 상태 동기화
  useEffect(() => {
    const t = params.get("tab");
    const next: Tab = t === "job" ? "job" : "loan";
    if (next !== tab) setTab(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function selectTab(next: Tab) {
    if (next === tab) return;
    setTab(next);
    // 히스토리에 남기지 않고 쿼리만 갱신 (뒤로가기 잡음 방지)
    const q = next === "job" ? "?tab=job" : "";
    router.replace(`${pathname}${q}`, { scroll: false });
  }

  return (
    <>
      <div className="inquiry-tabs" role="tablist" aria-label="상담 유형">
        <button
          type="button"
          role="tab"
          id="tab-loan"
          aria-selected={tab === "loan"}
          aria-controls="panel-loan"
          className={`inquiry-tab ${tab === "loan" ? "is-active" : ""}`}
          onClick={() => selectTab("loan")}
        >
          대출 상담
        </button>
        <button
          type="button"
          role="tab"
          id="tab-job"
          aria-selected={tab === "job"}
          aria-controls="panel-job"
          className={`inquiry-tab ${tab === "job" ? "is-active" : ""}`}
          onClick={() => selectTab("job")}
        >
          재택알바 신청
        </button>
      </div>

      {tab === "loan" ? (
        <div
          role="tabpanel"
          id="panel-loan"
          aria-labelledby="tab-loan"
        >
          <InquiryForm
            categories={categories}
            lockedCategorySlug="recovery"
            contentLabel="필요자금 및 상담 내용"
            contentPlaceholder="예: 필요자금 5,000만원 / 현재 채무 1억 원 (제2금융권 6건) / 신용등급 6등급 / 연체 3개월 / 직장 재직 중·월 소득 350만 원 — 개인회생 가능 여부 검토 요청"
            contentHelp="필요자금·현재 채무 규모·소득·연체 여부를 적어 주시면 더 정확한 안내가 가능합니다."
            submitLabel="무료 대출상담 신청"
            defaultName={defaultName}
            defaultPhone={defaultPhone}
            defaultEmail={defaultEmail}
          />
        </div>
      ) : (
        <section
          role="tabpanel"
          id="panel-job"
          aria-labelledby="tab-job"
          className="job-section"
        >
          <div className="job-eyebrow">JOB · REMOTE WORK</div>
          <h2 className="job-h">
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

          <JobInquiryForm
            defaultName={defaultName}
            defaultPhone={defaultPhone}
          />
        </section>
      )}
    </>
  );
}
