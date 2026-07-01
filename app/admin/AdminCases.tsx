"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Case, Category, Subcategory } from "@/lib/db-types";
import { CASE_RESULTS } from "@/lib/case-results";

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
  image_url: "",
  case_no: "",
  case_url: "",
  result: "",
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  // 처리결과: 프리셋에 없는 값이면 "직접 입력" 모드
  const [resultCustom, setResultCustom] = useState(false);

  function onImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    if (!f) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert("이미지는 5MB 이하여야 합니다.");
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  }
  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  }

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
    setResultCustom(false);
  }
  function startEdit(c: Case) {
    setEditing({
      id: c.id,
      category_id: c.category_id,
      subcategory_id: c.subcategory_id ?? "",
      title: c.title,
      excerpt: c.excerpt || "",
      body: c.body,
      image_url: c.image_url || "",
      case_no: c.case_no || "",
      case_url: c.case_url || "",
      result: c.result || "",
      published: c.published,
    });
    setResultCustom(
      !!c.result && !CASE_RESULTS.includes(c.result as (typeof CASE_RESULTS)[number]),
    );
    clearImage();
  }
  function cancel() {
    setEditing(EMPTY);
    setResultCustom(false);
    clearImage();
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
        subcategory_id:
          editing.subcategory_id === "" ? null : editing.subcategory_id,
        title: editing.title,
        excerpt: editing.excerpt,
        body: editing.body,
        image_url: editing.image_url,
        case_no: editing.case_no,
        case_url: editing.case_url,
        result: editing.result,
        published: !!editing.published,
      };

      let res: Response;
      if (editing.id) {
        // 수정 — 기존 JSON PATCH (image_url 갱신은 URL 입력만 지원)
        res = await fetch("/api/admin/cases", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
      } else if (imageFile) {
        // 신규 + 파일 첨부 — multipart
        const fd = new FormData();
        fd.set("category_id", String(payload.category_id));
        if (payload.subcategory_id !== null)
          fd.set("subcategory_id", String(payload.subcategory_id));
        fd.set("title", payload.title);
        fd.set("excerpt", payload.excerpt);
        fd.set("body", payload.body);
        fd.set("published", payload.published ? "1" : "0");
        fd.set("image_file", imageFile);
        if (payload.image_url) fd.set("image_url", payload.image_url);
        if (payload.case_no) fd.set("case_no", payload.case_no);
        if (payload.case_url) fd.set("case_url", payload.case_url);
        if (payload.result) fd.set("result", payload.result);
        res = await fetch("/api/admin/cases", { method: "POST", body: fd });
      } else {
        // 신규 + URL만 — JSON POST
        res = await fetch("/api/admin/cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

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
        {/* 대표 이미지 — 파일 업로드 또는 외부 URL (수정 시에는 URL만) */}
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid rgb(var(--c-line))",
            background: "rgb(var(--c-bg))",
            display: "grid",
            gridTemplateColumns: editing.id ? "1fr" : "auto 1fr 1fr",
            gap: 12,
            alignItems: "center",
          }}
        >
          {!editing.id && (
            <div>
              <label
                className="form-label"
                style={{ marginBottom: 6, display: "block" }}
              >
                대표 이미지
              </label>
              {imagePreview ? (
                <div style={{ position: "relative", width: 120, height: 90 }}>
                  <img
                    src={imagePreview}
                    alt="preview"
                    style={{
                      width: 120,
                      height: 90,
                      objectFit: "cover",
                      border: "1px solid rgb(var(--c-line))",
                    }}
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "rgb(var(--c-fg))",
                      color: "rgb(var(--c-bg))",
                      border: 0,
                      cursor: "pointer",
                      fontSize: 14,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : editing.image_url ? (
                <img
                  src={editing.image_url}
                  alt=""
                  style={{
                    width: 120,
                    height: 90,
                    objectFit: "cover",
                    border: "1px solid rgb(var(--c-line))",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 120,
                    height: 90,
                    border: "1px dashed rgb(var(--c-line))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: "rgb(var(--c-muted))",
                  }}
                >
                  미리보기
                </div>
              )}
            </div>
          )}
          {!editing.id && (
            <div>
              <label
                className="form-label"
                style={{ marginBottom: 6, display: "block" }}
              >
                파일 업로드 <span style={{ color: "rgb(var(--c-muted))" }}>(JPG/PNG/WEBP · 5MB↓)</span>
              </label>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onImageFile}
                style={{ fontSize: 13 }}
              />
            </div>
          )}
          <div>
            <label
              className="form-label"
              style={{ marginBottom: 6, display: "block" }}
            >
              {editing.id
                ? "이미지 URL (수정은 외부 URL만 가능)"
                : "또는 외부 URL"}
            </label>
            <input
              className="form-input"
              placeholder="https://..."
              value={editing.image_url}
              onChange={(e) =>
                setEditing((s) => ({ ...s, image_url: e.target.value }))
              }
              maxLength={500}
              disabled={!editing.id && !!imageFile}
              style={!editing.id && imageFile ? { opacity: 0.5 } : undefined}
            />
          </div>
        </div>

        {/* 판례 정보 — 사건번호 / 원문 링크 / 처리결과 (모두 선택) */}
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid rgb(var(--c-line))",
            background: "rgb(var(--c-bg))",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
            alignItems: "start",
          }}
        >
          <div>
            <label className="form-label">사건번호 (선택)</label>
            <input
              className="form-input"
              placeholder="예: 대법원 2023다307116"
              value={editing.case_no}
              onChange={(e) =>
                setEditing((s) => ({ ...s, case_no: e.target.value }))
              }
              maxLength={120}
            />
          </div>
          <div>
            <label className="form-label">
              사건 링크 <span style={{ color: "rgb(var(--c-muted))" }}>(선택)</span>
            </label>
            <input
              className="form-input"
              placeholder="https://..."
              value={editing.case_url}
              onChange={(e) =>
                setEditing((s) => ({ ...s, case_url: e.target.value }))
              }
              maxLength={500}
            />
          </div>
          <div>
            <label className="form-label">처리결과 (선택)</label>
            <select
              className="form-input"
              value={resultCustom ? "__custom__" : editing.result}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "__custom__") {
                  setResultCustom(true);
                  setEditing((s) => ({ ...s, result: "" }));
                } else {
                  setResultCustom(false);
                  setEditing((s) => ({ ...s, result: v }));
                }
              }}
            >
              <option value="">(없음)</option>
              {CASE_RESULTS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="__custom__">직접 입력…</option>
            </select>
            {resultCustom && (
              <input
                className="form-input"
                style={{ marginTop: 8 }}
                placeholder="처리결과 직접 입력"
                value={editing.result}
                onChange={(e) =>
                  setEditing((s) => ({ ...s, result: e.target.value }))
                }
                maxLength={40}
              />
            )}
          </div>
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
