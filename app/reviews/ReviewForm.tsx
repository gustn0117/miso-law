"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; msg: string };

const RATING_LABEL: Record<number, string> = {
  5: "매우 만족",
  4: "만족",
  3: "보통",
  2: "아쉬움",
  1: "불만족",
};

type Category = { slug: string; name: string };

export default function ReviewForm({
  categories,
  memberName,
}: {
  categories: Category[];
  memberName: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    content: "",
    rating: 5,
    category_slug: "",
  });
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const isValid =
    form.title.trim().length > 0 && form.content.trim().length >= 10;

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status.kind === "loading" || !isValid) return;
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({
          kind: "error",
          msg: data.error || "등록에 실패했습니다.",
        });
        return;
      }
      // 새 후기 등록 후 폼 초기화 + 페이지 리프레시
      setForm({ title: "", content: "", rating: 5, category_slug: "" });
      setStatus({ kind: "idle" });
      router.refresh();
    } catch (err) {
      console.error(err);
      setStatus({
        kind: "error",
        msg: "네트워크 오류가 발생했습니다.",
      });
    }
  }

  return (
    <form className="review-form" onSubmit={onSubmit} noValidate>
      <header className="review-form-head">
        <span className="review-form-author">
          작성자 <strong>{memberName}</strong>
        </span>
        <div className="review-rating-group" role="radiogroup" aria-label="만족도">
          {[5, 4, 3, 2, 1].map((n) => (
            <label key={n} className="review-rating-item">
              <input
                type="radio"
                name="rating"
                value={n}
                checked={form.rating === n}
                onChange={() => update("rating", n)}
              />
              <span>
                {"★".repeat(n)}
                {"☆".repeat(5 - n)}
              </span>
              <span className="review-rating-label">{RATING_LABEL[n]}</span>
            </label>
          ))}
        </div>
      </header>

      <div className="review-form-row">
        <label className="form-label form-required" htmlFor="rv-title">
          제목
        </label>
        <input
          id="rv-title"
          className="form-input"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="후기 한 줄 요약 (예: 빠른 응답에 큰 도움이 되었습니다)"
          maxLength={80}
          required
        />
      </div>

      <div className="review-form-row">
        <label className="form-label" htmlFor="rv-cat">
          상담 분야 <span style={{ color: "rgb(var(--c-muted))" }}>(선택)</span>
        </label>
        <select
          id="rv-cat"
          className="form-input"
          value={form.category_slug}
          onChange={(e) => update("category_slug", e.target.value)}
        >
          <option value="">선택 안 함</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="review-form-row">
        <label className="form-label form-required" htmlFor="rv-content">
          후기 내용
        </label>
        <textarea
          id="rv-content"
          className="form-input"
          value={form.content}
          onChange={(e) => update("content", e.target.value)}
          placeholder="실제 상담 경험을 솔직하게 적어 주세요. (10자 이상)"
          rows={5}
          maxLength={4000}
          style={{ resize: "vertical", minHeight: 120 }}
          required
        />
        <div className="form-help">
          {form.content.length} / 4000자 — 다른 회원에게 도움이 되는 솔직한 후기를
          남겨주세요.
        </div>
      </div>

      <div className="review-form-actions">
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={status.kind === "loading" || !isValid}
        >
          {status.kind === "loading" ? "등록 중..." : "후기 등록"}
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
