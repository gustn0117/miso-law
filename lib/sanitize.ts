// 입력값 sanitize 유틸 (서버 측 안전장치)

export function sanitize(input: unknown, maxLen = 200): string {
  if (input == null) return "";
  const s = String(input).trim();
  return s.slice(0, maxLen);
}

export function sanitizeMultiline(input: unknown, maxLen = 4000): string {
  if (input == null) return "";
  const s = String(input).replace(/\r\n/g, "\n").trim();
  return s.slice(0, maxLen);
}

export function sanitizeUrl(input: unknown, maxLen = 500): string {
  const s = sanitize(input, maxLen);
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) return "";
  return s;
}

export function ok<T extends object>(data: T = {} as T) {
  return { ok: true as const, ...data };
}

export function fail(error: string) {
  return { ok: false as const, error };
}
