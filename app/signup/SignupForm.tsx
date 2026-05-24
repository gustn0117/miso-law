"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; msg: string };

export default function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    passwordConfirm: "",
    agree: false,
  });
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status.kind === "loading") return;
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({ kind: "error", msg: data.error || "가입에 실패했습니다." });
        return;
      }
      router.replace("/mypage");
      router.refresh();
    } catch {
      setStatus({ kind: "error", msg: "네트워크 오류가 발생했습니다." });
    }
  }

  return (
    <form className="admin-card" onSubmit={onSubmit} noValidate>
      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <label className="form-label form-required" htmlFor="sg-name">
            이름
          </label>
          <input
            id="sg-name"
            className="form-input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            autoComplete="name"
            required
          />
        </div>
        <div>
          <label className="form-label form-required" htmlFor="sg-phone">
            휴대폰 번호 (아이디)
          </label>
          <input
            id="sg-phone"
            className="form-input"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="010-1234-5678"
            autoComplete="tel"
            required
          />
        </div>
        <div>
          <label className="form-label" htmlFor="sg-email">
            이메일 (선택)
          </label>
          <input
            id="sg-email"
            className="form-input"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="form-label form-required" htmlFor="sg-pw">
            비밀번호 (6자 이상)
          </label>
          <input
            id="sg-pw"
            className="form-input"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div>
          <label className="form-label form-required" htmlFor="sg-pw2">
            비밀번호 확인
          </label>
          <input
            id="sg-pw2"
            className="form-input"
            type="password"
            value={form.passwordConfirm}
            onChange={(e) => update("passwordConfirm", e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
      </div>

      <label
        style={{
          marginTop: 16,
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          fontSize: 13,
          color: "var(--ink-soft)",
          lineHeight: 1.7,
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={form.agree}
          onChange={(e) => update("agree", e.target.checked)}
          style={{ marginTop: 4, width: 18, height: 18 }}
        />
        <span>
          <strong>(필수) 개인정보 수집·이용 동의</strong> — 회원 식별 및 상담
          연결에 사용됩니다. 본 플랫폼은 직접 법률 자문을 제공하지 않으며,
          제휴 상담을 통해 정확한 판단이 이루어집니다.
        </span>
      </label>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status.kind === "loading"}
        style={{ marginTop: 18, width: "100%", minHeight: 50, fontSize: 16 }}
      >
        {status.kind === "loading" ? "처리 중..." : "회원가입"}
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
        이미 회원이신가요? <Link href="/login" style={{ color: "var(--brand)", fontWeight: 600 }}>로그인</Link>
      </div>
    </form>
  );
}
