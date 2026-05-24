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
          DEFAULT: "#0071e3",
          dark: "#0057b3",
          soft: "#e8f4fd",
        },
        ink: {
          DEFAULT: "#1d1d1f",
          soft: "#424245",
          mute: "#86868b",
        },
        line: {
          DEFAULT: "#d2d2d7",
          soft: "#f5f5f7",
        },
        "bg-soft": "#fbfbfd",
        danger: "#ff3b30",
        success: "#30d158",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 2px 12px rgba(0,0,0,0.04)",
        card: "0 8px 32px rgba(0,0,0,0.06)",
        cta: "0 4px 24px rgba(0,0,0,0.2)",
      },
      borderRadius: {
        DEFAULT: "0.875rem",
        lg: "1.25rem",
        xl: "1.75rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
