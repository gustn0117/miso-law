import Link from "next/link";
import type { Category } from "@/lib/db";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="cat-grid">
      {categories.map((c) => (
        <Link key={c.id} href={`/category/${c.slug}`} className="cat-card">
          <span className="emoji" aria-hidden>
            {c.emoji}
          </span>
          <span className="label">{c.name}</span>
          {c.description && <span className="desc">{c.description}</span>}
        </Link>
      ))}
    </div>
  );
}
