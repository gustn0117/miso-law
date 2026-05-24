"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="floating-cta-stack">
      <Link
        href="/inquiry"
        className="floating-cta"
        aria-label="빠른 상담 신청하기"
      >
        💬 빠른 상담 신청
      </Link>
    </div>
  );
}
