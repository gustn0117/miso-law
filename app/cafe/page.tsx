import SiteLayout from "../components/SiteLayout";
import { getSetting } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "../components/icons";

export const dynamic = "force-dynamic";

export default function CafePage() {
  const cafeUrl = getSetting("cafe_url") || "https://cafe.naver.com";
  const kakaoUrl = getSetting("kakao_url") || "https://pf.kakao.com";

  return (
    <SiteLayout>
      <div className="page-head">
        <div className="container">
          <h1>커뮤니티 · 카페</h1>
          <p>
            실시간 사례 공유와 회원 후기는 외부 카페에서 확인하실 수 있습니다.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 28 }}>
        <ul className="practice-list" role="list">
          <li>
            <a
              href={cafeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="practice-row"
            >
              <span className="practice-num">N° 01</span>
              <span className="practice-name">네이버 카페</span>
              <span className="practice-desc">
                회원 사례 · 공지 · 실시간 Q&amp;A
              </span>
              <span className="practice-arrow">
                <ArrowUpRight size={20} />
              </span>
            </a>
          </li>
          <li>
            <a
              href={kakaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="practice-row"
            >
              <span className="practice-num">N° 02</span>
              <span className="practice-name">카카오톡 채널</span>
              <span className="practice-desc">
                빠른 1:1 문의는 카카오톡 채널로
              </span>
              <span className="practice-arrow">
                <ArrowUpRight size={20} />
              </span>
            </a>
          </li>
          <li>
            <Link href="/inquiry" className="practice-row">
              <span className="practice-num">N° 03</span>
              <span className="practice-name">상담 신청</span>
              <span className="practice-desc">
                담당자가 확인 후 입력하신 번호로 연락드립니다.
              </span>
              <span className="practice-arrow">
                <ArrowRight size={20} />
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </SiteLayout>
  );
}
