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
}> = [
  {
    cat_slug: "fraud",
    sub_slug: "jeonse",
    title: "전세보증금 못 받을 위기, 초기 대응 정리",
    excerpt:
      "임대인의 자산 상태와 등기 변동을 확인하고 임차권 등기명령부터 검토합니다.",
    body: "## 상황 요약\n계약 만료가 가까운데 임대인이 보증금을 돌려주지 않는다는 의사를 비치는 경우, 빠른 시간 안에 다음 단계를 검토해야 합니다.\n\n## 초기 조치\n- 등기부등본 재발급 — 근저당·압류 변동 확인\n- 임대인의 자산·신용 상태 점검\n- 임차권 등기명령 신청 검토\n- 보증보험 가입 여부 확인\n\n## 검토 가능한 절차\n- 보증금 반환 소송\n- 강제집행 (배당·경매)\n- 형사 고소(전세사기 의심 시) — 다만 형사고소만으로 보증금이 자동 회수되지는 않습니다.\n\n초기 자료 확보가 가장 중요합니다. 계약서·이체내역·문자/카톡 기록을 모두 보관해 두세요.",
  },
  {
    cat_slug: "fraud",
    sub_slug: "voice-phishing",
    title: "보이스피싱 송금 직후 30분이 중요한 이유",
    excerpt:
      "지급정지 신청 시점에 따라 회수 가능성이 크게 달라집니다.",
    body: "## 송금 직후 즉시 해야 할 일\n1. 송금 은행 고객센터에 \"보이스피싱 지급정지\" 요청\n2. 112 또는 경찰서 사이버수사대에 신고\n3. 통화 녹취/메신저 캡처/송금 영수증 보관\n\n## 자주 묻는 질문\n- Q. 지급정지가 되면 돈을 무조건 돌려받나요?\n  A. 잔액이 남아있는 경우에만 환급 절차로 진행될 수 있으며, 이미 인출된 부분은 회수가 어려울 수 있습니다.\n\n## 추가로 도움이 될 만한 절차\n- 피해환급금 신청 (전기통신금융사기 피해환급법)\n- 명의도용·대포통장 연루 여부 확인",
  },
  {
    cat_slug: "criminal",
    sub_slug: "assault",
    title: "단순 폭행과 상해, 처벌 수위가 다른 이유",
    excerpt: "상해진단서 발급 여부와 합의 가능 시점이 핵심입니다.",
    body: "## 단순폭행 vs 상해\n- 단순폭행: 반의사불벌죄(피해자가 처벌을 원치 않으면 처벌 X)\n- 상해: 반의사불벌죄가 아님, 합의해도 처벌 가능\n\n## 초기 대응\n- 사건 직후 진료 기록 확보\n- CCTV·블랙박스 등 영상 자료 보존\n- 목격자 진술 정리\n\n## 합의 시 유의사항\n- 합의서 작성 — 처벌불원·고소취하 여부 명시\n- 송금 내역 보관",
  },
  {
    cat_slug: "dui",
    sub_slug: "crackdown",
    title: "음주 단속, 거부하면 어떻게 되나?",
    excerpt: "측정거부는 별도의 형사 처벌과 행정처분이 따라옵니다.",
    body: "## 측정 거부의 법적 효과\n- 도로교통법상 측정거부는 별도 처벌 대상\n- 면허취소 등 행정처분도 함께\n\n## 단속 직후 체크리스트\n- 단속 시간/장소/측정 기기 기록\n- 호흡 측정과 채혈 측정의 차이 확인\n- 본인의 음주 시점·량 정리\n\n## 양형 사유\n- 측정 결과 (수치)\n- 음주 운전 거리/시간\n- 재범 여부\n- 사고 여부",
  },
  {
    cat_slug: "recovery",
    sub_slug: "personal-rehab",
    title: "개인회생 신청, 자격과 절차 한눈에",
    excerpt:
      "정기적인 소득이 있어야 하며 변제계획안 인가 시 채무가 조정됩니다.",
    body: "## 개인회생이란\n과중한 채무를 안고 있는 채무자가 정기소득에서 일정 금액을 3년간 변제하면 나머지 채무를 면책받는 제도입니다.\n\n## 자격 요건 (요지)\n- 정기적인 수입 (급여·사업소득 등)\n- 총 무담보 채무 10억, 담보 채무 15억 이하 (한도는 변경될 수 있음)\n\n## 절차 흐름\n1. 신청 — 변제계획안 제출\n2. 개시결정\n3. 채권자 집회·변제계획 인가\n4. 변제 (보통 36개월)\n5. 면책결정\n\n신청 전 채권자 통지·압류 진행 여부를 함께 검토해야 합니다.",
  },
  {
    cat_slug: "family",
    sub_slug: "property",
    title: "재산분할, '기여도'를 어떻게 입증하나",
    excerpt: "혼인 기간 동안 형성된 재산 흐름을 객관적으로 보여주는 자료가 핵심입니다.",
    body: "## 재산분할 대상\n- 부부 공동으로 형성한 재산\n- 일방의 명의여도 협력으로 형성·유지된 부분 포함\n\n## 기여도 입증 자료\n- 소득 기록·이체 내역\n- 가사·육아 부담 정도\n- 부동산 취득·대출 상환 흐름\n\n## 분할 비율\n- 사례에 따라 50:50 외에도 다양하게 산정됩니다.",
  },
  {
    cat_slug: "labor",
    sub_slug: "unpaid-wage",
    title: "임금체불, 노동청 진정 vs 민사소송 어느 쪽?",
    excerpt: "회수 가능성과 시간을 모두 고려해 선택하시는 것을 권장드립니다.",
    body: "## 노동청 진정\n- 비용 부담 적음\n- 사업주에 시정 권고\n- 형사 고소까지 확장 가능\n\n## 민사소송 (지급명령 포함)\n- 집행권원 확보로 강제집행 가능\n- 소액사건이면 절차 간이\n\n## 같이 검토할 권리\n- 퇴직금·연차수당\n- 4대보험 미가입에 따른 별도 권리",
  },
  {
    cat_slug: "civil",
    sub_slug: "debt-collect",
    title: "빌려준 돈, 받아낼 수 있는 절차",
    excerpt: "차용증 유무에 따라 입증 난이도가 크게 달라집니다.",
    body: "## 입증 자료가 있는 경우\n- 차용증·이체내역 → 지급명령 / 소액재판 검토\n- 인용 후 강제집행 (예금·급여·동산 압류)\n\n## 입증 자료가 부족한 경우\n- 카톡·문자·통화 녹취 등 정황 자료 수집\n- 상대방의 자인(自認) 확보 시 유리\n\n## 시효\n- 통상 10년 (개별 약정에 따라 다를 수 있음)",
  },
];

const SEED_AI_ANSWERS: Array<{
  keyword: string;
  category_slug: string;
  summary: string;
  bullets: string[];
  next_steps: string[];
  priority: number;
}> = [
  {
    keyword: "보이스피싱",
    category_slug: "voice-phishing",
    summary:
      "보이스피싱이 의심되는 상황으로 검토될 수 있습니다. 가장 먼저 송금 차단과 증거 보존이 중요합니다.",
    bullets: [
      "송금 직후라면 송금 은행 고객센터·112에 \"지급정지\" 신청",
      "통화/문자/송금 영수증 캡처와 녹취 보관",
      "허위 검찰·금감원 사칭에 응하지 않기 — 정식 기관은 송금을 요구하지 않습니다",
      "추가 송금·대출 진행 중이라면 즉시 중단",
    ],
    next_steps: [
      "피해환급금 신청 검토",
      "관련 사례 보기",
      "전문가 상담 신청",
    ],
    priority: 100,
  },
  {
    keyword: "전세사기",
    category_slug: "fraud",
    summary:
      "전세사기 의심 상황으로 검토될 수 있습니다. 임대인의 자산·등기 상태부터 확인이 필요합니다.",
    bullets: [
      "등기부등본을 재발급해 근저당·압류 변동 확인",
      "임차권 등기명령 신청 검토",
      "보증보험 가입 여부와 청구 가능 시점 확인",
      "계약서·이체내역·문자 기록 모두 보관",
    ],
    next_steps: [
      "보증금 반환 절차 안내",
      "관련 사례 보기",
      "전문가 상담 신청",
    ],
    priority: 100,
  },
  {
    keyword: "음주운전",
    category_slug: "dui",
    summary:
      "음주운전 사건으로 검토될 수 있습니다. 측정 방법·수치·운전 경위가 양형에 큰 영향을 줍니다.",
    bullets: [
      "단속 시간·장소·측정 기기 정확히 메모",
      "호흡 측정 후 채혈 요청권 확인",
      "재범·사고 여부에 따라 처분 수위가 크게 달라짐",
      "면허 행정처분과 형사처벌은 별개 절차",
    ],
    next_steps: [
      "행정처분(면허) 대응 안내",
      "관련 사례 보기",
      "전문가 상담 신청",
    ],
    priority: 90,
  },
  {
    keyword: "개인회생",
    category_slug: "recovery",
    summary:
      "개인회생을 통한 채무 조정이 가능한지 검토될 수 있습니다. 정기소득과 채무 규모가 핵심 판단요소입니다.",
    bullets: [
      "정기 소득이 있어야 신청 가능 (급여·사업소득 등)",
      "변제계획안에 따라 통상 36개월 변제 후 면책",
      "압류·추심이 진행 중이라면 신청 시점 검토 필요",
    ],
    next_steps: ["회생 vs 파산 비교", "관련 사례 보기", "전문가 상담 신청"],
    priority: 90,
  },
  {
    keyword: "이혼",
    category_slug: "family",
    summary:
      "이혼 절차로 검토될 수 있는 상황입니다. 협의이혼·재판이혼 중 어떤 절차가 적절한지 판단이 필요합니다.",
    bullets: [
      "협의 가능 여부 — 양육·재산분할·위자료에 대한 합의 정도",
      "재산분할은 혼인 기간 동안 형성된 재산이 대상",
      "양육권·면접교섭권은 자녀의 복리 기준으로 판단",
    ],
    next_steps: ["재산분할 기여도 자료", "관련 사례 보기", "전문가 상담 신청"],
    priority: 80,
  },
  {
    keyword: "임금체불",
    category_slug: "labor",
    summary:
      "임금체불 상황으로 검토될 수 있습니다. 노동청 진정과 민사절차 중 선택이 필요합니다.",
    bullets: [
      "근로계약서·급여명세·근태 기록 보관",
      "노동청 진정 — 비용 부담 적음, 시정 권고 + 형사 고소 확장 가능",
      "지급명령·소액재판 — 강제집행 권원 확보",
      "퇴직금·연차수당도 함께 청구 검토",
    ],
    next_steps: ["진정서 작성 안내", "관련 사례 보기", "전문가 상담 신청"],
    priority: 80,
  },
  {
    keyword: "사기",
    category_slug: "fraud",
    summary:
      "사기 사건으로 검토될 수 있습니다. 다만 형사상 사기죄 성립 여부와 민사상 회수는 별개 절차입니다.",
    bullets: [
      "고소 시 기망행위·재산상 손해·고의 입증이 필요",
      "차용금 분쟁은 사기로 평가되지 않을 수도 있음",
      "민사 회수를 위해 차용증·이체내역·메신저 기록 보관",
    ],
    next_steps: ["사기/민사 구분 안내", "관련 사례 보기", "전문가 상담 신청"],
    priority: 70,
  },
  {
    keyword: "폭행",
    category_slug: "criminal",
    summary:
      "폭행 사건으로 검토될 수 있습니다. 단순폭행과 상해의 구분, 진단서 발급 여부가 처벌에 영향을 줍니다.",
    bullets: [
      "사건 직후 진료 기록·상해진단서 확보",
      "CCTV·블랙박스·목격자 진술 정리",
      "합의 시 처벌불원·고소취하 명확히 기재",
    ],
    next_steps: ["합의서 작성 안내", "관련 사례 보기", "전문가 상담 신청"],
    priority: 70,
  },
];

const SEED_SHORTS: Array<{
  category_slug?: string;
  title: string;
  url: string;
}> = [
  {
    category_slug: "voice-phishing",
    title: "보이스피싱 송금 직후, 30분 안에 할 일",
    url: "https://www.youtube.com/shorts/example1",
  },
  {
    category_slug: "fraud",
    title: "전세사기 의심? 등기부등본 보는 법",
    url: "https://www.youtube.com/shorts/example2",
  },
  {
    category_slug: "dui",
    title: "음주 단속 측정 거부, 어떻게 될까?",
    url: "https://www.youtube.com/shorts/example3",
  },
  {
    category_slug: "recovery",
    title: "개인회생 vs 개인파산, 1분 비교",
    url: "https://www.youtube.com/shorts/example4",
  },
];

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
