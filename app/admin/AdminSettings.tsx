"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FIELDS: { key: string; label: string; help?: string; type?: "url" | "text" }[] = [
  {
    key: "cafe_url",
    label: "네이버 카페 URL",
    type: "url",
    help: "헤더 메뉴, /cafe 페이지, 메인 빠른 메뉴에서 사용",
  },
  {
    key: "shorts_url",
    label: "쇼츠 외부 URL",
    type: "url",
    help: "메인 빠른 메뉴에서 외부 쇼츠 채널로 연결",
  },
  {
    key: "kakao_url",
    label: "카카오톡 채널 URL",
    type: "url",
    help: "/cafe 페이지에서 카카오톡 채널로 연결",
  },
  {
    key: "money_banner_title",
    label: "메인 금전상담 배너 제목",
  },
  {
    key: "money_banner_desc",
    label: "메인 금전상담 배너 설명",
  },
];

export default function AdminSettings({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({ ...settings });
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "저장 실패");
      } else {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-card" onSubmit={save}>
      <h3>외부 링크 · 사이트 문구</h3>
      <p style={{ color: "var(--ink-soft)", margin: "0 0 14px" }}>
        카페·쇼츠·카카오톡 URL과 메인 배너 문구를 한 곳에서 관리합니다.
      </p>

      <div style={{ display: "grid", gap: 14 }}>
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="form-label">{f.label}</label>
            <input
              className="form-input"
              type={f.type === "url" ? "url" : "text"}
              value={form[f.key] || ""}
              onChange={(e) =>
                setForm((s) => ({ ...s, [f.key]: e.target.value }))
              }
              placeholder={
                f.type === "url" ? "https://..." : f.label
              }
              maxLength={500}
            />
            {f.help && <div className="form-help">{f.help}</div>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center" }}>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "저장 중..." : "변경사항 저장"}
        </button>
        {saved && (
          <span style={{ color: "var(--success)", fontWeight: 600 }}>
            ✓ 저장되었습니다
          </span>
        )}
      </div>
    </form>
  );
}
