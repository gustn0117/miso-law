import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="logo-link" aria-label="미소법률상담 홈">
      <span className="logo-mark" aria-hidden>
        M
      </span>
      <span>
        미소<span className="logo-text-sub">법률상담</span>
      </span>
    </Link>
  );
}
