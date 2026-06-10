import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="logo-link" aria-label="미소 법률 · 금융 상담 홈">
      <span className="logo-ko">미소 법률 · 금융 상담</span>
      <span className="logo-en" aria-hidden>
        MISO LEGAL & FINANCE · EST. 2026
      </span>
    </Link>
  );
}
