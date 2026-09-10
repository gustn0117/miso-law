// 상담 접수 SMS 알림 (Solapi · CoolSMS)
// 환경변수 3개(KEY·SECRET·FROM)가 채워졌을 때만 동작. 미설정 시 조용히 스킵.
//   SOLAPI_API_KEY     — 콘솔 > API Keys > 발급
//   SOLAPI_API_SECRET  — 동일
//   SOLAPI_FROM        — 등록된 발신번호 (예: 01098857010 — 하이픈/공백 자동 제거)
// 수신번호는 관리자 > 설정의 "문의 접수 문자 알림 번호"(app_settings.sms_notify_to).
//   SOLAPI_TO_ADMIN    — 위 설정 행이 없을 때만 쓰는 대체값 (콤마로 여러 명)
//
// 90byte(한글 ~45자) 초과 시 Solapi가 자동 LMS로 전환.

import crypto from "node:crypto";
import { getSetting } from "./db";

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

// 수신번호: 관리자 설정(app_settings.sms_notify_to)이 우선.
// 설정 행이 아예 없을 때만 SOLAPI_TO_ADMIN env로 대체. 빈 값으로 저장하면 발송 중지.
function resolveRecipients(): string[] {
  let raw: string | null = null;
  try {
    raw = getSetting("sms_notify_to");
  } catch (e) {
    console.error("[sms] 수신번호 설정 조회 실패:", e);
  }
  if (raw === null) raw = process.env.SOLAPI_TO_ADMIN || "";
  return raw
    .split(",")
    .map((s) => normalizePhone(s))
    .filter((s) => s.length >= 9 && s.length <= 11);
}

function formatPhone(n: string): string {
  if (n.length === 11) return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`;
  if (n.length === 10) return `${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`;
  return n;
}

export type InquirySmsInput = {
  id: number;
  /** 문자 첫 줄 구분 라벨 (예: "법률문의", "대출문의") */
  label: string;
  name: string;
  phone: string;
  category?: string | null;
};

export async function sendAdminInquirySms(
  input: InquirySmsInput,
): Promise<void> {
  const from = process.env.SOLAPI_FROM;
  if (!from) return; // 미설정 → 조용히 스킵
  const recipients = resolveRecipients();
  if (recipients.length === 0) return;

  // SMS 90byte 한도 내 핵심만 (한글 ~30자). 초과 시 자동 LMS로 전환됨.
  const category = (input.category || "기타").slice(0, 12);
  const name = (input.name || "이름미상").slice(0, 12);
  const text =
    `[미소법률] ${input.label} #${input.id}\n` +
    `${category} · ${name}\n` +
    `${formatPhone(normalizePhone(input.phone))}`;

  const fromNorm = normalizePhone(from);
  const messages = recipients.map((to) => ({ to, from: fromNorm, text }));

  const result = await sendBatch(messages);
  if (!result.ok) {
    console.error("[sms] Solapi 발송 실패:", result.error);
  }
}
