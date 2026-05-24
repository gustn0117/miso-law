import { cookies } from "next/headers";

export const ADMIN_COOKIE = "miso_admin";
export const ADMIN_TTL_HOURS = 8;

export function isAdmin(): boolean {
  return cookies().get(ADMIN_COOKIE)?.value === "1";
}

export function loginAdmin(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "1234";
  if (password !== expected) return false;
  cookies().set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_TTL_HOURS * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });
  return true;
}

export function logoutAdmin() {
  cookies().delete(ADMIN_COOKIE);
}
