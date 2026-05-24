"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BannedWord } from "@/lib/db-types";

export default function AdminBanned({ items }: { items: BannedWord[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [word, setWord] = useState("");
  const [note, setNote] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!word.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/banned-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, note }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "추가 실패");
      } else {
        setWord("");
        setNote("");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: number) {
    if (!confirm("이 금지어를 삭제할까요?")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/banned-words?id=${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form className="admin-card" onSubmit={add}>
        <h3>새 금지어 등록</h3>
        <p style={{ color: "var(--ink-soft)", margin: "0 0 12px" }}>
          AI 답변에서 이 표현이 등장하면 자동으로 &quot;[정확한 판단은 전문가
          상담이 필요합니다]&quot; 로 치환됩니다.
        </p>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr 1fr auto",
          }}
        >
          <input
            className="form-input"
            placeholder="금지 표현 (예: 무조건 승소)"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            maxLength={100}
          />
          <input
            className="form-input"
            placeholder="비고 (선택)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={300}
          />
          <button type="submit" className="btn btn-primary" disabled={busy || !word.trim()}>
            추가
          </button>
        </div>
      </form>

      <div className="admin-card">
        <h3>등록된 금지어 ({items.length})</h3>
        {items.length === 0 ? (
          <div className="empty-state">등록된 금지어가 없습니다.</div>
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {items.map((b) => (
              <span
                key={b.id}
                title={b.note || ""}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#fdecec",
                  color: "var(--danger)",
                  padding: "6px 12px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {b.word}
                <button
                  type="button"
                  aria-label={`${b.word} 삭제`}
                  onClick={() => remove(b.id)}
                  style={{
                    background: "transparent",
                    border: 0,
                    color: "#a32525",
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
      </div>
    </div>
  );
}
