import Link from "next/link";

type Item = { href: string; label: string; icon: string; external?: boolean };

const ICONS: Record<string, React.ReactNode> = {
  cafe: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" x2="6" y1="2" y2="4" />
      <line x1="10" x2="10" y1="2" y2="4" />
      <line x1="14" x2="14" y1="2" y2="4" />
    </svg>
  ),
  shorts: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  ),
  cases: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  ),
  money: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </svg>
  ),
};

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
              {ICONS[it.icon] || ICONS.cases}
            </span>
            <span>{it.label}</span>
          </a>
        ) : (
          <Link key={it.href} href={it.href} className="qm-item">
            <span className="ic" aria-hidden>
              {ICONS[it.icon] || ICONS.cases}
            </span>
            <span>{it.label}</span>
          </Link>
        ),
      )}
    </div>
  );
}
