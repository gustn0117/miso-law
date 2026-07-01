"use client";

import { useState } from "react";

// 6-step wizard: 직업 → 지역 → 시/구/군 → 상담 시간 → 연령대 → 인적사항 · 제출
// 사장님 첨부 참고 이미지의 카테고리·문구를 그대로 반영.

const OCCUPATIONS = ["직장인", "자영업", "주부", "개인사업자", "무직"];
const REGIONS = [
  "서울",
  "경기",
  "인천",
  "강원",
  "충청",
  "대전/세종",
  "전라/광주",
  "경상",
  "부산/대구/울산",
  "제주",
];
const AVAILABILITY = ["[오전]이 좋아요", "[오후]가 좋아요"];
const AGE_RANGES = ["20대", "30대", "40대", "50대", "60대 이상"];

type StepKey =
  | "occupation"
  | "region"
  | "district"
  | "availability"
  | "age"
  | "contact";

const STEPS: { key: StepKey; title: string }[] = [
  { key: "occupation", title: "직업을 선택해주세요" },
  { key: "region", title: "거주지역(시/도)를 선택해주세요" },
  { key: "district", title: "거주지(시/구/군)을 입력해주세요" },
  { key: "availability", title: "상담 가능 시간을 알려주세요" },
  { key: "age", title: "연령대를 선택해주세요" },
  { key: "contact", title: "이름과 연락처를 남겨주세요" },
];

type Props = {
  defaultName?: string;
  defaultPhone?: string;
};

export default function JobInquiryForm({
  defaultName = "",
  defaultPhone = "",
}: Props) {
  const [stepIdx, setStepIdx] = useState(0);

  const [occupation, setOccupation] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [avail, setAvail] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  const step = STEPS[stepIdx];

  function canProceed(): boolean {
    switch (step.key) {
      case "occupation":
        return occupation.length > 0;
      case "region":
        return region.length > 0;
      case "district":
        return district.trim().length > 0;
      case "availability":
        return avail.length > 0;
      case "age":
        return age.length > 0;
      case "contact":
        return name.trim().length > 0 && phone.trim().length > 0 && agree;
    }
  }

  function goPrev() {
    setErr(null);
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  }

  function goNext() {
    setErr(null);
    if (!canProceed()) return;
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (loading) return;
    if (!canProceed()) return;

    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/job-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          occupation,
          region,
          district,
          availability: avail,
          age_range: age,
          agree,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "일시적 오류가 발생했습니다.");
      }
      setSuccessId(Number(data.id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "일시적 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  if (successId !== null) {
    return (
      <div className="job-success">
        <div className="job-success-eyebrow">JOB INQUIRY · RECEIVED</div>
        <h3>신청이 접수되었습니다.</h3>
        <p>
          담당 멘토가 확인 후 남겨주신 번호로 연락드립니다. 접수번호 #
          {successId}
        </p>
      </div>
    );
  }

  const isLast = stepIdx === STEPS.length - 1;

  return (
    <form
      onSubmit={(e) => (isLast ? submit(e) : (e.preventDefault(), goNext()))}
      className="job-wizard"
      noValidate
    >
      <div className="job-wizard-head">
        <span className="job-wizard-step">
          Step {String(stepIdx + 1).padStart(2, "0")} / 0{STEPS.length}
        </span>
        <div className="job-wizard-progress">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`job-wizard-dot ${i <= stepIdx ? "is-on" : ""}`}
            />
          ))}
        </div>
      </div>

      <h3 className="job-wizard-title">{step.title}</h3>

      <div className="job-wizard-body">
        {step.key === "occupation" && (
          <ChoiceList
            options={OCCUPATIONS}
            value={occupation}
            onChange={setOccupation}
            name="occupation"
          />
        )}
        {step.key === "region" && (
          <ChoiceList
            options={REGIONS}
            value={region}
            onChange={setRegion}
            name="region"
          />
        )}
        {step.key === "district" && (
          <textarea
            className="job-wizard-textarea"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="예) 인천광역시 남동구"
            maxLength={80}
            rows={3}
            autoFocus
          />
        )}
        {step.key === "availability" && (
          <ChoiceList
            options={AVAILABILITY}
            value={avail}
            onChange={setAvail}
            name="availability"
          />
        )}
        {step.key === "age" && (
          <ChoiceList
            options={AGE_RANGES}
            value={age}
            onChange={setAge}
            name="age"
          />
        )}
        {step.key === "contact" && (
          <div className="job-wizard-contact">
            <label className="job-field">
              <span>이름</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                placeholder="홍길동"
                autoFocus
                required
              />
            </label>
            <label className="job-field">
              <span>연락처</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                placeholder="010-0000-0000"
                required
              />
            </label>
            <label className="job-agree">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span>
                이름·연락처를 상담 목적으로 수집·이용하는 것에 동의합니다.
              </span>
            </label>
          </div>
        )}
      </div>

      {!canProceed() && step.key !== "contact" && (
        <div className="job-wizard-hint">1개 이상 선택해주세요</div>
      )}
      {err && <div className="job-err">{err}</div>}

      <div className="job-wizard-nav">
        {stepIdx > 0 && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={goPrev}
            disabled={loading}
          >
            이전
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary btn-lg job-wizard-next"
          disabled={!canProceed() || loading}
        >
          {isLast ? (loading ? "전송 중" : "재택알바 신청하기") : "다음"}
        </button>
      </div>
    </form>
  );
}

function ChoiceList({
  options,
  value,
  onChange,
  name,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  name: string;
}) {
  return (
    <ul className="job-choice" role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const selected = opt === value;
        return (
          <li key={opt}>
            <label
              className={`job-choice-item ${selected ? "is-selected" : ""}`}
            >
              <input
                type="radio"
                name={name}
                value={opt}
                checked={selected}
                onChange={() => onChange(opt)}
              />
              <span>{opt}</span>
              <svg
                className="job-choice-check"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M3.5 8.5l3 3 6-7" />
              </svg>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
