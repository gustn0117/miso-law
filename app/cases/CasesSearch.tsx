"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Close } from "../components/icons";

export type CaseListItem = {
  id: number;
  title: string;
  excerpt: string | null;
  categoryName: string;
  viewCount: number;
  createdAt: string;
};

/**
 * 사례 목록을 제목·발췌·분야명 기준으로 실시간 필터링한다.
 * 이미 서버에서 내려온 published 사례만 다루므로 별도 요청 없이
 * 클라이언트에서 즉시 걸러낸다(데이터 저장이 아닌 읽기 전용 필터).
 */
export default function CasesSearch({ cases }: { cases: CaseListItem[] }) {
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const hasQuery = query.length > 0;

  const filtered = useMemo(() => {
    if (!query) return cases;
    return cases.filter((c) =>
      `${c.title} ${c.excerpt ?? ""} ${c.categoryName}`
        .toLowerCase()
        .includes(query),
    );
  }, [cases, query]);

  return (
    <>
      <form
        className="cases-search"
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="cases-search__field">
          <Search size={20} className="cases-search__icon" />
          <input
            type="search"
            inputMode="search"
            placeholder="제목·키워드·분야로 검색"
            aria-label="사례 검색"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            maxLength={100}
            autoComplete="off"
          />
          {hasQuery && (
            <button
              type="button"
              className="cases-search__clear"
              aria-label="검색어 지우기"
              onClick={() => setQ("")}
            >
              <Close size={18} />
            </button>
          )}
        </div>
        <p className="cases-search__count" aria-live="polite">
          {hasQuery
            ? `“${q.trim()}” 검색 결과 ${filtered.length}건`
            : `전체 ${cases.length}건`}
        </p>
      </form>

      {filtered.length === 0 ? (
        <div className="empty-state">
          “{q.trim()}”에 대한 검색 결과가 없습니다. 다른 키워드로 검색해 보세요.
        </div>
      ) : (
        <div className="case-list">
          {filtered.map((c) => (
            <Link key={c.id} href={`/case/${c.id}`} className="case-card">
              <div className="tag">{c.categoryName}</div>
              <div className="title">{c.title}</div>
              <div className="excerpt">{c.excerpt}</div>
              <div className="meta">
                <span>조회 {c.viewCount}</span>
                <span>·</span>
                <span>{c.createdAt.slice(0, 10)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
