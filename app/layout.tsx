import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "미소 법률 · 대출 상담 — 정리되지 않은 고민, 한 줄로 정리해 드립니다",
  description:
    "사기·형사·음주운전·보이스피싱·민사·회생/파산·이혼·노동·대출까지, 법률·대출 고민을 입력하면 맞춤 안내와 함께 전문 상담으로 연결해 드립니다.",
  icons: {
    icon: "/images/trust-icon.jpg",
  },
  keywords: [
    "법률상담",
    "대출상담",
    "대출상담",
    "사기상담",
    "형사사건",
    "음주운전",
    "보이스피싱",
    "민사",
    "회생파산",
    "이혼",
    "노동",
    "미소 법률 대출 상담",
    "미소법률상담",
  ],
  openGraph: {
    title: "미소 법률 · 대출 상담",
    description:
      "법률 고민을 검색하면 기본 안내를 드리고, 관련 사례와 전문가 상담으로 연결해 드립니다.",
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
    <html lang="ko" className={bricolage.variable}>
      <body>{children}</body>
    </html>
  );
}
