"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Inquiry, InquiryStatus } from "@/lib/db-types";
import { INQUIRY_STATUSES } from "@/lib/db-types";

const STATUS_CLASS: Record<string, string> = {
  신규접수: "status-new",
  확인중: "status-checking",
  연락완료: "status-contacted",
  부재: "status-noanswer",
  변호사전달: "status-forwarded",
  종결: "status-closed",
};

type Props = { inquiries: Inquiry[]; categories: Category[] };

export default function AdminInquiries({ inquiries, categories }: Props) {
  const router = useRouter();
  const catMap = useMemo(
    () => new Map(categories.map((c) => [c.slug, c.name])),
    [categories],
  );
  const [filter, setFilter] = useState<"all" | InquiryStatus>("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [memoDraft, setMemoDraft] = useState<Record<number, string>>({});

  const filtered = useMemo(() => {
    return inquiries.filter((i) => {
      if (filter !== "all" && i.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !`${i.name} ${i.phone} ${i.email || ""} ${i.content || ""}`
            .toLowerCase()
            .includes(q)
        )
          return false;
      }
      return true;
    });
  }, [inquiries, filter, query]);

  async function updateStatus(id: number, status: InquiryStatus) {
    setBusyId(id);
    try {
      await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }
  async function saveMemo(id: number) {
    const memo = memoDraft[id] ?? "";
    setBusyId(id);
    try {
      await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, admin_memo: memo }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }
  async function remove(id: number) {
    if (!confirm("이 상담 신청을 삭제할까요? 복구할 수 없습니다.")) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/inquiries?id=${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  function exportCsv() {
    const headers = [
      "ID",
      "접수일시",
      "이름",
      "휴대폰",
      "이메일",
      "분야",
      "유입경로",
      "상태",
      "내용",
      "메모",
    ];
    const rows = filtered.map((i) => [
      i.id,
      i.created_at,
      i.name,
      i.phone,
      i.email || "",
      i.category_slug || "",
      i.source || "",
      i.status,
      (i.content || "").replace(/\n/g, " "),
      (i.admin_memo || "").replace(/\n/g, " "),
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob(["﻿" + csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inquiries_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-card">
      <h3>
        상담 신청 내역 ({filtered.length} / {inquiries.length})
      </h3>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 14,
          alignItems: "center",
        }}
      >
        <select
          className="form-input"
          style={{ maxWidth: 160 }}
          value={filter}
          onChange={(e) => setFilter(e.target.value as never)}
        >
          <option value="all">전체 상태</option>
          {INQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          className="form-input"
          style={{ maxWidth: 260 }}
          placeholder="이름·번호·이메일·내용 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div style={{ marginLeft: "auto" }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={exportCsv}
            disabled={filtered.length === 0}
          >
            CSV 내보내기
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">조건에 맞는 상담 신청이 없습니다.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ minWidth: 140 }}>접수</th>
                <th style={{ minWidth: 120 }}>신청자</th>
                <th style={{ minWidth: 280 }}>내용</th>
                <th style={{ minWidth: 130 }}>분야/유입</th>
                <th style={{ minWidth: 140 }}>상태</th>
                <th style={{ minWidth: 220 }}>담당자 메모</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--ink)" }}>
                      #{i.id}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                      {i.created_at.slice(0, 16)}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{i.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                      {i.phone}
                    </div>
                    {i.email && (
                      <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                        {i.email}
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      whiteSpace: "pre-wrap",
                      color: "var(--ink-soft)",
                      maxWidth: 380,
                    }}
                  >
                    {i.content || "-"}
                  </td>
                  <td>
                    <div>{i.category_slug ? catMap.get(i.category_slug) || i.category_slug : "-"}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                      {i.source || "-"}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${STATUS_CLASS[i.status] || ""}`}
                      style={{ marginBottom: 6, display: "inline-block" }}
                    >
                      {i.status}
                    </span>
                    <select
                      className="form-input"
                      style={{ padding: "6px 8px", minHeight: 34 }}
                      value={i.status}
                      onChange={(e) =>
                        updateStatus(i.id, e.target.value as InquiryStatus)
                      }
                      disabled={busyId === i.id}
                    >
                      {INQUIRY_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <textarea
                      className="form-input"
                      style={{ minHeight: 60, resize: "vertical" }}
                      placeholder="담당자 메모"
                      defaultValue={i.admin_memo || ""}
                      onChange={(e) =>
                        setMemoDraft((m) => ({ ...m, [i.id]: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{
                        marginTop: 6,
                        padding: "6px 10px",
                        minHeight: 34,
                      }}
                      onClick={() => saveMemo(i.id)}
                      disabled={busyId === i.id}
                    >
                      메모 저장
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{
                        color: "var(--danger)",
                        padding: "6px 10px",
                        minHeight: 34,
                      }}
                      onClick={() => remove(i.id)}
                      disabled={busyId === i.id}
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
