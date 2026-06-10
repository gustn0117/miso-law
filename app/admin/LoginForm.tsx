"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErr(data.error || "로그인 실패");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setErr("네트워크 오류");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "var(--bg-soft)",
      }}
    >
      <form
        onSubmit={onSubmit}
        className="admin-card"
        style={{ width: "100%", maxWidth: 380 }}
      >
        <h1
          style={{
            margin: "0 0 4px",
            fontSize: 20,
            color: "var(--brand)",
            textAlign: "center",
          }}
        >
          미소 법률 · 금융 상담 관리자
        </h1>
        <p
          style={{
            margin: "0 0 18px",
            fontSize: 13,
            color: "var(--ink-mute)",
            textAlign: "center",
          }}
        >
          관리자 비밀번호로 로그인하세요
        </p>
        <label className="form-label" htmlFor="adm-pw">
          비밀번호
        </label>
        <input
          id="adm-pw"
          type="password"
          className="form-input"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoFocus
          autoComplete="current-password"
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ marginTop: 14, width: "100%", minHeight: 50 }}
          disabled={loading || !pw}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
        {err && (
          <div className="form-status error" role="alert">
            {err}
          </div>
        )}
      </form>
    </div>
  );
}
