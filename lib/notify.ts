// 상담 접수 시 운영자 알림. SMTP env가 모두 설정된 경우에만 실제로 동작.
// nodemailer를 동적 import로 가져와 의존성을 옵션화한다.

type InquiryNotifyInput = {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  category_slug?: string | null;
  content?: string | null;
  source?: string | null;
};

export async function notifyNewInquiry(input: InquiryNotifyInput): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_TO } =
    process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM || !SMTP_TO) {
    // SMTP 미설정 — 조용히 스킵 (관리자 페이지의 '신규접수' 카드로 확인)
    return;
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
