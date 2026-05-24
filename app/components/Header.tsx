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
  { href: "/cafe", label: "카페" },
];

export default function Header({ member }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // 라우트 변경 시 자동으로 모바일 드로어 닫기
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
              <Link href="/mypage" className="btn btn-ghost">
                {member.name}님
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-ghost"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                로그인
              </Link>
              <Link href="/signup" className="btn btn-outline">
                회원가입
              </Link>
            </>
          )}
          <Link href="/inquiry" className="btn btn-primary">
            빠른 상담 신청
          </Link>
        </div>

        <button
          type="button"
          className="mobile-toggle"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden>{open ? "✕" : "☰"}</span>
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
            style={{ height: 1, background: "var(--line)", margin: "8px 0" }}
          />
          {member ? (
            <>
              <Link href="/mypage">마이페이지 ({member.name}님)</Link>
              <button type="button" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login">로그인</Link>
              <Link href="/signup">회원가입</Link>
            </>
          )}
          <Link href="/inquiry">빠른 상담 신청</Link>
        </nav>
      )}
    </header>
  );
}
