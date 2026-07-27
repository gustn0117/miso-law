import {
  CaretRight,
  FileMagnifyingGlass,
  HandCoins,
  Scales,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const actions = [
  {
    href: "/inquiry",
    title: "무료 법률 상담 신청",
    description: "평균 3분 내 접수",
    tone: "legal",
    icon: Scales,
  },
  {
    href: "/inquiry/money",
    title: "무료 대출 상담 신청",
    description: "맞춤 상품 무료 안내",
    tone: "finance",
    icon: HandCoins,
  },
  {
    href: "/chat",
    title: "내 사건 먼저 진단하기",
    description: "1분 체크",
    tone: "diagnosis",
    icon: FileMagnifyingGlass,
  },
] as const;

export default function MobileConsultationHero() {
  return (
    <div className="mobile-consultation-hero">
      <div className="mobile-hero-copy">
        <h1>
          <span className="mobile-hero-line">
            <span className="mobile-hero-legal">법률 상담</span>부터
          </span>
          <span className="mobile-hero-line">
            <span className="mobile-hero-finance">대출 상담</span>까지
          </span>
          <span className="mobile-hero-cta">30초 무료 상담 신청</span>
        </h1>
        <p>전문가가 빠르게 연결해드립니다.</p>
      </div>

      <nav className="mobile-hero-actions" aria-label="빠른 상담 신청">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`mobile-hero-action mobile-hero-action-${action.tone}`}
            >
              <span className="mobile-hero-action-icon" aria-hidden>
                <Icon weight="regular" />
              </span>
              <span className="mobile-hero-action-copy">
                <strong>{action.title}</strong>
                <span>{action.description}</span>
              </span>
              <CaretRight
                className="mobile-hero-action-arrow"
                weight="bold"
                aria-hidden
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
