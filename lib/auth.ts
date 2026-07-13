import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import {
  createSession,
  deleteSession,
  getSessionMember,
  type Member,
} from "./db";

export const MEMBER_COOKIE = "miso_member";
export const SESSION_DAYS = 30;

export type MemberPublic = Omit<Member, "password_hash">;

// scrypt 기반 비번 해시: salt:hash
export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(pw, salt, 64);
  const orig = Buffer.from(hash, "hex");
  if (orig.length !== test.length) return false;
  return timingSafeEqual(orig, test);
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

// 임시 비밀번호: 혼동되기 쉬운 문자(0,O,o,1,l,I) 제외한 8자리 영숫자
export function generateTempPassword(length = 8): string {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

export function loginMember(memberId: number) {
  const token = generateToken();
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DAYS);
  const expiresIso = expires.toISOString().slice(0, 19).replace("T", " ");
  createSession(token, memberId, expiresIso);
  cookies().set(MEMBER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });
}

export function logoutMember() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  if (token) {
    deleteSession(token);
  }
  cookies().delete(MEMBER_COOKIE);
}

export function getCurrentMember(): MemberPublic | null {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  if (!token) return null;
  const m = getSessionMember(token);
  if (!m) return null;
  const { password_hash: _ph, ...pub } = m;
  return pub;
}

export function requireMember(): MemberPublic {
  const m = getCurrentMember();
  if (!m) throw new Error("UNAUTHORIZED");
  return m;
}

// 폰 번호 정규화 (숫자만)
export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

export function isValidPhone(phone: string): boolean {
  const n = normalizePhone(phone);
  return n.length >= 10 && n.length <= 11;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
