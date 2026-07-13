"use client";

import { useState } from "react";
import Link from "next/link";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; msg: string }
  | { kind: "success" };

export default function FindPasswordForm() {
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    if (status.kind === "error") setStatus({ kind: "idle" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status.kind === "loading") return;

    if (!form.phone.trim() && !form.email.trim()) {
      setStatus({
        kind: "error",
        msg: "전화번호 또는 이메일 중 하나 이상을 입력해 주세요.",
      });
      return;
    }

    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/auth/find-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({
          kind: "error",
          msg: data.error || "요청에 실패했습니다.",
        });
        return;
      }
      setStatus({ kind: "success" });
    } catch {
      setStatus({ kind: "error", msg: "네트워크 오류가 발생했습니다." });
    }
  }

  if (status.kind === "success") {
    return (
      <div className="admin-card">
        <h3 style={{ marginTop: 0 }}>요청이 접수되었습니다</h3>
        <p style={{ color: "var(--ink-soft)", lineHeight: 1.7, fontSize: 14 }}>
          관리자가 본인 확인 후 등록된 연락처로 임시 비밀번호를 안내해
          드립니다. 임시 비밀번호로 로그인하신 뒤 마이페이지 &gt; 계정
          설정에서 새 비밀번호로 변경해 주세요.
        </p>
        <Link
          href="/login"
          className="btn btn-primary"
          style={{ marginTop: 8 }}
        >
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <form className="admin-card" onSubmit={onSubmit} noValidate>
      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <label className="form-label" htmlFor="fp-name">
            이름 (선택)
          </label>
          <input
            id="fp-name"
            className="form-input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            autoComplete="name"
          />
        </div>
        <div>
          <label className="form-label" htmlFor="fp-phone">
            휴대폰 번호
          </label>
          <input
            id="fp-phone"
            className="form-input"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="010-1234-5678"
            autoComplete="tel"
          />
        </div>
        <div>
          <label className="form-label" htmlFor="fp-email">
            이메일
          </label>
          <input
            id="fp-email"
            className="form-input"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
          />
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-mute)" }}>
          전화번호 또는 이메일 중 하나만 입력하셔도 됩니다.
        </p>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status.kind === "loading"}
        style={{ marginTop: 18, width: "100%", minHeight: 50, fontSize: 16 }}
      >
        {status.kind === "loading" ? "접수 중..." : "비밀번호 재설정 요청"}
      </button>

      {status.kind === "error" && (
        <div className="form-status error" role="alert">
          {status.msg}
        </div>
      )}

      <div
        style={{
          marginTop: 14,
          textAlign: "center",
          color: "var(--ink-mute)",
          fontSize: 14,
        }}
      >
        <Link href="/login" style={{ color: "var(--brand)", fontWeight: 600 }}>
          로그인으로 돌아가기
        </Link>
      </div>
    </form>
  );
}
