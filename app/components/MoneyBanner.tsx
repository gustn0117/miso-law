import Link from "next/link";
import { ArrowRight } from "./icons";

type Props = { title: string; desc: string };

export default function MoneyBanner({ title, desc }: Props) {
  return (
    <section className="notice">
      <span className="notice-eyebrow">금전 · 채무 상담</span>
      <h2 className="notice-h">{title}</h2>
      <p className="notice-p">{desc}</p>
      <div className="notice-action">
        <Link href="/category/recovery" className="btn btn-ghost btn-lg">
          상세 보기
          <span className="btn-icon"><ArrowRight size={16} /></span>
        </Link>
      </div>
    </section>
  );
}
