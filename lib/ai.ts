// =============================================================
// 미소 법률 · 금융 상담 AI 안내 엔진
//  - 1순위: 관리자 등록 키워드 답변 세트 (ai_answers 테이블)
//  - 2순위: 카테고리 키워드 매칭 → 카테고리별 기본 안내문
//  - 3순위(선택): OPENAI_API_KEY 설정 시 OpenAI(gpt-4o-mini)로 보강
//  - 4순위: 비법률 질문 → 안내문 + 카테고리 안내
//
// 명세 4번 가드: 확정적 표현 금지, 금지어 필터 적용, 비법률 질문은 정중히 안내.
// 키워드 매칭이 항상 우선. LLM은 매칭이 잡혔을 때 보조적으로만 호출.
// =============================================================

import {
  applyBanFilter,
  findAIAnswerByQuery,
  getCategoryBySlug,
  listCategories,
  type Category,
} from "./db";

export type AIAnswerPayload = {
  summary: string;
  bullets: string[];
  next_steps: string[];
  matched_category_slug: string | null;
  source: "admin_set" | "category_default" | "llm" | "off_topic";
  disclaimer: string;
};

const DISCLAIMER =
  "본 답변은 일반 정보 안내이며, 사건의 결과를 보장하지 않습니다. 정확한 판단은 전문가 상담을 통해 확인해 주세요.";

const OFF_TOPIC_REPLY =
  "본 서비스는 법률 상담 및 관련 사례 안내를 위한 서비스입니다. 법률·채무·사건·피해 관련 질문을 입력해 주세요.";

// 카테고리별 키워드 매핑 (검색어 → 카테고리 추천에 사용)
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  fraud: [
    "사기",
    "전세사기",
    "투자사기",
    "중고거래",
    "당근",
    "대출사기",
    "지인사기",
    "차용",
    "송금",
    "기망",
  ],
  criminal: [
    "형사",
    "폭행",
    "협박",
    "명예훼손",
    "절도",
    "성범죄",
    "강제추행",
    "강간",
    "스토킹",
    "마약",
    "교통범죄",
    "뺑소니",
    "고소",
    "고발",
    "처벌",
  ],
  dui: [
    "음주",
    "음주운전",
    "단속",
    "면허취소",
    "면허정지",
    "측정거부",
    "재범",
    "숙취운전",
    "혈중알코올",
  ],
  "voice-phishing": [
    "보이스피싱",
    "피싱",
    "전기통신금융사기",
    "지급정지",
    "환급",
    "검찰사칭",
    "금감원사칭",
    "대포통장",
  ],
  civil: [
    "민사",
    "돈을 빌려",
    "빌려준 돈",
    "차용증",
    "임대차",
    "보증금",
    "월세",
    "전세",
    "손해배상",
    "소액재판",
    "지급명령",
    "임대인",
    "임차인",
  ],
  recovery: [
    "회생",
    "파산",
    "개인회생",
    "개인파산",
    "압류",
    "추심",
    "채무",
    "변제",
    "면책",
    "독촉",
  ],
  family: [
    "이혼",
    "재산분할",
    "양육",
    "위자료",
    "면접교섭",
    "친권",
    "상속",
    "유류분",
    "가사",
    "협의이혼",
    "재판이혼",
  ],
  labor: [
    "임금",
    "월급",
    "체불",
    "퇴직금",
    "부당해고",
    "산재",
    "노동",
    "직장",
    "퇴사",
    "휴게시간",
    "야근",
    "주휴수당",
  ],
};

// 비법률 키워드 — 일부만 매칭되면 off-topic으로 처리
const NON_LEGAL_HINTS = [
  "코딩",
  "프로그래밍",
  "맛집",
  "여행",
  "주식 추천",
  "코인 추천",
  "다이어트",
  "연애 운세",
  "운세",
  "사주",
];

export function matchCategory(query: string): Category | null {
  const q = query.toLowerCase();
  const cats = listCategories();
  // 카테고리 이름 직접 매칭
  for (const c of cats) {
    if (q.includes(c.name.toLowerCase())) return c;
    if (q.includes(c.slug.toLowerCase())) return c;
  }
  // 키워드 사전 매칭
  for (const [slug, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some((kw) => q.includes(kw))) {
      const c = cats.find((x) => x.slug === slug);
      if (c) return c;
    }
  }
  return null;
}

function isOffTopic(query: string): boolean {
  const q = query.toLowerCase();
  if (NON_LEGAL_HINTS.some((h) => q.includes(h))) return true;
  // 카테고리 키워드가 하나도 안 잡히고 길이가 너무 짧으면 off-topic으로 본다
  const allKw = Object.values(CATEGORY_KEYWORDS).flat();
  const hit = allKw.some((k) => q.includes(k));
  if (!hit && q.replace(/\s+/g, "").length < 3) return true;
  return false;
}

function categoryDefaultAnswer(cat: Category): AIAnswerPayload {
  // 카테고리별 일반 안내 (관리자가 ai_answers를 채우기 전에도 빈 화면 방지)
  const DEFAULTS: Record<string, Omit<AIAnswerPayload, "matched_category_slug" | "source" | "disclaimer">> = {
    fraud: {
      summary: `${cat.name}으로 검토될 수 있는 상황입니다. 다만 형사상 사기 성립과 민사상 회수는 별개 절차입니다.`,
      bullets: [
        "차용증·이체내역·메신저 기록을 모두 보관",
        "기망행위·재산상 손해·고의 입증이 필요",
        "민사 회수는 지급명령/소액재판부터 검토 가능",
      ],
      next_steps: ["관련 사례 보기", "상담 신청하기", "관련 쇼츠 보기"],
    },
    criminal: {
      summary:
        "형사 사건으로 검토될 수 있는 상황입니다. 초기 진술과 자료 보존이 양형에 큰 영향을 줍니다.",
      bullets: [
        "사건 직후 진료 기록·CCTV·녹취 확보",
        "조사 출석 전 진술 정리 권장",
        "합의·고소취하 시점 검토",
      ],
      next_steps: ["관련 사례 보기", "상담 신청하기", "관련 쇼츠 보기"],
    },
    dui: {
      summary:
        "음주운전 사건은 측정 방법·수치·운전 경위가 양형에 큰 영향을 줍니다.",
      bullets: [
        "단속 시간·장소·측정 기기 정확히 메모",
        "호흡 측정 후 채혈 요청권 확인",
        "면허 행정처분과 형사처벌은 별개",
      ],
      next_steps: ["관련 사례 보기", "상담 신청하기", "관련 쇼츠 보기"],
    },
    "voice-phishing": {
      summary:
        "보이스피싱이 의심되는 상황으로 검토될 수 있습니다. 초기 30분의 대응이 회수 가능성을 좌우합니다.",
      bullets: [
        "송금 은행 고객센터·112에 즉시 지급정지 신청",
        "통화·문자·송금 영수증 모두 보관",
        "추가 송금·대출 요구는 즉시 중단",
      ],
      next_steps: ["관련 사례 보기", "상담 신청하기", "관련 쇼츠 보기"],
    },
    civil: {
      summary:
        "민사 분쟁으로 검토될 수 있습니다. 청구권 종류와 시효, 입증 자료에 따라 절차가 달라집니다.",
      bullets: [
        "계약서·이체내역·메신저 기록을 시간 순으로 정리",
        "지급명령/소액재판 절차 검토",
        "강제집행을 위한 상대방 자산 파악",
      ],
      next_steps: ["관련 사례 보기", "상담 신청하기", "관련 쇼츠 보기"],
    },
    recovery: {
      summary:
        "회생/파산을 통한 채무 조정 가능성이 검토될 수 있습니다. 소득 유무와 채무 규모가 핵심입니다.",
      bullets: [
        "정기소득이 있으면 개인회생 검토",
        "변제 여력이 없으면 개인파산 검토",
        "압류·추심 진행 중이라면 신청 시점이 중요",
      ],
      next_steps: ["관련 사례 보기", "상담 신청하기", "관련 쇼츠 보기"],
    },
    family: {
      summary:
        "가사·이혼 사건은 협의 가능 여부에 따라 절차가 크게 달라집니다.",
      bullets: [
        "협의이혼·재판이혼 중 적합한 절차 판단",
        "재산분할은 혼인 기간 형성 재산 기준",
        "양육·면접교섭은 자녀 복리 우선",
      ],
      next_steps: ["관련 사례 보기", "상담 신청하기", "관련 쇼츠 보기"],
    },
    labor: {
      summary:
        "노동 분쟁으로 검토될 수 있는 상황입니다. 노동청 진정과 민사 절차를 모두 고려해야 합니다.",
      bullets: [
        "근로계약서·급여명세·근태 자료 확보",
        "노동청 진정 — 비용 부담 적음",
        "지급명령·소액재판으로 집행권원 확보",
      ],
      next_steps: ["관련 사례 보기", "상담 신청하기", "관련 쇼츠 보기"],
    },
  };
  const def = DEFAULTS[cat.slug] || DEFAULTS.civil;
  return {
    summary: applyBanFilter(def.summary),
    bullets: def.bullets.map(applyBanFilter),
    next_steps: def.next_steps,
    matched_category_slug: cat.slug,
    source: "category_default",
    disclaimer: DISCLAIMER,
  };
}

export async function answerQuery(query: string): Promise<AIAnswerPayload> {
  const q = query.trim();
  if (!q) {
    return {
      summary: "검색어를 입력해 주세요.",
      bullets: [],
      next_steps: ["메인 페이지로 돌아가기"],
      matched_category_slug: null,
      source: "off_topic",
      disclaimer: DISCLAIMER,
    };
  }

  // 1) 관리자 등록 답변 세트 매칭
  const admin = findAIAnswerByQuery(q);
  if (admin) {
    let bullets: string[] = [];
    let nextSteps: string[] = [];
    try {
      bullets = JSON.parse(admin.bullets);
    } catch {}
    try {
      nextSteps = admin.next_steps ? JSON.parse(admin.next_steps) : [];
    } catch {}
    return {
      summary: applyBanFilter(admin.summary),
      bullets: bullets.map(applyBanFilter),
      next_steps:
        nextSteps.length > 0
          ? nextSteps
          : ["관련 사례 보기", "상담 신청하기", "관련 쇼츠 보기"],
      matched_category_slug: admin.category_slug,
      source: "admin_set",
      disclaimer: DISCLAIMER,
    };
  }

  // 2) 비법률 질문 가드
  if (isOffTopic(q)) {
    return {
      summary: OFF_TOPIC_REPLY,
      bullets: [
        "사기·형사·음주운전·보이스피싱·민사·회생/파산·이혼·노동 등의 분야를 다룹니다.",
      ],
      next_steps: ["분야별 카테고리 보기"],
      matched_category_slug: null,
      source: "off_topic",
      disclaimer: DISCLAIMER,
    };
  }

  // 3) 카테고리 매칭 → 기본 안내
  const cat = matchCategory(q);
  if (cat) {
    // LLM 보강 시도 (선택)
    const llm = await maybeLLMSummary(q, cat);
    if (llm) return llm;
    return categoryDefaultAnswer(cat);
  }

  // 4) 매칭 실패 → 일반 안내
  return {
    summary:
      "입력하신 내용만으로는 분야를 특정하기 어렵습니다. 사기·형사·음주운전·보이스피싱·민사·회생/파산·이혼·노동 중 가까운 분야를 선택해 주세요.",
    bullets: [
      "관련 자료(계약서·이체·문자·CCTV 등) 확보가 가장 중요합니다",
      "초기 대응 시점이 결과에 큰 영향을 줄 수 있습니다",
    ],
    next_steps: ["분야별 카테고리 보기", "상담 신청하기"],
    matched_category_slug: null,
    source: "category_default",
    disclaimer: DISCLAIMER,
  };
}

// (선택) OPENAI_API_KEY 설정 시 OpenAI로 보강 — 없거나 실패해도 안전
//  - 모델: OPENAI_MODEL 환경변수로 변경 가능 (기본: gpt-4o-mini)
//  - 키워드 매칭이 잡힌 경우에만 호출하므로 비용/지연 영향을 최소화
async function maybeLLMSummary(
  query: string,
  cat: Category,
): Promise<AIAnswerPayload | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  try {
    const sys = `당신은 한국 법률 상담 플랫폼 '미소 법률 · 금융 상담'의 1차 안내 도우미입니다.
다음 원칙을 반드시 지킵니다:
- 결과를 확정짓는 표현 금지: "무조건 승소/100% 처벌/반드시 돈을 돌려받/이 사건은 무조건 사기/확실히 무죄/절대 처벌받지 않" 같은 단언 금지
- 모든 답변은 "검토될 수 있습니다", "초기 대응이 중요합니다", "관련 자료 확보가 필요합니다" 류의 완곡한 표현을 사용
- 법률 외 질문이 들어오면 "본 서비스는 법률 상담 및 관련 사례 안내를 위한 서비스입니다"로 안내
- 출력은 반드시 JSON: {"summary": string, "bullets": string[3-5], "next_steps": string[2-4]}
- summary는 2문장 이내. bullets은 각 1문장.`;
    const usr = `사용자 질문: "${query}"\n해당 카테고리: ${cat.name}\n위 카테고리 맥락에 맞춰 JSON으로만 답변하세요.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 800,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: sys },
          { role: "user", content: usr },
        ],
      }),
      // 5초 안 응답 없으면 fallback
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.warn("[ai] OpenAI non-OK:", res.status);
      return null;
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content || "";
    if (!text) return null;
    // response_format=json_object면 text 자체가 JSON 문자열
    let parsed: { summary?: string; bullets?: string[]; next_steps?: string[] };
    try {
      parsed = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) return null;
      parsed = JSON.parse(m[0]);
    }
    if (!parsed.summary || !Array.isArray(parsed.bullets)) return null;
    return {
      summary: applyBanFilter(parsed.summary),
      bullets: parsed.bullets.map((b) => applyBanFilter(String(b))),
      next_steps:
        parsed.next_steps && parsed.next_steps.length > 0
          ? parsed.next_steps
          : ["관련 사례 보기", "상담 신청하기", "관련 쇼츠 보기"],
      matched_category_slug: cat.slug,
      source: "llm",
      disclaimer: DISCLAIMER,
    };
  } catch (err) {
    console.warn("[ai] LLM fallback failed:", err);
    return null;
  }
}

export function categoryFromSlug(slug: string | null): Category | null {
  if (!slug) return null;
  return getCategoryBySlug(slug);
}

/* ============================================================
   Conversational chat — multi-turn dialogue
   ============================================================ */

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ChatReply = {
  reply: string;
  matched_category_slug: string | null;
  source: "llm" | "keyword" | "off-topic" | "fallback";
};

const CHAT_SYSTEM_PROMPT = `당신은 '미소 법률 · 금융 상담'의 1차 AI 상담사입니다. 변호사가 아닙니다.

[역할]
- 사용자의 법률 고민을 차분히 듣고, 카테고리를 분류하고, 즉시 취해야 할 액션을 안내합니다.
- 직접 법률 자문 금지. 항상 "전문 상담이 필요합니다"로 마무리.
- 8개 분야: 사기, 형사, 음주운전, 보이스피싱, 민사·돈문제, 회생·파산, 이혼·가사, 노동·퇴직금.

[금지 표현]
"무조건 승소", "100% 처벌", "반드시 돈을 돌려받", "확실히 무죄", "절대 처벌받지 않" 같은 단언은 절대 금지.
대신: "검토될 수 있습니다", "초기 대응이 중요합니다", "관련 자료 확보가 필요합니다".

[톤]
- 차분하고 전문적. 마케팅 톤·이모지·과한 강조 금지.
- 2~4문장으로 짧게. 불릿이 필요하면 "- "로 시작하는 1~3개 항목.
- 한국어 존댓말. 사용자가 불안할 수 있으니 공감 한 문장 + 실제 조치 안내.

[법률 외 질문]
"본 서비스는 법률 상담 및 관련 사례 안내 서비스입니다. 법률·채무·사건·피해 관련 질문을 입력해 주세요." 한 문장만.

[대화 흐름]
- 첫 응답: 상황 정리 + 즉시 조치 1~2개 + 추가 정보 요청 질문.
- 후속 응답: 받은 정보로 더 구체적 안내 + 필요 시 "/inquiry"로 상담 신청 권유.
- 3~4턴 이상 깊어지면 "정확한 판단은 전문 상담이 필요합니다. 상담 신청을 통해 분야 전문가와 연결해 드립니다." 안내.`;

function fallbackChatReply(userMessage: string): ChatReply {
  if (isOffTopic(userMessage)) {
    return {
      reply:
        "본 서비스는 법률 상담 및 관련 사례 안내 서비스입니다. 법률·채무·사건·피해 관련 질문을 입력해 주세요.",
      matched_category_slug: null,
      source: "off-topic",
    };
  }
  const cat = matchCategory(userMessage);
  if (cat) {
    const def = categoryDefaultAnswer(cat);
    const bullets = def.bullets.slice(0, 2).map((b) => `- ${b}`).join("\n");
    return {
      reply: `${def.summary}\n\n${bullets}\n\n더 정확한 안내가 필요하시면 '${cat.name}' 분야로 상담 신청을 도와드릴 수 있습니다.`,
      matched_category_slug: cat.slug,
      source: "keyword",
    };
  }
  return {
    reply:
      "입력하신 내용만으로는 분야를 특정하기 어렵습니다. 사기·형사·음주운전·보이스피싱·민사·회생/파산·이혼·노동 중 가까운 상황을 조금 더 구체적으로 알려주실 수 있을까요? 예: '전세보증금을 못 받고 있어요', '음주운전 단속에 걸렸어요'.",
    matched_category_slug: null,
    source: "fallback",
  };
}

// === Provider implementations ============================================

async function callGemini(
  messages: ChatMessage[],
): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  // Gemini: role은 "user" | "model" — assistant는 model로 매핑
  const contents = messages
    .filter((m) => m.role !== "system")
    .slice(-10)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: CHAT_SYSTEM_PROMPT }] },
          contents,
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 800,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
          ],
        }),
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!res.ok) {
      console.warn("[ai/chat] Gemini non-OK:", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as {
      candidates?: {
        content?: { parts?: { text?: string }[] };
      }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    return text || null;
  } catch (err) {
    console.warn("[ai/chat] Gemini error:", err);
    return null;
  }
}

async function callOpenAI(
  messages: ChatMessage[],
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.5,
        max_tokens: 600,
        messages: [
          { role: "system", content: CHAT_SYSTEM_PROMPT },
          ...messages
            .filter((m) => m.role !== "system")
            .slice(-10)
            .map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.warn("[ai/chat] OpenAI non-OK:", res.status);
      return null;
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim() || "";
    return text || null;
  } catch (err) {
    console.warn("[ai/chat] OpenAI error:", err);
    return null;
  }
}

export async function chatWithAI(
  messages: ChatMessage[],
): Promise<ChatReply> {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user" || !last.content.trim()) {
    return {
      reply: "메시지를 입력해 주세요.",
      matched_category_slug: null,
      source: "fallback",
    };
  }

  const matched = matchCategory(last.content);
  const fallback = fallbackChatReply(last.content);

  // 우선순위: Gemini (무료) → OpenAI → keyword fallback
  let text: string | null = null;
  if (process.env.GEMINI_API_KEY) {
    text = await callGemini(messages);
  }
  if (!text && process.env.OPENAI_API_KEY) {
    text = await callOpenAI(messages);
  }
  if (!text) return fallback;

  return {
    reply: applyBanFilter(text),
    matched_category_slug: matched?.slug ?? null,
    source: "llm",
  };
}
