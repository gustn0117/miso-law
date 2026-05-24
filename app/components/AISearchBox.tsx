"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  defaultValue?: string;
  suggestions?: string[];
  autoFocus?: boolean;
};

const DEFAULT_SUGGESTIONS = [
  "보이스피싱 당한 것 같아요",
  "전세보증금을 못 받고 있어요",
  "음주운전 단속에 걸렸어요",
  "임금이 체불되고 있어요",
  "개인회생을 알아보고 있어요",
  "이혼을 준비 중인데 재산분할이 걱정돼요",
];

export default function AISearchBox({
  defaultValue = "",
  suggestions = DEFAULT_SUGGESTIONS,
  autoFocus = false,
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [loading, setLoading] = useState(false);

  function go(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    go(q);
  }

  return (
    <div>
      <form className="ai-search-box" onSubmit={onSubmit} role="search">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--ink-mute)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          style={{ flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          inputMode="search"
          placeholder="어떤 법률 고민이 있으신가요?"
          aria-label="법률 고민 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus={autoFocus}
          maxLength={300}
        />
        <button type="submit" disabled={loading || !q.trim()}>
          {loading ? "검색 중..." : "AI 답변 받기"}
        </button>
      </form>
      <div className="suggest-chips">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            className="suggest-chip"
            onClick={() => {
              setQ(s);
              go(s);
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
