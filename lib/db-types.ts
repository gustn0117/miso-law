// 클라이언트 컴포넌트에서도 안전하게 import 가능한 타입/상수만 분리.
// 서버 전용 모듈(better-sqlite3, fs)이 클라 번들에 끌려가지 않도록 한다.

export type Category = {
  id: number;
  slug: string;
  name: string;
  emoji: string | null;
  description: string | null;
  sort_order: number;
};

export type Subcategory = {
  id: number;
  category_id: number;
  slug: string;
  name: string;
  sort_order: number;
};

export type Case = {
  id: number;
  category_id: number;
  subcategory_id: number | null;
  title: string;
  excerpt: string | null;
  body: string;
  published: number;
  view_count: number;
  created_at: string;
};

export type Short = {
  id: number;
  category_id: number | null;
  title: string;
  url: string;
  thumbnail_url: string | null;
  sort_order: number;
  created_at: string;
};

export type AIAnswer = {
  id: number;
  keyword: string;
  category_slug: string | null;
  summary: string;
  bullets: string;
  next_steps: string | null;
  priority: number;
  created_at: string;
};

export type BannedWord = { id: number; word: string; note: string | null };

export type Inquiry = {
  id: number;
  member_id: number | null;
  name: string;
  phone: string;
  email: string | null;
  category_slug: string | null;
  content: string | null;
  source: string | null;
  status: string;
  admin_memo: string | null;
  created_at: string;
};

export type Member = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  password_hash: string;
  created_at: string;
};

export const INQUIRY_STATUSES = [
  "신규접수",
  "확인중",
  "연락완료",
  "부재",
  "변호사전달",
  "종결",
] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];
