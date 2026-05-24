import Link from "next/link";
import type { Category } from "@/lib/db";
import { ArrowRight } from "./icons";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <ul className="practice-list" role="list">
      {categories.map((c, i) => (
        <li key={c.id}>
          <Link href={`/category/${c.slug}`} className="practice-row">
            <span className="practice-num">N° {String(i + 1).padStart(2, "0")}</span>
            <div className="practice-body">
              <span className="practice-name">{c.name}</span>
              {c.description && (
                <p className="practice-desc">{c.description}</p>
              )}
            </div>
            <span className="practice-arrow"><ArrowRight size={20} /></span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
