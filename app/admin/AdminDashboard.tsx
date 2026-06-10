"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AIAnswer,
  BannedWord,
  Case,
  Category,
  Inquiry,
  Member,
  Short,
  Subcategory,
} from "@/lib/db-types";
import AdminInquiries from "./AdminInquiries";
import AdminCategories from "./AdminCategories";
import AdminCases from "./AdminCases";
import AdminShorts from "./AdminShorts";
import AdminAIAnswers from "./AdminAIAnswers";
import AdminBanned from "./AdminBanned";
import AdminMembers from "./AdminMembers";
import AdminSettings from "./AdminSettings";

type Props = {
  categories: Category[];
  subsByCategory: Record<number, Subcategory[]>;
  inquiries: Inquiry[];
  cases: Case[];
  shorts: Short[];
  aiAnswers: AIAnswer[];
  banned: BannedWord[];
  members: Member[];
  settings: Record<string, string>;
  stats: { total: number; newCount: number; todayCount: number };
};

const TABS = [
  { key: "stat", label: "대시보드" },
  { key: "inquiries", label: "상담 신청" },
  { key: "cases", label: "사례글" },
  { key: "categories", label: "카테고리" },
  { key: "ai", label: "AI 답변" },
  { key: "shorts", label: "쇼츠" },
  { key: "banned", label: "금지어" },
  { key: "members", label: "회원" },
  { key: "settings", label: "링크·설정" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AdminDashboard(props: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("stat");
  const newCount = props.stats.newCount;

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <h1>미소 법률 · 금융 상담 관리자</h1>
        <button type="button" className="btn btn-ghost" onClick={logout}>
          로그아웃
        </button>
      </div>

      <div className="admin-tabs" role="tablist">
        {TABS.map((t) => {
          const showBadge = t.key === "inquiries" && newCount > 0;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={`admin-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {showBadge && <span className="admin-tab-badge">{newCount} 신규</span>}
            </button>
          );
        })}
      </div>

      {tab === "stat" && (
        <Stats stats={props.stats} totals={{
          cases: props.cases.length,
          ai: props.aiAnswers.length,
          shorts: props.shorts.length,
          members: props.members.length,
          banned: props.banned.length,
        }} />
      )}
      {tab === "inquiries" && (
        <AdminInquiries inquiries={props.inquiries} categories={props.categories} />
      )}
      {tab === "cases" && (
        <AdminCases
          cases={props.cases}
          categories={props.categories}
          subsByCategory={props.subsByCategory}
        />
      )}
      {tab === "categories" && (
        <AdminCategories
          categories={props.categories}
          subsByCategory={props.subsByCategory}
        />
      )}
      {tab === "ai" && (
        <AdminAIAnswers
          aiAnswers={props.aiAnswers}
          categories={props.categories}
        />
      )}
      {tab === "shorts" && (
        <AdminShorts shorts={props.shorts} categories={props.categories} />
      )}
      {tab === "banned" && <AdminBanned items={props.banned} />}
      {tab === "members" && <AdminMembers members={props.members} />}
      {tab === "settings" && <AdminSettings settings={props.settings} />}
    </div>
  );
}

function Stats({
  stats,
  totals,
}: {
  stats: Props["stats"];
  totals: { cases: number; ai: number; shorts: number; members: number; banned: number };
}) {
  return (
    <div>
      <div
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          marginBottom: 18,
        }}
      >
        <StatCard label="신규 접수" value={stats.newCount} color="var(--brand-accent)" />
        <StatCard label="오늘 접수" value={stats.todayCount} color="var(--brand)" />
        <StatCard label="누적 신청" value={stats.total} color="var(--brand-mid)" />
        <StatCard label="회원 수" value={totals.members} color="var(--brand-dark)" />
      </div>
      <div
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        }}
      >
        <StatCard label="사례글" value={totals.cases} />
        <StatCard label="AI 답변 세트" value={totals.ai} />
        <StatCard label="쇼츠" value={totals.shorts} />
        <StatCard label="금지어" value={totals.banned} />
      </div>

      <div
        className="admin-card"
        style={{ marginTop: 18, background: "var(--bg-cream)" }}
      >
        <h3>📌 관리자 안내</h3>
        <ul style={{ paddingLeft: 18, color: "var(--ink-soft)", lineHeight: 1.8 }}>
          <li>신규 접수가 있을 때 좌측 상단 &quot;상담 신청&quot; 탭에 신규 뱃지가 표시됩니다.</li>
          <li>AI 답변 세트는 키워드와 카테고리 단위로 관리됩니다. priority가 높을수록 우선 매칭됩니다.</li>
          <li>금지어 등록 시, AI 답변에서 자동으로 완곡 표현으로 치환됩니다.</li>
          <li>외부 링크(카페·쇼츠·카카오톡)는 링크·설정 탭에서 변경 가능합니다.</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="admin-card" style={{ textAlign: "center" }}>
      <div style={{ fontSize: 13, color: "var(--ink-mute)", marginBottom: 6 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: color || "var(--ink)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
