"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, ReviewWithAuthor } from "@/lib/db-types";

type Props = {
  reviews: ReviewWithAuthor[];
  categories: Category[];
};

type StatusFilter = "all" | "게시" | "숨김";

export default function AdminReviews({ reviews, categories }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const catName = useMemo(
    () => new Map(categories.map((c) => [c.slug, c.name])),
    [categories],
  );

  const filtered = reviews.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    const hay = `${r.title} ${r.content} ${r.author_name || ""}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });

  async function toggleStatus(r: ReviewWithAuthor) {
    const next = r.status === "게시" ? "숨김" : "게시";
    setBusy(true);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id, status: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "상태 변경 실패");
      } else {
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("이 후기를 완전히 삭제할까요? 되돌릴 수 없습니다.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "삭제 실패");
      } else {
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  const hiddenCount = reviews.filter((r) => r.status === "숨김").length;

  return (
    <div className="admin-card">
      <h3>
        후기글 ({filtered.length} / {reviews.length})
        {hiddenCount > 0 && (
          <span style={{ fontSize: 13, color: "var(--ink-mute)", fontWeight: 400 }}>
            {" "}
            · 숨김 {hiddenCount}
          </span>
        )}
      </h3>
      <p style={{ fontSize: 13, color: "var(--ink-mute)", marginBottom: 12 }}>
        &quot;숨김&quot; 처리한 후기는 공개 후기 페이지에서 사라지며, 데이터는 보존되어 언제든 다시 게시할 수 있습니다.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <select
          className="form-input"
          style={{ maxWidth: 160 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="all">전체 상태</option>
          <option value="게시">게시중</option>
          <option value="숨김">숨김</option>
        </select>
        <input
          className="form-input"
          style={{ maxWidth: 320 }}
          placeholder="제목·내용·작성자 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">표시할 후기가 없습니다.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>작성자</th>
                <th>평점</th>
                <th>제목 / 내용</th>
                <th>분야</th>
                <th>상태</th>
                <th>작성일</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const rating = Math.max(1, Math.min(5, r.rating));
                const hidden = r.status === "숨김";
                return (
                  <tr key={r.id} style={hidden ? { opacity: 0.55 } : undefined}>
                    <td>#{r.id}</td>
                    <td style={{ fontWeight: 600 }}>{r.author_name || "탈퇴회원"}</td>
                    <td
                      style={{
                        color: "var(--brand-accent)",
                        letterSpacing: 1,
                        whiteSpace: "nowrap",
                      }}
                      aria-label={`별점 ${rating}점`}
                    >
                      {"★".repeat(rating)}
                      <span style={{ color: "var(--ink-mute)" }}>
                        {"☆".repeat(5 - rating)}
                      </span>
                    </td>
                    <td style={{ maxWidth: 340 }}>
                      <div style={{ fontWeight: 600 }}>{r.title}</div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: "var(--ink-mute)",
                          marginTop: 2,
                          lineHeight: 1.5,
                        }}
                      >
                        {r.content.length > 90
                          ? `${r.content.slice(0, 90)}…`
                          : r.content}
                      </div>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {r.category_slug
                        ? catName.get(r.category_slug) || r.category_slug
                        : "-"}
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 9px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          color: hidden ? "var(--ink-mute)" : "var(--brand)",
                          border: `1px solid ${
                            hidden ? "rgb(var(--c-line))" : "var(--brand)"
                          }`,
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {r.created_at.slice(0, 10)}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ padding: "6px 10px", minHeight: 34 }}
                          onClick={() => toggleStatus(r)}
                          disabled={busy}
                        >
                          {hidden ? "게시" : "숨김"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{
                            color: "var(--danger)",
                            padding: "6px 10px",
                            minHeight: 34,
                          }}
                          onClick={() => remove(r.id)}
                          disabled={busy}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
