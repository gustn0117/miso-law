"use client";

import { useMemo, useRef, useState } from "react";
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
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setError(null);
    if (!file) {
      setThumbFile(null);
      setThumbPreview(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("썸네일은 5MB 이하여야 합니다.");
      setThumbFile(null);
      setThumbPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  }

  function clearThumb() {
    setThumbFile(null);
    setThumbPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onVideoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setError(null);
    if (!file) {
      setVideoFile(null);
      setVideoFileName(null);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("영상은 50MB 이하여야 합니다.");
      setVideoFile(null);
      setVideoFileName(null);
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }
    setVideoFile(file);
    setVideoFileName(
      `${file.name} · ${(file.size / (1024 * 1024)).toFixed(1)}MB`,
    );
  }

  function clearVideo() {
    setVideoFile(null);
    setVideoFileName(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError("제목을 입력해 주세요.");
      return;
    }
    if (!form.url.trim() && !videoFile) {
      setError("외부 URL 또는 영상 파일 중 하나는 필수입니다.");
      return;
    }
    setBusy(true);
    try {
      // 파일(썸네일 또는 영상) 있으면 multipart, 없으면 JSON
      let res: Response;
      if (thumbFile || videoFile) {
        const fd = new FormData();
        fd.set("title", form.title);
        fd.set("url", form.url);
        if (form.category_id !== "") {
          fd.set("category_id", String(form.category_id));
        }
        fd.set("sort_order", String(form.sort_order));
        if (thumbFile) fd.set("thumbnail_file", thumbFile);
        if (videoFile) fd.set("video_file", videoFile);
        if (form.thumbnail_url) fd.set("thumbnail_url", form.thumbnail_url);
        res = await fetch("/api/admin/shorts", { method: "POST", body: fd });
      } else {
        res = await fetch("/api/admin/shorts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "추가 실패");
      } else {
        setForm({
          title: "",
          url: "",
          category_id: "",
          thumbnail_url: "",
          sort_order: 0,
        });
        clearThumb();
        clearVideo();
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "네트워크 오류");
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
            gridTemplateColumns: "1fr 2fr 1fr 80px",
            marginTop: 12,
          }}
        >
          <select
            className="form-input"
            value={form.category_id}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                category_id:
                  e.target.value === "" ? "" : Number(e.target.value),
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
            type="number"
            value={form.sort_order}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                sort_order: Number(e.target.value) || 0,
              }))
            }
          />
        </div>

        {/* 썸네일 입력 — 파일 업로드 또는 URL */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr 1fr",
            gap: 12,
            alignItems: "center",
            marginTop: 12,
            padding: 12,
            border: "1px solid rgb(var(--c-line))",
            background: "rgb(var(--c-bg))",
          }}
        >
          <div>
            <label
              className="form-label"
              style={{ marginBottom: 6, display: "block" }}
            >
              썸네일 이미지
            </label>
            {thumbPreview ? (
              <div style={{ position: "relative", width: 90, height: 120 }}>
                <img
                  src={thumbPreview}
                  alt="preview"
                  style={{
                    width: 90,
                    height: 120,
                    objectFit: "cover",
                    border: "1px solid rgb(var(--c-line))",
                  }}
                />
                <button
                  type="button"
                  onClick={clearThumb}
                  title="제거"
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
            ) : (
              <div
                style={{
                  width: 90,
                  height: 120,
                  border: "1px dashed rgb(var(--c-line))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  color: "rgb(var(--c-muted))",
                  textAlign: "center",
                  padding: 6,
                }}
              >
                9:16
                <br />
                미리보기
              </div>
            )}
          </div>
          <div>
            <label
              className="form-label"
              style={{ marginBottom: 6, display: "block" }}
            >
              파일 업로드 <span style={{ color: "rgb(var(--c-muted))" }}>(권장 · JPG/PNG/WEBP · 2MB↓)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFile}
              style={{ fontSize: 13 }}
            />
          </div>
          <div>
            <label
              className="form-label"
              style={{ marginBottom: 6, display: "block" }}
            >
              또는 외부 URL <span style={{ color: "rgb(var(--c-muted))" }}>(파일 미선택 시)</span>
            </label>
            <input
              className="form-input"
              placeholder="https://..."
              value={form.thumbnail_url}
              onChange={(e) =>
                setForm((s) => ({ ...s, thumbnail_url: e.target.value }))
              }
              maxLength={500}
              disabled={!!thumbFile}
              style={thumbFile ? { opacity: 0.5 } : undefined}
            />
          </div>
        </div>

        {/* 영상 파일 업로드 (50MB) — 외부 URL 대신 자체 호스팅 */}
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid rgb(var(--c-line))",
            background: "rgb(var(--c-bg))",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div>
            <label
              className="form-label"
              style={{ marginBottom: 6, display: "block" }}
            >
              영상 파일 업로드{" "}
              <span style={{ color: "rgb(var(--c-muted))" }}>
                (MP4/WEBM/MOV/M4V · 50MB↓ · 9:16 권장)
              </span>
            </label>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
              onChange={onVideoFile}
              style={{ fontSize: 13 }}
            />
            {videoFileName && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: "rgb(var(--c-muted))",
                }}
              >
                선택됨: {videoFileName}
              </div>
            )}
          </div>
          {videoFile && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={clearVideo}
              style={{ minHeight: 36, padding: "6px 14px" }}
            >
              제거
            </button>
          )}
        </div>

        {error && (
          <div className="form-status error" style={{ marginTop: 12 }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "등록 중..." : "등록"}
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
                  <th>썸네일</th>
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
                    <td>
                      {s.thumbnail_url ? (
                        <img
                          src={s.thumbnail_url}
                          alt=""
                          style={{
                            width: 36,
                            height: 48,
                            objectFit: "cover",
                            border: "1px solid rgb(var(--c-line))",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 36,
                            height: 48,
                            background: "rgb(var(--c-line))",
                          }}
                        />
                      )}
                    </td>
                    <td>{s.category_id ? catMap.get(s.category_id) : "전체"}</td>
                    <td style={{ fontWeight: 600 }}>{s.title}</td>
                    <td>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "rgb(var(--c-fg))",
                          textDecoration: "underline",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        새 창 보기
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <line x1="7" y1="17" x2="17" y2="7" />
                          <polyline points="9 7 17 7 17 15" />
                        </svg>
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
