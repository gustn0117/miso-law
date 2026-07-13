import SiteLayout from "../components/SiteLayout";
import LegalNotice from "../components/LegalNotice";
import AccountSecurity from "./AccountSecurity";
import { getCurrentMember } from "@/lib/auth";
import { listInquiriesByMember } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_CLASS: Record<string, string> = {
  신규접수: "status-new",
  확인중: "status-checking",
  연락완료: "status-contacted",
  부재: "status-noanswer",
  변호사전달: "status-forwarded",
  종결: "status-closed",
};

export default function MyPage() {
  const member = getCurrentMember();
  if (!member) redirect("/login");
  const inquiries = listInquiriesByMember(member.id);

  return (
    <SiteLayout hideSideRail>
      <div className="page-head">
        <div className="container">
          <h1>마이페이지</h1>
          <p>
            <strong>{member.name}</strong>님, 안녕하세요. 신청하신 상담 내역을
            확인하실 수 있습니다.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 24 }}>
        <div
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            marginBottom: 24,
          }}
        >
          <Stat label="누적 신청" value={inquiries.length} />
          <Stat
            label="진행 중"
            value={inquiries.filter((i) => !["종결"].includes(i.status)).length}
          />
          <Stat
            label="종결"
            value={inquiries.filter((i) => i.status === "종결").length}
          />
        </div>

        <div className="section-head">
          <h2>나의 상담 신청 내역</h2>
          <Link href="/inquiry" className="btn btn-primary">
            새 상담 신청
          </Link>
        </div>

        {inquiries.length === 0 ? (
          <div className="empty-state">
            아직 신청 내역이 없습니다.{" "}
            <Link
              href="/inquiry"
              style={{ color: "var(--brand)", fontWeight: 600 }}
            >
              상담 신청하기
            </Link>
          </div>
        ) : (
          <div className="admin-card" style={{ padding: 0, overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>접수일</th>
                  <th>분야</th>
                  <th>내용</th>
                  <th>상태</th>
                  <th>유입경로</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((i) => (
                  <tr key={i.id}>
                    <td>{i.created_at.slice(0, 16)}</td>
                    <td>{i.category_slug || "-"}</td>
                    <td
                      style={{
                        maxWidth: 340,
                        whiteSpace: "pre-wrap",
                        color: "var(--ink-soft)",
                      }}
                    >
                      {i.content || "-"}
                    </td>
                    <td>
                      <span
                        className={`status-pill ${STATUS_CLASS[i.status] || ""}`}
                      >
                        {i.status}
                      </span>
                    </td>
                    <td>{i.source || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="section-head" style={{ marginTop: 40 }}>
          <h2>계정 설정</h2>
        </div>
        <AccountSecurity />

        <LegalNotice />
      </div>
    </SiteLayout>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="admin-card" style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: 13,
          color: "var(--ink-mute)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "var(--brand)" }}>
        {value}
      </div>
    </div>
  );
}
