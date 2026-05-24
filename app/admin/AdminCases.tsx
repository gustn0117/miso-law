"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Case, Category, Subcategory } from "@/lib/db-types";

type Props = {
  cases: Case[];
  categories: Category[];
  subsByCategory: Record<number, Subcategory[]>;
};

const EMPTY = {
  id: 0,
  category_id: 0,
  subcategory_id: "" as number | "",
  title: "",
  excerpt: "",
  body: "",
  published: 1,
};

export default function AdminCases({ cases, categories, subsByCategory }: Props) {
  const router = useRouter();
  const catMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<typeof EMPTY>(EMPTY);
  const [filterCat, setFilterCat] = useState<number | "all">("all");

  const subs = editing.category_id
    ? subsByCategory[editing.category_id] || []
    : [];

  const filtered = cases.filter(
    (c) => filterCat === "all" || c.category_id === filterCat,
  );

  function startNew() {
    setEditing({
      ...EMPTY,
      category_id: categories[0]?.id || 0,
    });
  }
  function startEdit(c: Case) {
    setEditing({
      id: c.id,
      category_id: c.category_id,
      subcategory_id: c.subcategory_id ?? "",
      title: c.title,
      excerpt: c.excerpt || "",
      body: c.body,
      published: c.published,
    });
  }
  function cancel() {
    setEditing(EMPTY);
  }

  async function save() {
    if (!editing.title.trim() || !editing.body.trim() || !editing.category_id) {
      alert("카테고리, 제목, 본문은 필수입니다.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        category_id: editing.category_id,
        subcategory_id: editing.subcategory_id === "" ? null : editing.subcategory_id,
        title: editing.title,
        excerpt: editing.excerpt,
        body: editing.body,
        published: !!editing.published,
      };
      const url = "/api/admin/cases";
      const method = editing.id ? "PATCH" : "POST";
      const body = editing.id
        ? JSON.stringify({ id: editing.id, ...payload })
        : JSON.stringify(payload);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "저장 실패");
      } else {
        cancel();
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: number) {
    if (!confirm("사례글을 삭제할까요?")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/cases?id=${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {/* ----- 편집 영역 ----- */}
      <div className="admin-card">
        <h3>{editing.id ? `사례글 수정 #${editing.id}` : "새 사례글 작성"}</h3>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr 1fr 1fr",
          }}
        >
          <div>
            <label className="form-label">대분류</label>
            <select
              className="form-input"
              value={editing.category_id}
              onChange={(e) =>
                setEditing((s) => ({
                  ...s,
                  category_id: Number(e.target.value),
                  subcategory_id: "",
                }))
              }
            >
              <option value={0}>선택</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">중분류 (선택)</label>
            <select
              className="form-input"
              value={editing.subcategory_id}
              onChange={(e) =>
                setEditing((s) => ({
                  ...s,
                  subcategory_id:
                    e.target.value === "" ? "" : Number(e.target.value),
                }))
              }
              disabled={!editing.category_id || subs.length === 0}
            >
              <option value="">(없음)</option>
              {subs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">공개 여부</label>
            <select
              className="form-input"
              value={editing.published}
              onChange={(e) =>
                setEditing((s) => ({
                  ...s,
                  published: Number(e.target.value),
                }))
              }
            >
              <option value={1}>공개</option>
              <option value={0}>비공개</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label className="form-label">제목</label>
          <input
            className="form-input"
            value={editing.title}
            onChange={(e) =>
              setEditing((s) => ({ ...s, title: e.target.value }))
            }
            maxLength={200}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label className="form-label">요약 (한 줄 안내)</label>
          <input
            className="form-input"
            value={editing.excerpt}
            onChange={(e) =>
              setEditing((s) => ({ ...s, excerpt: e.target.value }))
            }
            maxLength={400}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label className="form-label">본문</label>
          <textarea
            className="form-input"
            style={{ minHeight: 220, resize: "vertical", fontFamily: "inherit" }}
            value={editing.body}
            onChange={(e) =>
              setEditing((s) => ({ ...s, body: e.target.value }))
            }
            placeholder={`마크다운 일부 지원:\n## 소제목\n- 불릿\n1. 번호\n\n빈 줄로 단락 구분.`}
          />
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={save}
            disabled={busy}
          >
            {editing.id ? "수정 저장" : "사례글 등록"}
          </button>
          {editing.id ? (
            <button type="button" className="btn btn-ghost" onClick={cancel}>
              취소
            </button>
          ) : (
            <button type="button" className="btn btn-ghost" onClick={startNew}>
              초기화
            </button>
          )}
        </div>
      </div>

      {/* ----- 목록 ----- */}
      <div className="admin-card">
        <h3>사례글 목록 ({filtered.length})</h3>
        <div style={{ marginBottom: 12 }}>
          <select
            className="form-input"
            style={{ maxWidth: 220 }}
            value={filterCat}
            onChange={(e) =>
              setFilterCat(
                e.target.value === "all" ? "all" : Number(e.target.value),
              )
            }
          >
            <option value="all">전체 카테고리</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">등록된 사례글이 없습니다.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>카테고리</th>
                  <th>제목</th>
                  <th>공개</th>
                  <th>조회</th>
                  <th>등록일</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td>{catMap.get(c.category_id)?.name || "-"}</td>
                    <td style={{ fontWeight: 600 }}>{c.title}</td>
                    <td>
                      <span
                        className={`status-pill ${c.published ? "status-contacted" : "status-closed"}`}
                      >
                        {c.published ? "공개" : "비공개"}
                      </span>
                    </td>
                    <td>{c.view_count}</td>
                    <td>{c.created_at.slice(0, 10)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ padding: "6px 10px", minHeight: 34 }}
                          onClick={() => startEdit(c)}
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{
                            color: "var(--danger)",
                            padding: "6px 10px",
                            minHeight: 34,
                          }}
                          onClick={() => remove(c.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
