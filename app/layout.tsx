import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "미소법률상담 — 어떤 고민이 있으신가요?",
  description:
    "사기·형사·음주운전·보이스피싱·민사·회생/파산·이혼·노동까지, 법률 고민을 입력하면 AI가 안내하고 전문 상담을 연결해 드립니다.",
  keywords: [
    "법률상담",
    "사기상담",
    "형사사건",
    "음주운전",
    "보이스피싱",
    "민사",
    "회생파산",
    "이혼",
    "노동",
    "미소법률상담",
  ],
  openGraph: {
    title: "미소법률상담 — 어떤 고민이 있으신가요?",
    description:
      "법률 고민을 검색하면 AI가 기본 안내를 드리고, 관련 사례와 전문가 상담으로 연결해 드립니다.",
    type: "website",
    locale: "ko_KR",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
