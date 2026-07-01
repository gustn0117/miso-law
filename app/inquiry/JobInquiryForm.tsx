"use client";

import { useState } from "react";

type Category = { slug: string; label: string };

// 카테고리는 서버가 확정 목록을 내려주기 전까지 임시 옵션.
// (사장님이 카테고리 사진 첨부하시면 정확히 반영 예정)
const DEFAULT_CATEGORIES: Category[] = [
  { slug: "counseling", label: "전화 상담원" },
  { slug: "marketing", label: "SNS · 블로그 홍보" },
  { slug: "office", label: "서류 · 사무 지원" },
  { slug: "unsure", label: "잘 모르겠어요 (추천 받기)" },
];

const AGE_RANGES = ["20대", "30대", "40대", "50대", "60대 이상"];
const AVAILABILITY = [
  "오전 (09–12시)",
  "오후 (13–17시)",
  "저녁 (18–22시)",
  "자유 · 협의 가능",
];

type Props = {
  categories?: Category[];
  defaultName?: string;
  defaultPhone?: string;
};

export default function JobInquiryForm({
  categories = DEFAULT_CATEGORIES,
  defaultName = "",
  defaultPhone = "",
}: Props) {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [age, setAge] = useState(AGE_RANGES[0]);
  const [avail, setAvail] = useState(AVAILABILITY[3]);
  const [category, setCategory] = useState(categories[0]?.slug ?? "unsure");
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setErr(null);

    if (!name.trim()) return setErr("이름을 입력해 주세요.");
    if (!phone.trim()) return setErr("연락처를 입력해 주세요.");
    if (!agree) return setErr("개인정보 수집·이용 동의가 필요합니다.");

    setLoading(true);
    try {
      const res = await fetch("/api/job-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          age_range: age,
          availability: avail,
          category_slug: category,
          note,
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
          담당자가 확인 후 입력하신 번호로 연락드립니다. 접수번호 #{successId}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="job-form" noValidate>
      <div className="job-form-row">
        <label className="job-field">
          <span>이름</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            placeholder="홍길동"
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
      </div>

      <div className="job-form-row">
        <label className="job-field">
          <span>나이대</span>
          <select value={age} onChange={(e) => setAge(e.target.value)}>
            {AGE_RANGES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="job-field">
          <span>희망 근무 시간</span>
          <select value={avail} onChange={(e) => setAvail(e.target.value)}>
            {AVAILABILITY.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="job-field">
        <span>관심 업무 (카테고리)</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="job-field">
        <span>문의 사항 (선택)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="궁금한 점이나 특이사항이 있다면 알려주세요."
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

      {err && <div className="job-err">{err}</div>}

      <button
        type="submit"
        className="btn btn-primary btn-lg"
        disabled={loading}
      >
        {loading ? "전송 중" : "재택알바 신청하기"}
      </button>
    </form>
  );
}
