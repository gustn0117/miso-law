import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// =============================================================
// 미소법률상담 — better-sqlite3 영속 DB
// =============================================================

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_PATH = path.join(DATA_DIR, "miso.db");

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    -- 대분류 (사기/형사/음주운전/...)
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      emoji TEXT,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    -- 중분류 (전세사기/투자사기/...)
    CREATE TABLE IF NOT EXISTS subcategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      UNIQUE(category_id, slug),
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    -- 사례글
    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      subcategory_id INTEGER,
      title TEXT NOT NULL,
      excerpt TEXT,
      body TEXT NOT NULL,
      published INTEGER NOT NULL DEFAULT 1,
      view_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE,
      FOREIGN KEY(subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_cases_category ON cases(category_id, published);

    -- 쇼츠 영상 링크
    CREATE TABLE IF NOT EXISTS shorts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    -- 키워드별 AI 답변 세트 (관리자 입력)
    CREATE TABLE IF NOT EXISTS ai_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL,
      category_slug TEXT,
      summary TEXT NOT NULL,
      bullets TEXT NOT NULL,           -- JSON 배열
      next_steps TEXT,                 -- JSON 배열
      priority INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
    CREATE INDEX IF NOT EXISTS idx_ai_answers_keyword ON ai_answers(keyword);

    -- 금지어 (AI 답변에서 절대 사용 금지)
    CREATE TABLE IF NOT EXISTS banned_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL UNIQUE,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    -- 상담 신청
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      category_slug TEXT,
      content TEXT,
      source TEXT,                 -- 유입경로
      status TEXT NOT NULL DEFAULT '신규접수',
      admin_memo TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE SET NULL
    );
    CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
    CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC);

    -- 회원
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      email TEXT,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    -- 회원 세션
    CREATE TABLE IF NOT EXISTS member_sessions (
      token TEXT PRIMARY KEY,
      member_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      expires_at TEXT NOT NULL,
      FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE
    );

    -- 사이트 설정 (외부 링크, 일반 안내문 등)
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // -----------------------------------------------------------
  // 시드 데이터 (최초 1회)
  // -----------------------------------------------------------
  const seeded = db
    .prepare("SELECT COUNT(*) AS c FROM categories")
    .get() as { c: number };
  if (seeded.c === 0) {
    seedAll(db);
  }

  // 설정 디폴트
  const insertSetting = db.prepare(
    "INSERT OR IGNORE INTO app_settings(key, value) VALUES (?, ?)",
  );
  insertSetting.run("cafe_url", process.env.DEFAULT_CAFE_URL || "https://cafe.naver.com");
  insertSetting.run(
    "shorts_url",
    process.env.DEFAULT_SHORTS_URL || "https://www.youtube.com",
  );
  insertSetting.run(
    "kakao_url",
    process.env.DEFAULT_KAKAO_URL || "https://pf.kakao.com",
  );
  insertSetting.run(
    "money_banner_title",
    "금전 문제로 막막하시다면 — 무료 상담 받아보세요",
  );
  insertSetting.run(
    "money_banner_desc",
    "회생/파산·압류·채무조정·민사 채권회수까지, 상황별 대응 안내",
  );

  dbInstance = db;
  return db;
}

// =============================================================
// 시드 (8개 대분류 + 중분류 + 사례 + AI 답변 + 금지어)
// =============================================================

type SeedCategory = {
  slug: string;
  name: string;
  emoji: string;
  description: string;
  subs: { slug: string; name: string }[];
};

const SEED_CATEGORIES: SeedCategory[] = [
  {
    slug: "fraud",
    name: "사기 사건",
    emoji: "🕵️",
    description: "전세·투자·중고거래·보이스피싱·대출·지인사기 등",
    subs: [
      { slug: "jeonse", name: "전세사기" },
      { slug: "invest", name: "투자사기" },
      { slug: "secondhand", name: "중고거래 사기" },
      { slug: "voice-phishing", name: "보이스피싱" },
      { slug: "loan", name: "대출사기" },
      { slug: "acquaintance", name: "지인 금전사기" },
      { slug: "etc", name: "기타 사기 사건" },
    ],
  },
  {
    slug: "criminal",
    name: "형사 사건",
    emoji: "⚖️",
    description: "폭행·협박·명예훼손·절도·성범죄·교통범죄 등",
    subs: [
      { slug: "assault", name: "폭행" },
      { slug: "threat", name: "협박" },
      { slug: "defamation", name: "명예훼손" },
      { slug: "theft", name: "절도" },
      { slug: "drug", name: "마약" },
      { slug: "sex-crime", name: "성범죄" },
      { slug: "traffic", name: "교통범죄" },
      { slug: "etc", name: "기타 형사 사건" },
    ],
  },
  {
    slug: "dui",
    name: "음주운전",
    emoji: "🚗",
    description: "단속·사고·측정거부·면허취소·재범 등",
    subs: [
      { slug: "crackdown", name: "음주 단속" },
      { slug: "accident", name: "음주 사고" },
      { slug: "refuse-test", name: "측정 거부" },
      { slug: "license-cancel", name: "면허취소" },
      { slug: "repeat", name: "재범" },
      { slug: "hangover", name: "숙취운전" },
      { slug: "etc", name: "기타 음주 관련" },
    ],
  },
  {
    slug: "voice-phishing",
    name: "보이스피싱",
    emoji: "📞",
    description: "송금 직후 대응, 지급정지, 피해환급금 신청",
    subs: [
      { slug: "transfer", name: "송금 직후" },
      { slug: "stop-payment", name: "지급정지" },
      { slug: "refund", name: "피해환급금" },
      { slug: "fake-cs", name: "허위 검찰·금감원" },
      { slug: "mule", name: "수거책 연루" },
      { slug: "etc", name: "기타" },
    ],
  },
  {
    slug: "civil",
    name: "민사 / 돈 문제",
    emoji: "💼",
    description: "채권회수·계약분쟁·손해배상·임대차 등",
    subs: [
      { slug: "debt-collect", name: "채권회수" },
      { slug: "contract", name: "계약분쟁" },
      { slug: "damage", name: "손해배상" },
      { slug: "rent", name: "임대차" },
      { slug: "small-claim", name: "소액재판" },
      { slug: "etc", name: "기타 민사" },
    ],
  },
  {
    slug: "recovery",
    name: "회생 / 파산",
    emoji: "🛟",
    description: "개인회생·파산·압류·추심·채무조정",
    subs: [
      { slug: "personal-rehab", name: "개인회생" },
      { slug: "bankruptcy", name: "개인파산" },
      { slug: "seizure", name: "압류" },
      { slug: "collection", name: "추심" },
      { slug: "debt-adjust", name: "채무조정" },
    ],
  },
  {
    slug: "family",
    name: "이혼 / 가사",
    emoji: "💔",
    description: "협의이혼·재산분할·양육·위자료·상속",
    subs: [
      { slug: "agreed", name: "협의이혼" },
      { slug: "contested", name: "재판이혼" },
      { slug: "property", name: "재산분할" },
      { slug: "custody", name: "양육·면접교섭" },
      { slug: "compensation", name: "위자료" },
      { slug: "inheritance", name: "상속" },
    ],
  },
  {
    slug: "labor",
    name: "노동 / 퇴직금",
    emoji: "🛠️",
    description: "임금체불·부당해고·산재·퇴직금",
    subs: [
      { slug: "unpaid-wage", name: "임금체불" },
      { slug: "unfair-fire", name: "부당해고" },
      { slug: "severance", name: "퇴직금" },
      { slug: "industrial-accident", name: "산재" },
      { slug: "workplace-bully", name: "직장내 괴롭힘" },
      { slug: "etc", name: "기타 노동" },
    ],
  },
];

const SEED_CASES: Array<{
  cat_slug: string;
  sub_slug?: string;
  title: string;
  excerpt: string;
  body: string;
}> = [];

const SEED_AI_ANSWERS: Array<{
  keyword: string;
  category_slug: string;
  summary: string;
  bullets: string[];
  next_steps: string[];
  priority: number;
}> = [];

const SEED_SHORTS: Array<{
  category_slug?: string;
  title: string;
  url: string;
}> = [];

const SEED_BANNED_WORDS: string[] = [
  "무조건 승소",
  "100% 처벌",
  "반드시 돈을 돌려받",
  "이 사건은 무조건 사기",
  "확실히 무죄",
  "절대 처벌받지 않",
];

function seedAll(db: Database.Database) {
  const insertCat = db.prepare(
    "INSERT INTO categories(slug, name, emoji, description, sort_order) VALUES (?, ?, ?, ?, ?)",
  );
  const insertSub = db.prepare(
    "INSERT INTO subcategories(category_id, slug, name, sort_order) VALUES (?, ?, ?, ?)",
  );
  const insertCase = db.prepare(
    "INSERT INTO cases(category_id, subcategory_id, title, excerpt, body) VALUES (?, ?, ?, ?, ?)",
  );
  const insertAI = db.prepare(
    "INSERT INTO ai_answers(keyword, category_slug, summary, bullets, next_steps, priority) VALUES (?, ?, ?, ?, ?, ?)",
  );
  const insertShort = db.prepare(
    "INSERT INTO shorts(category_id, title, url, sort_order) VALUES (?, ?, ?, ?)",
  );
  const insertBanned = db.prepare("INSERT INTO banned_words(word) VALUES (?)");

  const tx = db.transaction(() => {
    SEED_CATEGORIES.forEach((cat, ci) => {
      const result = insertCat.run(cat.slug, cat.name, cat.emoji, cat.description, ci);
      const catId = Number(result.lastInsertRowid);
      cat.subs.forEach((s, si) => insertSub.run(catId, s.slug, s.name, si));
    });

    const cats = db
      .prepare("SELECT id, slug FROM categories")
      .all() as { id: number; slug: string }[];
    const subs = db
      .prepare("SELECT id, category_id, slug FROM subcategories")
      .all() as { id: number; category_id: number; slug: string }[];

    SEED_CASES.forEach((c) => {
      const cat = cats.find((x) => x.slug === c.cat_slug);
      if (!cat) return;
      let subId: number | null = null;
      if (c.sub_slug) {
        const sub = subs.find(
          (x) => x.category_id === cat.id && x.slug === c.sub_slug,
        );
        if (sub) subId = sub.id;
      }
      insertCase.run(cat.id, subId, c.title, c.excerpt, c.body);
    });

    SEED_AI_ANSWERS.forEach((a) => {
      insertAI.run(
        a.keyword,
        a.category_slug,
        a.summary,
        JSON.stringify(a.bullets),
        JSON.stringify(a.next_steps),
        a.priority,
      );
    });

    SEED_SHORTS.forEach((s, idx) => {
      let cid: number | null = null;
      if (s.category_slug) {
        const cat = cats.find((x) => x.slug === s.category_slug);
        if (cat) cid = cat.id;
      }
      insertShort.run(cid, s.title, s.url, idx);
    });

    SEED_BANNED_WORDS.forEach((w) => insertBanned.run(w));
  });
  tx();
}

// =============================================================
// Repository — 도메인별 데이터 접근 함수
// =============================================================

export type {
  Category,
  Subcategory,
  Case,
  Short,
  AIAnswer,
  BannedWord,
  Inquiry,
  Member,
  InquiryStatus,
} from "./db-types";
export { INQUIRY_STATUSES } from "./db-types";
import type {
  Category,
  Subcategory,
  Case,
  Short,
  AIAnswer,
  BannedWord,
  Inquiry,
  Member,
  InquiryStatus,
} from "./db-types";

// ----- Categories -----
export function listCategories(): Category[] {
  return getDb()
    .prepare("SELECT * FROM categories ORDER BY sort_order, id")
    .all() as Category[];
}
export function getCategoryBySlug(slug: string): Category | null {
  return (
    (getDb()
      .prepare("SELECT * FROM categories WHERE slug = ?")
      .get(slug) as Category | undefined) || null
  );
}
export function listSubcategories(categoryId: number): Subcategory[] {
  return getDb()
    .prepare(
      "SELECT * FROM subcategories WHERE category_id = ? ORDER BY sort_order, id",
    )
    .all(categoryId) as Subcategory[];
}

// ----- Cases -----
export function listCasesByCategory(
  categoryId: number,
  limit = 20,
): Case[] {
  return getDb()
    .prepare(
      "SELECT * FROM cases WHERE category_id = ? AND published = 1 ORDER BY created_at DESC LIMIT ?",
    )
    .all(categoryId, limit) as Case[];
}
export function listCasesBySubcategory(subId: number): Case[] {
  return getDb()
    .prepare(
      "SELECT * FROM cases WHERE subcategory_id = ? AND published = 1 ORDER BY created_at DESC",
    )
    .all(subId) as Case[];
}
export function listAllCases(): Case[] {
  return getDb()
    .prepare("SELECT * FROM cases ORDER BY created_at DESC")
    .all() as Case[];
}
export function getCaseById(id: number): Case | null {
  return (
    (getDb().prepare("SELECT * FROM cases WHERE id = ?").get(id) as
      | Case
      | undefined) || null
  );
}
export function incrementCaseView(id: number) {
  getDb()
    .prepare("UPDATE cases SET view_count = view_count + 1 WHERE id = ?")
    .run(id);
}
export function insertCase(input: {
  category_id: number;
  subcategory_id?: number | null;
  title: string;
  excerpt: string | null;
  body: string;
  published?: number;
}) {
  const res = getDb()
    .prepare(
      "INSERT INTO cases(category_id, subcategory_id, title, excerpt, body, published) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(
      input.category_id,
      input.subcategory_id ?? null,
      input.title,
      input.excerpt,
      input.body,
      input.published ?? 1,
    );
  return Number(res.lastInsertRowid);
}
export function updateCase(
  id: number,
  patch: Partial<{
    category_id: number;
    subcategory_id: number | null;
    title: string;
    excerpt: string | null;
    body: string;
    published: number;
  }>,
) {
  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [k, v] of Object.entries(patch)) {
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (!fields.length) return;
  values.push(id);
  getDb()
    .prepare(`UPDATE cases SET ${fields.join(", ")} WHERE id = ?`)
    .run(...(values as never[]));
}
export function deleteCase(id: number) {
  getDb().prepare("DELETE FROM cases WHERE id = ?").run(id);
}

// ----- Shorts -----
export function listShorts(): Short[] {
  return getDb()
    .prepare("SELECT * FROM shorts ORDER BY sort_order, id")
    .all() as Short[];
}
export function listShortsByCategory(categoryId: number): Short[] {
  return getDb()
    .prepare(
      "SELECT * FROM shorts WHERE category_id = ? OR category_id IS NULL ORDER BY sort_order, id LIMIT 4",
    )
    .all(categoryId) as Short[];
}
export function insertShort(input: {
  category_id: number | null;
  title: string;
  url: string;
  thumbnail_url?: string | null;
  sort_order?: number;
}) {
  const res = getDb()
    .prepare(
      "INSERT INTO shorts(category_id, title, url, thumbnail_url, sort_order) VALUES (?, ?, ?, ?, ?)",
    )
    .run(
      input.category_id,
      input.title,
      input.url,
      input.thumbnail_url ?? null,
      input.sort_order ?? 0,
    );
  return Number(res.lastInsertRowid);
}
export function deleteShort(id: number) {
  getDb().prepare("DELETE FROM shorts WHERE id = ?").run(id);
}

// ----- AI Answers -----
export function listAIAnswers(): AIAnswer[] {
  return getDb()
    .prepare("SELECT * FROM ai_answers ORDER BY priority DESC, id DESC")
    .all() as AIAnswer[];
}
export function findAIAnswerByQuery(query: string): AIAnswer | null {
  const rows = listAIAnswers();
  const q = query.toLowerCase();
  // priority 높은 순으로 키워드 매칭
  for (const r of rows) {
    if (q.includes(r.keyword.toLowerCase())) return r;
  }
  return null;
}
export function insertAIAnswer(input: {
  keyword: string;
  category_slug: string | null;
  summary: string;
  bullets: string[];
  next_steps: string[];
  priority: number;
}) {
  const res = getDb()
    .prepare(
      "INSERT INTO ai_answers(keyword, category_slug, summary, bullets, next_steps, priority) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(
      input.keyword,
      input.category_slug,
      input.summary,
      JSON.stringify(input.bullets),
      JSON.stringify(input.next_steps),
      input.priority,
    );
  return Number(res.lastInsertRowid);
}
export function updateAIAnswer(
  id: number,
  patch: Partial<{
    keyword: string;
    category_slug: string | null;
    summary: string;
    bullets: string[];
    next_steps: string[];
    priority: number;
  }>,
) {
  const fields: string[] = [];
  const values: unknown[] = [];
  if (patch.keyword !== undefined) {
    fields.push("keyword = ?");
    values.push(patch.keyword);
  }
  if (patch.category_slug !== undefined) {
    fields.push("category_slug = ?");
    values.push(patch.category_slug);
  }
  if (patch.summary !== undefined) {
    fields.push("summary = ?");
    values.push(patch.summary);
  }
  if (patch.bullets !== undefined) {
    fields.push("bullets = ?");
    values.push(JSON.stringify(patch.bullets));
  }
  if (patch.next_steps !== undefined) {
    fields.push("next_steps = ?");
    values.push(JSON.stringify(patch.next_steps));
  }
  if (patch.priority !== undefined) {
    fields.push("priority = ?");
    values.push(patch.priority);
  }
  if (!fields.length) return;
  values.push(id);
  getDb()
    .prepare(`UPDATE ai_answers SET ${fields.join(", ")} WHERE id = ?`)
    .run(...(values as never[]));
}
export function deleteAIAnswer(id: number) {
  getDb().prepare("DELETE FROM ai_answers WHERE id = ?").run(id);
}

// ----- Banned Words -----
export function listBannedWords(): BannedWord[] {
  return getDb()
    .prepare("SELECT * FROM banned_words ORDER BY id DESC")
    .all() as BannedWord[];
}
export function addBannedWord(word: string, note?: string) {
  getDb()
    .prepare("INSERT OR IGNORE INTO banned_words(word, note) VALUES (?, ?)")
    .run(word, note ?? null);
}
export function deleteBannedWord(id: number) {
  getDb().prepare("DELETE FROM banned_words WHERE id = ?").run(id);
}
export function applyBanFilter(text: string): string {
  // 금지 표현이 포함되면 완곡 표현으로 치환
  const list = listBannedWords();
  let out = text;
  for (const b of list) {
    const re = new RegExp(escapeRegex(b.word), "g");
    out = out.replace(re, "[정확한 판단은 전문가 상담이 필요합니다]");
  }
  return out;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ----- Inquiries -----
export function listInquiries(): Inquiry[] {
  return getDb()
    .prepare("SELECT * FROM inquiries ORDER BY created_at DESC")
    .all() as Inquiry[];
}
export function listInquiriesByMember(memberId: number): Inquiry[] {
  return getDb()
    .prepare(
      "SELECT * FROM inquiries WHERE member_id = ? ORDER BY created_at DESC",
    )
    .all(memberId) as Inquiry[];
}
export function insertInquiry(input: {
  member_id?: number | null;
  name: string;
  phone: string;
  email?: string | null;
  category_slug?: string | null;
  content?: string | null;
  source?: string | null;
}) {
  const res = getDb()
    .prepare(
      "INSERT INTO inquiries(member_id, name, phone, email, category_slug, content, source) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(
      input.member_id ?? null,
      input.name,
      input.phone,
      input.email ?? null,
      input.category_slug ?? null,
      input.content ?? null,
      input.source ?? null,
    );
  return Number(res.lastInsertRowid);
}
export function updateInquiry(
  id: number,
  patch: Partial<{
    status: InquiryStatus;
    admin_memo: string | null;
  }>,
) {
  const fields: string[] = [];
  const values: unknown[] = [];
  if (patch.status !== undefined) {
    fields.push("status = ?");
    values.push(patch.status);
  }
  if (patch.admin_memo !== undefined) {
    fields.push("admin_memo = ?");
    values.push(patch.admin_memo);
  }
  if (!fields.length) return;
  values.push(id);
  getDb()
    .prepare(`UPDATE inquiries SET ${fields.join(", ")} WHERE id = ?`)
    .run(...(values as never[]));
}
export function deleteInquiry(id: number) {
  getDb().prepare("DELETE FROM inquiries WHERE id = ?").run(id);
}

// ----- Members -----
export function getMemberByPhone(phone: string): Member | null {
  return (
    (getDb().prepare("SELECT * FROM members WHERE phone = ?").get(phone) as
      | Member
      | undefined) || null
  );
}
export function getMemberById(id: number): Member | null {
  return (
    (getDb().prepare("SELECT * FROM members WHERE id = ?").get(id) as
      | Member
      | undefined) || null
  );
}
export function listMembers(): Member[] {
  return getDb()
    .prepare("SELECT * FROM members ORDER BY id DESC")
    .all() as Member[];
}
export function insertMember(input: {
  name: string;
  phone: string;
  email: string | null;
  password_hash: string;
}) {
  const res = getDb()
    .prepare(
      "INSERT INTO members(name, phone, email, password_hash) VALUES (?, ?, ?, ?)",
    )
    .run(input.name, input.phone, input.email, input.password_hash);
  return Number(res.lastInsertRowid);
}
export function deleteMember(id: number) {
  getDb().prepare("DELETE FROM members WHERE id = ?").run(id);
}

// ----- Sessions -----
export function createSession(token: string, memberId: number, expiresAt: string) {
  getDb()
    .prepare(
      "INSERT INTO member_sessions(token, member_id, expires_at) VALUES (?, ?, ?)",
    )
    .run(token, memberId, expiresAt);
}
export function getSessionMember(token: string): Member | null {
  const row = getDb()
    .prepare(
      `SELECT m.* FROM member_sessions s
       JOIN members m ON m.id = s.member_id
       WHERE s.token = ? AND s.expires_at > datetime('now', 'localtime')`,
    )
    .get(token) as Member | undefined;
  return row || null;
}
export function deleteSession(token: string) {
  getDb().prepare("DELETE FROM member_sessions WHERE token = ?").run(token);
}

// ----- App Settings -----
export function getSetting(key: string): string | null {
  const row = getDb()
    .prepare("SELECT value FROM app_settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row ? row.value : null;
}
export function setSetting(key: string, value: string) {
  getDb()
    .prepare(
      `INSERT INTO app_settings(key, value, updated_at) VALUES (?, ?, datetime('now', 'localtime'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .run(key, value);
}
export function listAllSettings(): { key: string; value: string }[] {
  return getDb()
    .prepare("SELECT key, value FROM app_settings ORDER BY key")
    .all() as { key: string; value: string }[];
}

// ----- Stats (관리자 대시보드) -----
export function getInquiryStats(): {
  total: number;
  newCount: number;
  todayCount: number;
} {
  const db = getDb();
  const total = (
    db.prepare("SELECT COUNT(*) AS c FROM inquiries").get() as { c: number }
  ).c;
  const newCount = (
    db
      .prepare("SELECT COUNT(*) AS c FROM inquiries WHERE status = ?")
      .get("신규접수") as { c: number }
  ).c;
  const todayCount = (
    db
      .prepare(
        "SELECT COUNT(*) AS c FROM inquiries WHERE date(created_at) = date('now', 'localtime')",
      )
      .get() as { c: number }
  ).c;
  return { total, newCount, todayCount };
}
