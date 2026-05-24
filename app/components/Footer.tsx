import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <div className="footer-brand">미소법률상담</div>
          <div className="footer-disclaimer">
            본 플랫폼은 법률/금융 정보를 제공하고 상담 연결을 지원하는
            서비스입니다. 직접 법률 자문을 제공하지 않으며, 정확한 법률/금융
            판단은 제휴 상담을 통해 확인하시기 바랍니다.
          </div>
        </div>

        <div>
          <div className="footer-col-title">카테고리</div>
          <ul className="footer-links">
            <li>
              <Link href="/category/fraud">사기 사건</Link>
            </li>
            <li>
              <Link href="/category/criminal">형사 사건</Link>
            </li>
            <li>
              <Link href="/category/dui">음주운전</Link>
            </li>
            <li>
              <Link href="/category/recovery">회생 / 파산</Link>
            </li>
            <li>
              <Link href="/category/family">이혼 / 가사</Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="footer-col-title">바로가기</div>
          <ul className="footer-links">
            <li>
              <Link href="/inquiry">상담 신청</Link>
            </li>
            <li>
              <Link href="/shorts">쇼츠</Link>
            </li>
            <li>
              <Link href="/login">로그인</Link>
            </li>
          </ul>
          <div className="footer-copy">
            Copyright © {new Date().getFullYear()} 미소법률상담. All rights
            reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
