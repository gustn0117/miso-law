"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";

type Props = {
  member: { id: number; name: string } | null;
};

const NAV = [
  { href: "/", label: "홈" },
  { href: "/category/fraud", label: "사기" },
  { href: "/category/criminal", label: "형사" },
  { href: "/category/dui", label: "음주운전" },
  { href: "/category/recovery", label: "회생/파산" },
  { href: "/shorts", label: "쇼츠" },
];

export default function Header({ member }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />

        <ul className="nav-menu">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={pathname === item.href ? "active" : ""}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="header-right">
          {member ? (
            <>
              <Link
                href="/mypage"
                style={{ color: "var(--ink-soft)", fontSize: 14 }}
              >
                {member.name}님
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  color: "var(--ink-soft)",
                  fontSize: 14,
                  background: "none",
                  border: "none",
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href="/login"
              style={{ color: "var(--ink-soft)", fontSize: 14 }}
            >
              로그인
            </Link>
          )}
          <Link href="/inquiry" className="btn btn-primary btn-sm">
            상담 신청
          </Link>
        </div>

        <button
          type="button"
          className="mobile-toggle"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <nav className="mobile-drawer" aria-label="모바일 메뉴">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <div
            style={{ height: 1, background: "var(--line-soft)", margin: "8px 0" }}
          />
          {member ? (
            <>
              <Link href="/mypage">마이페이지</Link>
              <button type="button" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <Link href="/login">로그인</Link>
          )}
          <Link href="/inquiry" style={{ color: "var(--brand)" }}>
            상담 신청
          </Link>
        </nav>
      )}
    </header>
  );
}
