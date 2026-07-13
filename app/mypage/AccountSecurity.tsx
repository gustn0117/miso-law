"use client";

import { useState } from "react";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; msg: string }
  | { kind: "success" };

export default function AccountSecurity() {
  const [form, setForm] = useState({
    current: "",
    next: "",
    nextConfirm: "",
  });
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    if (status.kind === "error" || status.kind === "success")
      setStatus({ kind: "idle" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status.kind === "loading") return;

    if (form.next.length < 6) {
      setStatus({ kind: "error", msg: "새 비밀번호는 6자 이상이어야 합니다." });
      return;
    }
    if (form.next !== form.nextConfirm) {
      setStatus({ kind: "error", msg: "새 비밀번호 확인이 일치하지 않습니다." });
      return;
    }

    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({
          kind: "error",
          msg: data.error || "비밀번호 변경에 실패했습니다.",
        });
        return;
      }
      setForm({ current: "", next: "", nextConfirm: "" });
      setStatus({ kind: "success" });
    } catch {
      setStatus({ kind: "error", msg: "네트워크 오류가 발생했습니다." });
    }
  }

  return (
    <form className="admin-card" onSubmit={onSubmit} noValidate>
      <h3 style={{ marginTop: 0 }}>비밀번호 변경</h3>
      <div style={{ display: "grid", gap: 14, maxWidth: 420 }}>
        <div>
          <label className="form-label form-required" htmlFor="ac-current">
            현재 비밀번호
          </label>
          <input
            id="ac-current"
            className="form-input"
            type="password"
            value={form.current}
            onChange={(e) => update("current", e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <div>
          <label className="form-label form-required" htmlFor="ac-next">
            새 비밀번호 (6자 이상)
          </label>
          <input
            id="ac-next"
            className="form-input"
            type="password"
            value={form.next}
            onChange={(e) => update("next", e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div>
          <label className="form-label form-required" htmlFor="ac-next2">
            새 비밀번호 확인
          </label>
          <input
            id="ac-next2"
            className="form-input"
            type="password"
            value={form.nextConfirm}
            onChange={(e) => update("nextConfirm", e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status.kind === "loading"}
        style={{ marginTop: 16, minHeight: 46 }}
      >
        {status.kind === "loading" ? "변경 중..." : "비밀번호 변경"}
      </button>

      {status.kind === "error" && (
        <div className="form-status error" role="alert">
          {status.msg}
        </div>
      )}
      {status.kind === "success" && (
        <div className="form-status success" role="status">
          비밀번호가 변경되었습니다. 다른 기기의 로그인은 해제되었습니다.
        </div>
      )}
    </form>
  );
}
