import type { MetadataRoute } from "next";
import { listAllCases, listCategories } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

// 관리자에서 사례/카테고리가 수시로 추가되므로 요청 시점마다 DB에서 새로 생성
export const dynamic = "force-dynamic";

// sqlite "YYYY-MM-DD HH:MM:SS" → Date
function toDate(sqliteDatetime: string): Date {
  return new Date(sqliteDatetime.replace(" ", "T"));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/inquiry`, changeFrequency: "monthly", priority: 0.9 },
    {
      url: `${SITE_URL}/inquiry/money`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${SITE_URL}/cases`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/reviews`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/shorts`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/cafe`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = listCategories().map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const caseRoutes: MetadataRoute.Sitemap = listAllCases()
    .filter((c) => c.published === 1)
    .map((c) => ({
      url: `${SITE_URL}/case/${c.id}`,
      lastModified: toDate(c.created_at),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...categoryRoutes, ...caseRoutes];
}
