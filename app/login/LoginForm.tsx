"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; msg: string };

export default function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status.kind === "loading") return;
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({ kind: "error", msg: data.error || "로그인 실패" });
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
          <label className="form-label form-required" htmlFor="lg-phone">
            휴대폰 번호
          </label>
          <input
            id="lg-phone"
            className="form-input"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-1234-5678"
            autoComplete="tel"
            required
          />
        </div>
        <div>
          <label className="form-label form-required" htmlFor="lg-pw">
            비밀번호
          </label>
          <input
            id="lg-pw"
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status.kind === "loading"}
        style={{ marginTop: 18, width: "100%", minHeight: 50, fontSize: 16 }}
      >
        {status.kind === "loading" ? "로그인 중..." : "로그인"}
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
        아직 회원이 아니신가요?{" "}
        <Link href="/signup" style={{ color: "var(--brand)", fontWeight: 600 }}>
          회원가입
        </Link>
      </div>
      <div style={{ marginTop: 8, textAlign: "center" }}>
        <Link
          href="/find-password"
          style={{ color: "var(--ink-mute)", fontSize: 13 }}
        >
          비밀번호를 잊으셨나요?
        </Link>
      </div>
    </form>
  );
}
