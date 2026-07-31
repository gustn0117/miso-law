import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import Script from "next/script";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const GTM_ID = "GTM-TD5LHTFS";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    url: SITE_URL,
    type: "website",
    locale: "ko_KR",
  },
  robots: { index: true, follow: true },
  verification: {
    other: {
      "naver-site-verification": [
        "0355a2776b03ad78ce928654f145f7fe1b75c956",
        "4229790376a1094dfe4c19a9a8fd9c3554f77295",
      ],
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={bricolage.variable}>
      <body>
        {/* Google Tag Manager (noscript) — 여는 body 태그 직후 */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {children}
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      </body>
    </html>
  );
}
