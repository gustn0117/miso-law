import { listAllCases, listCategories } from "@/lib/db";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// 네이버 서치어드바이저 RSS 제출용 — RSS 2.0
// 관리자에서 사례가 수시로 추가되므로 요청 시점마다 새로 생성
export const dynamic = "force-dynamic";

const MAX_ITEMS = 50;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// sqlite "YYYY-MM-DD HH:MM:SS" → RFC-822 (RSS pubDate 형식)
function toPubDate(sqliteDatetime: string): string {
  return new Date(sqliteDatetime.replace(" ", "T")).toUTCString();
}

export function GET() {
  const categoryNames = new Map(
    listCategories().map((c) => [c.id, c.name] as const),
  );

  const cases = listAllCases()
    .filter((c) => c.published === 1)
    .slice(0, MAX_ITEMS);

  const items = cases
    .map((c) => {
      const link = `${SITE_URL}/case/${c.id}`;
      const category = categoryNames.get(c.category_id);
      return [
        "    <item>",
        `      <title>${escapeXml(c.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <description>${escapeXml(c.excerpt || c.title)}</description>`,
        category ? `      <category>${escapeXml(category)}</category>` : null,
        `      <pubDate>${toPubDate(c.created_at)}</pubDate>`,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const lastBuildDate = cases.length
    ? toPubDate(cases[0].created_at)
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ko</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
