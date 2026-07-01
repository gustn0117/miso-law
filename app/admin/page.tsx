import LoginForm from "./LoginForm";
import AdminDashboard from "./AdminDashboard";
import { isAdmin } from "@/lib/admin-guard";
import {
  getInquiryStats,
  listAIAnswers,
  listAllCases,
  listAllReviews,
  listAllSettings,
  listBannedWords,
  listCategories,
  listInquiries,
  listMembers,
  listShorts,
  listSubcategories,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  if (!isAdmin()) return <LoginForm />;

  const categories = listCategories();
  const subsByCategory: Record<number, ReturnType<typeof listSubcategories>> =
    {};
  for (const c of categories) subsByCategory[c.id] = listSubcategories(c.id);

  const inquiries = listInquiries();
  const cases = listAllCases();
  const shorts = listShorts();
  const aiAnswers = listAIAnswers();
  const banned = listBannedWords();
  const members = listMembers();
  const reviews = listAllReviews();
  const settings = Object.fromEntries(
    listAllSettings().map((s) => [s.key, s.value]),
  );
  const stats = getInquiryStats();
  const latestInquiryId = inquiries[0]?.id ?? 0;

  return (
    <AdminDashboard
      categories={categories}
      subsByCategory={subsByCategory}
      inquiries={inquiries}
      cases={cases}
      shorts={shorts}
      aiAnswers={aiAnswers}
      banned={banned}
      members={members}
      reviews={reviews}
      settings={settings}
      stats={stats}
      latestInquiryId={latestInquiryId}
    />
  );
}
