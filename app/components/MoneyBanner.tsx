import Link from "next/link";

type Props = { title: string; desc: string };

export default function MoneyBanner({ title, desc }: Props) {
  return (
    <Link
      href="/category/recovery"
      className="money-banner"
      aria-label="금전상담 바로가기"
    >
      <div>
        <div className="mb-eyebrow">
          <span aria-hidden>●</span>
          금전 · 채무 전문 상담
        </div>
        <h3 className="title">{title}</h3>
        <p className="desc">{desc}</p>
      </div>
      <div className="mb-actions">
        <span className="btn btn-on-dark">
          자세히 보기
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
