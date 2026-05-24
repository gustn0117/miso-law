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
        <div className="title">{title}</div>
        <div className="desc">{desc}</div>
      </div>
      <span className="btn">금전상담 바로가기 →</span>
    </Link>
  );
}
