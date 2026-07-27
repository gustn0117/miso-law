import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /robots.txt 생성 — 비공개·중복 영역만 차단하고 나머지는 전부 허용
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/mypage",
          "/login",
          "/signup",
          "/find-password",
          "/search",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
