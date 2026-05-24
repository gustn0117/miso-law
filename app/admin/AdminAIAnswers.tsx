"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AIAnswer, Category } from "@/lib/db-types";

type Props = { aiAnswers: AIAnswer[]; categories: Category[] };

const EMPTY = {
  id: 0,
  keyword: "",
  category_slug: "",
  summary: "",
  bullets: "",
  next_steps: "",
  priority: 50,
};

function parseList(json: string): string[] {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default function AdminAIAnswers({ aiAnswers, categories }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(EMPTY);

  function startEdit(a: AIAnswer) {
    setEditing({
      id: a.id,
      keyword: a.keyword,
      category_slug: a.category_slug || "",
      summary: a.summary,
      bullets: parseList(a.bullets).join("\n"),
      next_steps: parseList(a.next_steps || "[]").join("\n"),
      priority: a.priority,
    });
  }
  function reset() {
    setEditing(EMPTY);
  }

  async function save() {
    if (!editing.keyword.trim() || !editing.summary.trim()) {
      alert("키워드와 요약은 필수입니다.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        keyword: editing.keyword,
        category_slug: editing.category_slug || null,
        summary: editing.summary,
        bullets: editing.bullets,
        next_steps: editing.next_steps,
        priority: editing.priority,
      };
      const res = await fetch("/api/admin/ai-answers", {
        method: editing.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: editing.id
          ? JSON.stringify({ id: editing.id, ...payload })
          : JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "저장 실패");
      } else {
        reset();
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: number) {
    if (!confirm("AI 답변 세트를 삭제할까요?")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/ai-answers?id=${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="admin-card" style={{ background: "var(--bg-cream)" }}>
        <h3>AI 답변 관리 안내</h3>
        <ul
          style={{
            paddingLeft: 18,
            color: "var(--ink-soft)",
            margin: 0,
            lineHeight: 1.8,
          }}
        >
          <li>
            검색어가 <strong>키워드를 포함</strong>하면 이 답변이 우선 출력됩니다.
          </li>
          <li>
            여러 매칭 시 <strong>priority 값이 높은 답변</strong>이 선택됩니다.
            (기본 50, 권장 50~100)
          </li>
          <li>금지어가 포함되면 자동으로 완곡 표현으로 치환됩니다.</li>
          <li>등록 안 된 키워드는 카테고리별 기본 안내문이 사용됩니다.</li>
        </ul>
      </div>

      <div className="admin-card">
        <h3>{editing.id ? `답변 수정 #${editing.id}` : "새 답변 등록"}</h3>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "2fr 2fr 100px",
          }}
        >
          <div>
            <label className="form-label">키워드</label>
            <input
              className="form-input"
              value={editing.keyword}
              onChange={(e) =>
                setEditing((s) => ({ ...s, keyword: e.target.value }))
              }
              placeholder="예: 보이스피싱"
            />
          </div>
          <div>
            <label className="form-label">카테고리 (검색결과 추천)</label>
            <select
              className="form-input"
              value={editing.category_slug}
              onChange={(e) =>
                setEditing((s) => ({ ...s, category_slug: e.target.value }))
              }
            >
              <option value="">자동(미지정)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">priority</label>
            <input
              type="number"
              className="form-input"
              value={editing.priority}
              onChange={(e) =>
                setEditing((s) => ({
                  ...s,
                  priority: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label className="form-label">요약 (한두 문장)</label>
          <textarea
            className="form-input"
            value={editing.summary}
            onChange={(e) =>
              setEditing((s) => ({ ...s, summary: e.target.value }))
            }
            style={{ minHeight: 80, resize: "vertical" }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr 1fr",
            marginTop: 12,
          }}
        >
          <div>
            <label className="form-label">불릿 안내 (줄바꿈으로 구분)</label>
            <textarea
              className="form-input"
              value={editing.bullets}
              onChange={(e) =>
                setEditing((s) => ({ ...s, bullets: e.target.value }))
              }
              style={{ minHeight: 120, resize: "vertical" }}
              placeholder={"한 줄에 하나씩 적어주세요\n- 처럼 시작해도 OK"}
            />
          </div>
          <div>
            <label className="form-label">다음 단계 버튼 (줄바꿈)</label>
            <textarea
              className="form-input"
              value={editing.next_steps}
              onChange={(e) =>
                setEditing((s) => ({ ...s, next_steps: e.target.value }))
              }
              style={{ minHeight: 120, resize: "vertical" }}
              placeholder={"관련 사례 보기\n상담 신청하기\n관련 쇼츠 보기"}
            />
          </div>
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={save}
            disabled={busy}
          >
            {editing.id ? "수정 저장" : "답변 등록"}
          </button>
          {editing.id && (
            <button type="button" className="btn btn-ghost" onClick={reset}>
              취소
            </button>
          )}
        </div>
      </div>

      <div className="admin-card">
        <h3>등록된 AI 답변 ({aiAnswers.length})</h3>
        {aiAnswers.length === 0 ? (
          <div className="empty-state">등록된 답변 세트가 없습니다.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>키워드</th>
                  <th>카테고리</th>
                  <th>priority</th>
                  <th>요약</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {aiAnswers.map((a) => (
                  <tr key={a.id}>
                    <td>#{a.id}</td>
                    <td style={{ fontWeight: 700, color: "var(--brand)" }}>
                      {a.keyword}
                    </td>
                    <td>{a.category_slug || "자동"}</td>
                    <td>{a.priority}</td>
                    <td
                      style={{
                        maxWidth: 380,
                        color: "var(--ink-soft)",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {a.summary}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ padding: "6px 10px", minHeight: 34 }}
                          onClick={() => startEdit(a)}
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
                          onClick={() => remove(a.id)}
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
