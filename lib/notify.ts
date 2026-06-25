// 상담 접수 시 운영자 알림.
// - 이메일(SMTP_*): SMTP env가 모두 설정된 경우에만 발송 (nodemailer 동적 import)
// - SMS(SOLAPI_*): SOLAPI env가 모두 설정된 경우에만 발송 (lib/sms)
// 두 채널은 병렬(Promise.allSettled)로 발송되며 하나가 실패해도 다른 하나는 진행됨.

import { sendAdminInquirySms } from "./sms";

type InquiryNotifyInput = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  category_slug?: string | null;
  content?: string | null;
  source?: string | null;
};

async function sendEmail(input: InquiryNotifyInput): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_TO } =
    process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM || !SMTP_TO) {
    return; // SMTP 미설정 — 조용히 스킵
  }
  try {
    const mod = await import("nodemailer").catch(() => null);
    if (!mod) {
      console.warn(
        "[notify] nodemailer 미설치. npm i nodemailer 후 SMTP 알림 활성화.",
      );
      return;
    }
    const transporter = mod.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT || 587) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    const subject = `[미소 법률 · 대출 상담] 신규 상담 접수 #${input.id} — ${input.name}`;
    const text = [
      `상담 신청이 접수되었습니다.`,
      ``,
      `이름: ${input.name}`,
      `연락처: ${input.phone}`,
      `이메일: ${input.email || "-"}`,
      `분야: ${input.category_slug || "-"}`,
      `유입경로: ${input.source || "-"}`,
      ``,
      `내용:`,
      input.content || "-",
    ].join("\n");
    await transporter.sendMail({
      from: SMTP_FROM,
      to: SMTP_TO,
      subject,
      text,
    });
  } catch (err) {
    console.error("[notify] sendMail error:", err);
  }
}

export async function notifyNewInquiry(
  input: InquiryNotifyInput,
): Promise<void> {
  await Promise.allSettled([
    sendEmail(input),
    sendAdminInquirySms({
      id: input.id,
      name: input.name,
      phone: input.phone,
      category: input.category_slug,
    }),
  ]);
}
