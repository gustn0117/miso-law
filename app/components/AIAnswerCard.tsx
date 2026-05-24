import Link from "next/link";
import type { AIAnswerPayload } from "@/lib/ai";

type Props = {
  query: string;
  answer: AIAnswerPayload;
};

export default function AIAnswerCard({ query, answer }: Props) {
  const inquiryHref = answer.matched_category_slug
    ? `/inquiry?category=${encodeURIComponent(answer.matched_category_slug)}`
    : "/inquiry";
  const catHref = answer.matched_category_slug
    ? `/category/${answer.matched_category_slug}`
    : null;

  return (
    <div className="ai-answer">
      <h2>
        <span aria-hidden>🤖</span>
        AI 1차 안내
        <span className="ai-tag">미소봇</span>
      </h2>
      <div
        style={{
          color: "var(--ink-mute)",
          fontSize: 13,
          marginBottom: 6,
        }}
      >
        질문: <strong style={{ color: "var(--ink-soft)" }}>{query}</strong>
      </div>
      <div className="summary">{answer.summary}</div>
      {answer.bullets.length > 0 && (
        <ul>
          {answer.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}

      <div className="ai-actions">
        <Link href={inquiryHref} className="btn btn-primary">
          상담 신청하기
        </Link>
        {catHref && (
          <Link href={catHref} className="btn btn-outline">
            관련 사례 보기
          </Link>
        )}
        <Link href="/shorts" className="btn btn-ghost">
          관련 쇼츠 보기
        </Link>
        <Link href="/cafe" className="btn btn-ghost">
          카페 글 보기
        </Link>
      </div>

      <div className="ai-disclaimer">{answer.disclaimer}</div>
    </div>
  );
}
