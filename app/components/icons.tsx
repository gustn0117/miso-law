type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

const base = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/* ─────────────────────────────────────────────
   Arrows
   ───────────────────────────────────────────── */

export function ArrowRight({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} strokeWidth={strokeWidth} {...base}>
      <line x1="4" y1="12" x2="20" y2="12" />
      <polyline points="13 5 20 12 13 19" />
    </svg>
  );
}

export function ArrowUpRight({ size = 16, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} strokeWidth={strokeWidth} {...base}>
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="9 7 17 7 17 15" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Navigation
   ───────────────────────────────────────────── */

export function Menu({ size = 22, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} strokeWidth={strokeWidth} {...base}>
      <line x1="3" x2="21" y1="9" y2="9" />
      <line x1="3" x2="21" y1="15" y2="15" />
    </svg>
  );
}

export function Close({ size = 22, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} strokeWidth={strokeWidth} {...base}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Practice areas — line-art, stroke 1.4, 28×28 base
   ───────────────────────────────────────────── */

/** 사기 — 방패 + 경고 */
export function PracticeFraud({ size = 28, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className={className} strokeWidth={strokeWidth} {...base}>
      <path d="M14 3 4.5 6.5v6.2c0 5.6 4 9.5 9.5 11.3 5.5-1.8 9.5-5.7 9.5-11.3V6.5L14 3Z" />
      <line x1="14" y1="10" x2="14" y2="15" />
      <circle cx="14" cy="18" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** 형사 — 저울 */
export function PracticeCriminal({ size = 28, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className={className} strokeWidth={strokeWidth} {...base}>
      <line x1="14" y1="4" x2="14" y2="22" />
      <line x1="9" y1="22" x2="19" y2="22" />
      <path d="M6.5 7h15" />
      <path d="M6.5 7 3 14h7Z" />
      <path d="M21.5 7 18 14h7Z" />
      <path d="M3 14a3.5 3.5 0 0 0 7 0" />
      <path d="M18 14a3.5 3.5 0 0 0 7 0" />
    </svg>
  );
}

/** 음주운전 — 자동차 + 음주 표시 */
export function PracticeDUI({ size = 28, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className={className} strokeWidth={strokeWidth} {...base}>
      <path d="M4 17v-3l2-4.5C6.4 8.6 7.2 8 8 8h12c0.8 0 1.6 0.6 2 1.5L24 14v3" />
      <rect x="3" y="17" width="22" height="4" rx="1" />
      <circle cx="8" cy="21" r="1.5" />
      <circle cx="20" cy="21" r="1.5" />
      <line x1="6" y1="13" x2="22" y2="13" />
    </svg>
  );
}

/** 보이스피싱 — 전화 + 차단 */
export function PracticeVoicePhishing({ size = 28, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className={className} strokeWidth={strokeWidth} {...base}>
      <path d="M5 6c0-1 0.7-1.8 1.7-1.9l2.5-0.3c0.9-0.1 1.7 0.4 2 1.3l1 2.7c0.3 0.7 0 1.5-0.6 2L10 11.5c1 2.5 3 4.5 5.5 5.5l1.7-1.6c0.5-0.6 1.3-0.9 2-0.6l2.7 1c0.9 0.3 1.4 1.1 1.3 2l-0.3 2.5c-0.1 1-1 1.7-2 1.7-9.3-0.4-16.8-7.9-17.2-17.2 0 0 0 0 0 0Z" />
      <line x1="17" y1="6" x2="23" y2="12" />
      <line x1="23" y1="6" x2="17" y2="12" />
    </svg>
  );
}

/** 민사 / 돈 문제 — 동전 + 손 */
export function PracticeCivil({ size = 28, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className={className} strokeWidth={strokeWidth} {...base}>
      <circle cx="14" cy="11" r="6" />
      <path d="M16.5 9h-3.5a1.5 1.5 0 0 0 0 3h2a1.5 1.5 0 0 1 0 3h-3.5" />
      <line x1="14" y1="7" x2="14" y2="15" />
      <path d="M4 22c2 1 5 1.5 10 1.5s8-0.5 10-1.5" />
    </svg>
  );
}

/** 회생 / 파산 — 하향 차트 + 회복 화살표 */
export function PracticeRecovery({ size = 28, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className={className} strokeWidth={strokeWidth} {...base}>
      <path d="M3 6v18h22" />
      <polyline points="7 18 12 14 16 17 23 9" />
      <polyline points="18 9 23 9 23 14" />
    </svg>
  );
}

/** 이혼 / 가사 — 두 사람 분리 */
export function PracticeFamily({ size = 28, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className={className} strokeWidth={strokeWidth} {...base}>
      <circle cx="8" cy="9" r="3" />
      <path d="M3 22v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2" />
      <circle cx="20" cy="9" r="3" />
      <path d="M15 22v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2" />
      <line x1="14" y1="4" x2="14" y2="24" strokeDasharray="2 2" />
    </svg>
  );
}

/** 노동 / 퇴직금 — 서류가방 + 시계 */
export function PracticeLabor({ size = 28, className, strokeWidth = 1.4 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" className={className} strokeWidth={strokeWidth} {...base}>
      <rect x="3" y="9" width="22" height="14" rx="1.5" />
      <path d="M10 9V6.5C10 5.7 10.7 5 11.5 5h5C17.3 5 18 5.7 18 6.5V9" />
      <line x1="3" y1="15" x2="25" y2="15" />
      <circle cx="14" cy="15" r="1.2" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Decorations & misc
   ───────────────────────────────────────────── */

/** 작은 점 (브랜드 인디케이터) */
export function Dot({ size = 8, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" className={className} aria-hidden>
      <circle cx="4" cy="4" r="4" fill="currentColor" />
    </svg>
  );
}

/** 체크 (서비스 포인트) */
export function Check({ size = 18, className, strokeWidth = 1.6 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} strokeWidth={strokeWidth} {...base}>
      <polyline points="5 12 10 17 19 7" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Practice icon mapper — slug → icon
   ───────────────────────────────────────────── */
import type { ComponentType } from "react";

export const PRACTICE_ICONS: Record<string, ComponentType<IconProps>> = {
  fraud: PracticeFraud,
  criminal: PracticeCriminal,
  dui: PracticeDUI,
  "voice-phishing": PracticeVoicePhishing,
  civil: PracticeCivil,
  recovery: PracticeRecovery,
  family: PracticeFamily,
  labor: PracticeLabor,
};

export function PracticeIcon({
  slug,
  size = 28,
  className,
  strokeWidth = 1.4,
}: IconProps & { slug: string }) {
  const Cmp = PRACTICE_ICONS[slug];
  if (!Cmp) {
    return (
      <svg width={size} height={size} viewBox="0 0 28 28" className={className} strokeWidth={strokeWidth} {...base}>
        <rect x="5" y="5" width="18" height="18" rx="1" />
      </svg>
    );
  }
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} />;
}
