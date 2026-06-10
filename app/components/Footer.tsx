import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="colophon">
      <div className="w-wide">
        <div className="colophon-top">
          <div>
            <div className="colophon-brand">미소 법률 · 금융 상담</div>
            <p className="colophon-disclaimer">
              본 플랫폼은 법률·금융 정보를 제공하고 상담 연결을 지원하는
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
              <li><Link href="/cafe">카페·카톡</Link></li>
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

        <div className="colophon-bottom">
          <span>© {year} 미소 법률 · 금융 상담</span>
          <span>SEOUL</span>
        </div>
      </div>
    </footer>
  );
}
