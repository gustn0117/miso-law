"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Member, PasswordResetRequest } from "@/lib/db-types";

type TempResult = { who: string; password: string };

export default function AdminMembers({
  members,
  resetRequests,
}: {
  members: Member[];
  resetRequests: PasswordResetRequest[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [temp, setTemp] = useState<TempResult | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = members.filter((m) =>
    `${m.name} ${m.phone} ${m.email || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const pending = resetRequests.filter((r) => r.status !== "처리완료");

  async function remove(id: number) {
    if (!confirm("회원을 삭제할까요? 연결된 상담 신청의 회원 정보는 해제됩니다."))
      return;
    setBusy(true);
    try {
      await fetch(`/api/admin/members?id=${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function resetMember(m: Member) {
    if (
      !confirm(
        `${m.name}(${m.phone}) 회원의 비밀번호를 초기화할까요?\n임시 비밀번호가 생성되며, 기존 로그인은 모두 해제됩니다.`,
      )
    )
      return;
    setBusy(true);
    setCopied(false);
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", id: m.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "초기화에 실패했습니다.");
        return;
      }
      setTemp({ who: `${m.name} (${m.phone})`, password: data.tempPassword });
    } finally {
      setBusy(false);
    }
  }

  async function resetRequest(r: PasswordResetRequest) {
    const label = r.name || r.phone || r.email || `요청 #${r.id}`;
    if (!confirm(`${label} 요청을 초기화 처리할까요? 임시 비밀번호가 생성됩니다.`))
      return;
    setBusy(true);
    setCopied(false);
    try {
      const res = await fetch("/api/admin/password-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", id: r.id }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "초기화에 실패했습니다.");
        return;
      }
      setTemp({ who: label, password: data.tempPassword });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function markDone(id: number) {
    setBusy(true);
    try {
      await fetch("/api/admin/password-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "done", id }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function removeRequest(id: number) {
    if (!confirm("이 요청을 삭제할까요?")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/password-requests?id=${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function copyTemp() {
    if (!temp) return;
    try {
      await navigator.clipboard.writeText(temp.password);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      {temp && (
        <div className="admin-card temp-pw" role="alert">
          <div className="temp-pw__head">
            <strong>임시 비밀번호가 생성되었습니다</strong>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ padding: "4px 10px", minHeight: 32 }}
              onClick={() => setTemp(null)}
            >
              닫기
            </button>
          </div>
          <p className="temp-pw__desc">
            <b>{temp.who}</b> 님에게 아래 임시 비밀번호를 전달해 주세요. 이
            비밀번호는 <b>지금만 표시</b>되며 다시 확인할 수 없습니다. 회원은
            로그인 후 마이페이지 &gt; 계정 설정에서 비밀번호를 변경할 수
            있습니다.
          </p>
          <div className="temp-pw__value">
            <code>{temp.password}</code>
            <button type="button" className="btn btn-primary" onClick={copyTemp}>
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div className="admin-card">
          <h3>비밀번호 재설정 요청 ({pending.length})</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>요청일</th>
                  <th>이름</th>
                  <th>휴대폰</th>
                  <th>이메일</th>
                  <th>회원매칭</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => (
                  <tr key={r.id}>
                    <td>{r.created_at.slice(0, 16)}</td>
                    <td>{r.name || "-"}</td>
                    <td>{r.phone || "-"}</td>
                    <td>{r.email || "-"}</td>
                    <td>
                      {r.member_id ? (
                        <span className="status-pill status-contacted">
                          #{r.member_id}
                        </span>
                      ) : (
                        <span className="status-pill status-noanswer">
                          매칭없음
                        </span>
                      )}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {r.member_id && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ padding: "6px 10px", minHeight: 34 }}
                          onClick={() => resetRequest(r)}
                          disabled={busy}
                        >
                          초기화
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: "6px 10px", minHeight: 34, marginLeft: 6 }}
                        onClick={() => markDone(r.id)}
                        disabled={busy}
                      >
                        완료표시
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{
                          color: "var(--danger)",
                          padding: "6px 10px",
                          minHeight: 34,
                          marginLeft: 6,
                        }}
                        onClick={() => removeRequest(r.id)}
                        disabled={busy}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="admin-card">
        <h3>
          회원 ({filtered.length} / {members.length})
        </h3>
        <div style={{ marginBottom: 12 }}>
          <input
            className="form-input"
            style={{ maxWidth: 320 }}
            placeholder="이름·전화·이메일 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">표시할 회원이 없습니다.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>이름</th>
                  <th>휴대폰</th>
                  <th>이메일</th>
                  <th>가입일</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td>#{m.id}</td>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td>{m.phone}</td>
                    <td>{m.email || "-"}</td>
                    <td>{m.created_at.slice(0, 10)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: "6px 10px", minHeight: 34 }}
                        onClick={() => resetMember(m)}
                        disabled={busy}
                      >
                        비번 초기화
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{
                          color: "var(--danger)",
                          padding: "6px 10px",
                          minHeight: 34,
                          marginLeft: 6,
                        }}
                        onClick={() => remove(m.id)}
                        disabled={busy}
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
    </>
  );
}
