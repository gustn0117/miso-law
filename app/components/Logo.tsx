import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="logo-link" aria-label="미소법률상담 홈">
      <span className="logo-ko">미소법률상담</span>
      <span className="logo-en" aria-hidden>
        MISO LEGAL · EST. 2026
      </span>
    </Link>
  );
}
