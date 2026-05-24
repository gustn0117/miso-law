import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1B3A6B", // 미소 네이비
          dark: "#122a52",
          mid: "#2a5290",
          soft: "#e8eef8",
          accent: "#F5A623", // 따뜻한 골드 포인트
        },
        ink: {
          DEFAULT: "#1A1F2E",
          soft: "#4A5060",
          mute: "#858a96",
        },
        line: "#E6E8EE",
        "line-soft": "#EEF0F4",
        "bg-soft": "#F7F8FB",
        "bg-cream": "#FBF8F1",
        danger: "#D64545",
        success: "#2E7D5B",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "Helvetica Neue",
          "Segoe UI",
          "'Noto Sans KR'",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 2px 10px rgba(20,26,40,0.05)",
        card: "0 4px 24px rgba(20,26,40,0.08)",
        cta: "0 10px 30px rgba(27,58,107,0.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
