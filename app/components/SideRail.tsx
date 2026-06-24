import Link from "next/link";

// PC(>=1280px) 우측 중앙에 떠 있는 빠른 액션 카드
export default function SideRail() {
  return (
    <aside className="side-rail" aria-label="빠른 액션">
      <div className="rail-card">
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-mute)",
            marginBottom: 6,
          }}
        >
          가장 빠른 방법
        </div>
        <div
          style={{
            fontWeight: 800,
            color: "var(--brand)",
            marginBottom: 10,
          }}
        >
          무료 상담 신청
        </div>
        <Link
          href="/inquiry"
          className="btn btn-primary"
          style={{ width: "100%" }}
        >
          신청하기
        </Link>
      </div>
      <div className="rail-card">
        <div
          style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 6 }}
        >
          대출 문제
        </div>
        <div
          style={{ fontWeight: 800, color: "var(--brand)", marginBottom: 10 }}
        >
          회생·채무 상담
        </div>
        <Link
          href="/category/recovery"
          className="btn btn-accent"
          style={{ width: "100%" }}
        >
          바로가기
        </Link>
      </div>
    </aside>
  );
}
