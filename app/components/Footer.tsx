import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="colophon">
      <div className="w-wide">
        <div className="colophon-top">
          <div>
            <div className="colophon-brand">미소 법률 · 대출 상담</div>
            <p className="colophon-disclaimer">
              본 플랫폼은 법률·대출 정보를 제공하고 상담 연결을 지원하는
              서비스입니다. 직접 법률 자문을 제공하지 않으며, 정확한 판단은
              제휴 상담을 통해 확인하시기 바랍니다.
            </p>
          </div>

          <div>
            <div className="colophon-col-title">분야</div>
            <ul className="colophon-links">
              <li><Link href="/category/fraud">사기 사건</Link></li>
              <li><Link href="/category/criminal">형사 사건</Link></li>
              <li><Link href="/category/dui">음주운전</Link></li>
              <li><Link href="/category/voice-phishing">보이스피싱</Link></li>
              <li><Link href="/category/civil">민사</Link></li>
            </ul>
          </div>

          <div>
            <div className="colophon-col-title">상담</div>
            <ul className="colophon-links">
              <li><Link href="/inquiry">상담 신청</Link></li>
              <li><Link href="/cases">사례 모음</Link></li>
              <li><Link href="/shorts">1분 쇼츠</Link></li>
              <li><Link href="/cafe">카페 · 블로그</Link></li>
            </ul>
          </div>

          <div>
            <div className="colophon-col-title">계정</div>
            <ul className="colophon-links">
              <li><Link href="/login">로그인</Link></li>
              <li><Link href="/signup">회원가입</Link></li>
              <li><Link href="/mypage">마이페이지</Link></li>
            </ul>
          </div>
        </div>

        <details className="colophon-biz">
          <summary aria-label="사업자 정보 펼치기/접기">
            <span className="colophon-biz-eyebrow">
              <span>BUSINESS REGISTRATION</span>
              <span aria-hidden>·</span>
              <span>대부중개업등록증</span>
            </span>
            <span className="colophon-biz-toggle" aria-hidden>
              <span className="colophon-biz-toggle-label" />
              <svg
                className="colophon-biz-chevron"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 4.5L6 7.5L9 4.5" />
              </svg>
            </span>
          </summary>
          <dl className="colophon-biz-grid">
            <div>
              <dt>등록번호</dt>
              <dd className="num">2026-인천남동-0002</dd>
            </div>
            <div>
              <dt>등록유효기간</dt>
              <dd className="num">2026.04.23 — 2029.04.23</dd>
            </div>
            <div>
              <dt>상호</dt>
              <dd>국민대출대부중개</dd>
            </div>
            <div>
              <dt>대표자</dt>
              <dd>김학찬</dd>
            </div>
            <div className="span-2">
              <dt>소재지</dt>
              <dd>인천광역시 남동구 구월로336번길 60, 1층 일부 (만수동)</dd>
            </div>
            <div>
              <dt>전화번호</dt>
              <dd className="num">
                <a href="tel:01098857010">010-9885-7010</a>
              </dd>
            </div>
          </dl>
        </details>

        <div className="colophon-bottom">
          <span>© {year} 미소 법률 · 대출 상담</span>
          <nav className="colophon-policy" aria-label="약관 및 정책">
            <Link href="/privacy" className="is-strong">
              개인정보처리방침
            </Link>
            <span aria-hidden>·</span>
            <Link href="/terms">이용약관</Link>
          </nav>
          <span>SEOUL · INCHEON</span>
        </div>
      </div>
    </footer>
  );
}
