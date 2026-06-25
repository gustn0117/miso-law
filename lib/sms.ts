// 상담 접수 SMS 알림 (Solapi · CoolSMS)
// 환경변수 4개가 모두 채워졌을 때만 동작. 미설정 시 조용히 스킵.
//   SOLAPI_API_KEY     — 콘솔 > API Keys > 발급
//   SOLAPI_API_SECRET  — 동일
//   SOLAPI_FROM        — 등록된 발신번호 (예: 01098857010 — 하이픈/공백 자동 제거)
//   SOLAPI_TO_ADMIN    — 알림 받을 관리자 번호. 콤마로 여러 명 가능 (예: "01011112222,01033334444")
//
// 90byte(한글 ~45자) 초과 시 Solapi가 자동 LMS로 전환.

import crypto from "node:crypto";

const API_URL = "https://api.solapi.com/messages/v4/send-many";

function normalizePhone(raw: string): string {
  return raw.replace(/[^0-9]/g, "");
}

function buildAuthHeader(apiKey: string, apiSecret: string): string {
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString("hex");
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(date + salt)
    .digest("hex");
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

type SendResult = { ok: boolean; error?: string; data?: unknown };

async function sendBatch(
  messages: Array<{ to: string; from: string; text: string }>,
): Promise<SendResult> {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  if (!apiKey || !apiSecret) {
    return { ok: false, error: "SOLAPI 키 미설정" };
  }
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: buildAuthHeader(apiKey, apiSecret),
      },
      body: JSON.stringify({ messages }),
    });
    const data = (await res.json().catch(() => ({}))) as unknown;
    if (!res.ok) {
      return {
        ok: false,
        error: `Solapi HTTP ${res.status}: ${JSON.stringify(data)}`,
        data,
      };
    }
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export type InquirySmsInput = {
  id: number;
  name: string;
  phone: string;
  category?: string | null;
};

export async function sendAdminInquirySms(
  input: InquirySmsInput,
): Promise<void> {
  const from = process.env.SOLAPI_FROM;
  const toRaw = process.env.SOLAPI_TO_ADMIN;
  if (!from || !toRaw) return; // 미설정 → 조용히 스킵
  const recipients = toRaw
    .split(",")
    .map((s) => normalizePhone(s))
    .filter((s) => s.length >= 9 && s.length <= 11);
  if (recipients.length === 0) return;

  // SMS 90byte 한도 내 핵심만 (한글 ~30자). 초과 시 자동 LMS로 전환됨.
  const category = (input.category || "기타").slice(0, 12);
  const name = (input.name || "이름미상").slice(0, 12);
  const text =
    `[미소법률] 신규상담 #${input.id}\n` +
    `${category} · ${name}\n` +
    `${input.phone}`;

  const fromNorm = normalizePhone(from);
  const messages = recipients.map((to) => ({ to, from: fromNorm, text }));

  const result = await sendBatch(messages);
  if (!result.ok) {
    console.error("[sms] Solapi 발송 실패:", result.error);
  }
}
