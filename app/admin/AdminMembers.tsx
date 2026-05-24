"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Member } from "@/lib/db-types";

export default function AdminMembers({ members }: { members: Member[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = members.filter((m) =>
    `${m.name} ${m.phone} ${m.email || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  async function remove(id: number) {
    if (!confirm("회원을 삭제할까요? 연결된 상담 신청의 회원 정보는 해제됩니다.")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/members?id=${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-card">
      <h3>회원 ({filtered.length} / {members.length})</h3>
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
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{
                        color: "var(--danger)",
                        padding: "6px 10px",
                        minHeight: 34,
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
  );
}
