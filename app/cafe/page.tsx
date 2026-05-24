import SiteLayout from "../components/SiteLayout";
import { getSetting } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function CafePage() {
  const cafeUrl = getSetting("cafe_url") || "https://cafe.naver.com";
  const kakaoUrl = getSetting("kakao_url") || "https://pf.kakao.com";

  return (
    <SiteLayout>
      <div className="page-head">
        <div className="container">
          <h1>커뮤니티 · 카페</h1>
          <p>실시간 사례 공유와 회원 후기는 외부 카페에서 확인하실 수 있습니다.</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 28 }}>
        <div
          style={{
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          }}
        >
          <a
            href={cafeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cat-card"
            style={{ minHeight: 160 }}
          >
            <span className="emoji" aria-hidden>
              💬
            </span>
            <span className="label">네이버 카페 바로가기</span>
            <span className="desc">
              회원 사례·공지·실시간 Q&amp;A
            </span>
            <span
              style={{
                marginTop: "auto",
                color: "var(--brand)",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              새 창 열기 →
            </span>
          </a>
          <a
            href={kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cat-card"
            style={{ minHeight: 160 }}
          >
            <span className="emoji" aria-hidden>
              💛
            </span>
            <span className="label">카카오톡 채널</span>
            <span className="desc">
              빠른 1:1 문의는 카카오톡 채널로
            </span>
            <span
              style={{
                marginTop: "auto",
                color: "var(--brand)",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              새 창 열기 →
            </span>
          </a>
          <Link
            href="/inquiry"
            className="cat-card"
            style={{ minHeight: 160 }}
          >
            <span className="emoji" aria-hidden>
              📝
            </span>
            <span className="label">상담 신청</span>
            <span className="desc">
              담당자가 확인 후 입력하신 번호로 연락드립니다.
            </span>
            <span
              style={{
                marginTop: "auto",
                color: "var(--brand)",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              신청하기 →
            </span>
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
