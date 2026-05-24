import Link from "next/link";

type Item = { href: string; label: string; emoji: string; external?: boolean };

export default function QuickMenu({ items }: { items: Item[] }) {
  return (
    <div className="quick-menu">
      {items.map((it) =>
        it.external ? (
          <a
            key={it.href}
            href={it.href}
            target="_blank"
            rel="noopener noreferrer"
            className="qm-item"
          >
            <span className="ic" aria-hidden>
              {it.emoji}
            </span>
            <span>{it.label}</span>
          </a>
        ) : (
          <Link key={it.href} href={it.href} className="qm-item">
            <span className="ic" aria-hidden>
              {it.emoji}
            </span>
            <span>{it.label}</span>
          </Link>
        ),
      )}
    </div>
  );
}
