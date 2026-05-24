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
  "개인회생을 알아보고 있어요",
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
          {loading ? "검색 중..." : "검색"}
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
