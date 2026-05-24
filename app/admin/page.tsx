import LoginForm from "./LoginForm";
import AdminDashboard from "./AdminDashboard";
import { isAdmin } from "@/lib/admin-guard";
import {
  getInquiryStats,
  listAIAnswers,
  listAllCases,
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
  const settings = Object.fromEntries(
    listAllSettings().map((s) => [s.key, s.value]),
  );
  const stats = getInquiryStats();

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
      settings={settings}
      stats={stats}
    />
  );
}
