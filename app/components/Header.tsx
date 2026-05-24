"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import { ArrowRight, Menu, Close } from "./icons";

type Props = {
  member: { id: number; name: string } | null;
};

const NAV = [
  { href: "/category/fraud", label: "사기" },
  { href: "/category/criminal", label: "형사" },
  { href: "/category/dui", label: "음주운전" },
  { href: "/category/recovery", label: "회생/파산" },
  { href: "/cases", label: "사례" },
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
    <header className="masthead">
      <div className="w-wide masthead-inner">
        <Logo />

        <ul className="nav" role="navigation" aria-label="주 메뉴">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={pathname === item.href ? "is-active" : ""}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="masthead-right">
          {member ? (
            <>
              <Link href="/mypage" className="masthead-link">
                {member.name}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="masthead-link"
                style={{ background: "transparent", border: 0 }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link href="/login" className="masthead-link">
              로그인
            </Link>
          )}
          <Link href="/inquiry" className="btn btn-primary btn-sm">
            상담 신청
          </Link>
        </div>

        <button
          type="button"
          className="masthead-mobile-toggle"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <Close size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="mobile-drawer" aria-label="모바일 메뉴">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
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
          <Link href="/inquiry">
            상담 신청 <ArrowRight size={18} />
          </Link>
        </nav>
      )}
    </header>
  );
}
