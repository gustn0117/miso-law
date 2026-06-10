import SiteLayout from "../components/SiteLayout";
import ChatRoom from "./ChatRoom";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "AI 상담 · 미소 법률 · 금융 상담",
  description:
    "법률 고민을 한 줄로 입력하면 AI가 카테고리·핵심 포인트·다음 액션을 정리해 드립니다.",
};

export default function ChatPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const initialQuery = (searchParams.q || "").trim();
  return (
    <SiteLayout hideFloatingCta hideSideRail>
      <ChatRoom initialQuery={initialQuery} />
    </SiteLayout>
  );
}
