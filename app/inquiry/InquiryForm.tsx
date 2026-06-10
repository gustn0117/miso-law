"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Cat = { slug: string; name: string };

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; id: number }
  | { kind: "error"; msg: string };

const SOURCES = ["검색", "카페", "블로그", "지인추천", "SNS", "유튜브", "기타"];

export default function InquiryForm({
  categories,
  defaultCategorySlug,
  defaultName,
  defaultPhone,
  defaultEmail,
  lockedCategorySlug,
  contentLabel = "간단한 내용",
  contentPlaceholder = "상황을 간단히 적어 주세요. (피해 시점, 금액, 진행 상황 등)",
  contentHelp,
  submitLabel = "상담 신청하기",
}: {
  categories: Cat[];
  defaultCategorySlug?: string;
  defaultName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
  /** 지정 시 카테고리 select 숨김 + 해당 slug로 고정 (사용자가 변경 불가) */
  lockedCategorySlug?: string;
  contentLabel?: string;
  contentPlaceholder?: string;
  contentHelp?: string;
  submitLabel?: string;
}) {
  const [form, setForm] = useState({
    name: defaultName || "",
    phone: defaultPhone || "",
    email: defaultEmail || "",
    category_slug: lockedCategorySlug || defaultCategorySlug || "",
    content: "",
    source: "",
    agree: false,
  });
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const isValid = useMemo(() => {
    return (
      form.name.trim().length > 0 &&
      form.phone.replace(/[^0-9]/g, "").length >= 10 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
      !!form.category_slug &&
      form.content.trim().length >= 5 &&
      form.agree
    );
  }, [form]);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status.kind === "loading") return;
    if (!isValid) {
      setStatus({
        kind: "error",
        msg: "필수 입력값을 확인해 주세요.",
      });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({
          kind: "error",
          msg: data.error || "전송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        });
        return;
      }
      setStatus({ kind: "success", id: Number(data.id) });
      // 성공 후 폼 초기화
      setForm({
        name: "",
        phone: "",
        email: "",
        category_slug: lockedCategorySlug || defaultCategorySlug || "",
        content: "",
        source: "",
        agree: false,
      });
      // 페이지 상단으로 부드럽게 스크롤
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error(err);
      setStatus({
        kind: "error",
        msg: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      });
    }
  }

  if (status.kind === "success") {
    return (
      <div
        className="admin-card"
        style={{
          textAlign: "center",
          padding: "40px 20px",
          background: "var(--bg-cream)",
          borderColor: "#f1e7c4",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 8 }} aria-hidden>
          ✅
        </div>
        <h2
          style={{
            margin: "6px 0",
            color: "var(--brand)",
            fontSize: 22,
          }}
        >
          상담 신청이 접수되었습니다.
        </h2>
        <p
          style={{
            margin: "8px 0 4px",
            color: "var(--ink-soft)",
            fontSize: 15,
            lineHeight: 1.7,
          }}
        >
          담당자가 확인 후 입력하신 번호로 연락드리겠습니다.
          <br />
          전화 연결이 원활할 수 있도록 연락을 받아주세요.
        </p>
        <div
          style={{
            color: "var(--ink-mute)",
            fontSize: 13,
            marginBottom: 18,
          }}
        >
          접수번호 #{status.id}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <Link href="/" className="btn btn-primary">
            홈으로
          </Link>
          <Link href="/cases" className="btn btn-outline">
            사례 더 보기
          </Link>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setStatus({ kind: "idle" })}
          >
            추가로 신청하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="admin-card" onSubmit={onSubmit} noValidate>
      <div
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <div>
          <label className="form-label form-required" htmlFor="iq-name">
            이름
          </label>
          <input
            id="iq-name"
            className="form-input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="성함을 입력해 주세요"
            maxLength={30}
            autoComplete="name"
            required
          />
        </div>
        <div>
          <label className="form-label form-required" htmlFor="iq-phone">
            휴대폰 번호
          </label>
          <input
            id="iq-phone"
            className="form-input"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="010-1234-5678"
            maxLength={20}
            autoComplete="tel"
            required
          />
          <div className="form-help">담당자가 이 번호로 연락드립니다.</div>
        </div>
        <div>
          <label className="form-label form-required" htmlFor="iq-email">
            이메일
          </label>
          <input
            id="iq-email"
            className="form-input"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="example@email.com"
            maxLength={100}
            autoComplete="email"
            required
          />
        </div>
        {!lockedCategorySlug && (
          <div>
            <label className="form-label form-required" htmlFor="iq-category">
              상담 분야
            </label>
            <select
              id="iq-category"
              className="form-input"
              value={form.category_slug}
              onChange={(e) => update("category_slug", e.target.value)}
              required
            >
              <option value="">분야를 선택해 주세요</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div style={{ gridColumn: "1 / -1" }}>
          <label className="form-label form-required" htmlFor="iq-content">
            {contentLabel}
          </label>
          <textarea
            id="iq-content"
            className="form-input"
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            placeholder={contentPlaceholder}
            rows={6}
            maxLength={4000}
            style={{ resize: "vertical", minHeight: 120 }}
            required
          />
          <div className="form-help">
            {form.content.length} / 4000자 —{" "}
            {contentHelp || "자세할수록 정확한 안내가 가능합니다."}
          </div>
        </div>
        <div>
          <label className="form-label" htmlFor="iq-source">
            유입경로
          </label>
          <select
            id="iq-source"
            className="form-input"
            value={form.source}
            onChange={(e) => update("source", e.target.value)}
          >
            <option value="">선택 안 함</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 14,
          background: "var(--bg-soft)",
          borderRadius: 12,
          fontSize: 13,
          color: "var(--ink-soft)",
          lineHeight: 1.7,
        }}
      >
        <label
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={form.agree}
            onChange={(e) => update("agree", e.target.checked)}
            style={{ marginTop: 4, width: 18, height: 18 }}
          />
          <span>
            <strong>(필수) 개인정보 수집·이용 동의</strong> — 수집 항목: 이름,
            휴대폰 번호, 이메일, 상담 내용, 유입경로. 이용 목적: 상담 연결 및
            안내. 보관 기간: 상담 종결 후 6개월. 본 플랫폼은 법률/금융 정보를
            제공하고 상담 연결을 지원하며, 직접 법률 자문을 제공하지 않습니다.
          </span>
        </label>
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status.kind === "loading" || !isValid}
          style={{ flex: 1, minHeight: 50, fontSize: 16 }}
        >
          {status.kind === "loading" ? "접수 중..." : submitLabel}
        </button>
      </div>

      {status.kind === "error" && (
        <div className="form-status error" role="alert">
          {status.msg}
        </div>
      )}
    </form>
  );
}
