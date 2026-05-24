"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Subcategory } from "@/lib/db-types";

type Props = {
  categories: Category[];
  subsByCategory: Record<number, Subcategory[]>;
};

export default function AdminCategories({ categories, subsByCategory }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [addForm, setAddForm] = useState<{
    [cid: number]: { name: string; slug: string };
  }>({});

  async function addSub(cid: number) {
    const f = addForm[cid] || { name: "", slug: "" };
    if (!f.name.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_id: cid, name: f.name, slug: f.slug }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "중분류 추가 실패");
      } else {
        setAddForm((m) => ({ ...m, [cid]: { name: "", slug: "" } }));
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }
  async function removeSub(id: number) {
    if (!confirm("중분류를 삭제할까요? 연결된 사례글은 분류만 해제됩니다."))
      return;
    setBusy(true);
    try {
      await fetch(`/api/admin/subcategories?id=${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="admin-card" style={{ background: "var(--bg-cream)" }}>
        <h3>카테고리 구조 안내</h3>
        <p style={{ color: "var(--ink-soft)", margin: "0 0 6px" }}>
          대분류 8개는 시스템 기본이며 변경되지 않습니다. 각 대분류 아래의
          <strong> 중분류를 추가/삭제</strong>할 수 있고, 중분류 단위로 사례글을
          연결할 수 있습니다.
        </p>
      </div>

      {categories.map((c) => {
        const subs = subsByCategory[c.id] || [];
        const f = addForm[c.id] || { name: "", slug: "" };
        return (
          <div key={c.id} className="admin-card">
            <h3>
              {c.emoji} {c.name}{" "}
              <span
                style={{ fontSize: 13, color: "var(--ink-mute)", fontWeight: 500 }}
              >
                /category/{c.slug}
              </span>
            </h3>
            {subs.length === 0 ? (
              <div className="empty-state" style={{ marginBottom: 12 }}>
                중분류가 없습니다. 아래에서 추가하세요.
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                {subs.map((s) => (
                  <span
                    key={s.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "var(--brand-soft)",
                      color: "var(--brand)",
                      padding: "6px 12px",
                      borderRadius: 999,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {s.name}
                    <button
                      type="button"
                      aria-label={`${s.name} 삭제`}
                      onClick={() => removeSub(s.id)}
                      style={{
                        background: "transparent",
                        border: 0,
                        color: "var(--brand-dark)",
                        padding: 0,
                        fontSize: 14,
                      }}
                      disabled={busy}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gap: 8,
                gridTemplateColumns: "1fr 1fr auto",
              }}
            >
              <input
                className="form-input"
                placeholder="중분류 이름 (예: 전세사기)"
                value={f.name}
                onChange={(e) =>
                  setAddForm((m) => ({
                    ...m,
                    [c.id]: { ...f, name: e.target.value },
                  }))
                }
              />
              <input
                className="form-input"
                placeholder="slug (영문/숫자/한글, 미입력 시 자동)"
                value={f.slug}
                onChange={(e) =>
                  setAddForm((m) => ({
                    ...m,
                    [c.id]: { ...f, slug: e.target.value },
                  }))
                }
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => addSub(c.id)}
                disabled={busy || !f.name.trim()}
              >
                추가
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
