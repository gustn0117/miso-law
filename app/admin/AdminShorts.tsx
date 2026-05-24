"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Category, Short } from "@/lib/db-types";

type Props = { shorts: Short[]; categories: Category[] };

export default function AdminShorts({ shorts, categories }: Props) {
  const router = useRouter();
  const catMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    url: "",
    category_id: "" as number | "",
    thumbnail_url: "",
    sort_order: 0,
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/shorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "추가 실패");
      } else {
        setForm({
          title: "",
          url: "",
          category_id: "",
          thumbnail_url: "",
          sort_order: 0,
        });
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: number) {
    if (!confirm("쇼츠를 삭제할까요?")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/shorts?id=${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form className="admin-card" onSubmit={add}>
        <h3>새 쇼츠 등록</h3>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr 2fr 1fr 1fr 80px",
          }}
        >
          <select
            className="form-input"
            value={form.category_id}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                category_id: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
          >
            <option value="">전체 (분류 없음)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            className="form-input"
            placeholder="제목"
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            maxLength={200}
          />
          <input
            className="form-input"
            placeholder="https://youtube.com/shorts/..."
            value={form.url}
            onChange={(e) => setForm((s) => ({ ...s, url: e.target.value }))}
            maxLength={500}
          />
          <input
            className="form-input"
            placeholder="썸네일 URL (선택)"
            value={form.thumbnail_url}
            onChange={(e) =>
              setForm((s) => ({ ...s, thumbnail_url: e.target.value }))
            }
            maxLength={500}
          />
          <input
            className="form-input"
            type="number"
            value={form.sort_order}
            onChange={(e) =>
              setForm((s) => ({ ...s, sort_order: Number(e.target.value) || 0 }))
            }
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            등록
          </button>
        </div>
      </form>

      <div className="admin-card">
        <h3>쇼츠 목록 ({shorts.length})</h3>
        {shorts.length === 0 ? (
          <div className="empty-state">등록된 쇼츠가 없습니다.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>카테고리</th>
                  <th>제목</th>
                  <th>URL</th>
                  <th>정렬</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {shorts.map((s) => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td>{s.category_id ? catMap.get(s.category_id) : "전체"}</td>
                    <td style={{ fontWeight: 600 }}>{s.title}</td>
                    <td>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--brand)" }}
                      >
                        새 창 보기 →
                      </a>
                    </td>
                    <td>{s.sort_order}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{
                          color: "var(--danger)",
                          padding: "6px 10px",
                          minHeight: 34,
                        }}
                        onClick={() => remove(s.id)}
                      >
                        삭제
                      </button>
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
