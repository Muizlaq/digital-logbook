import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "digital-logbook-super-secret-jwt-key-32chars-min!!"
);

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPERVISOR" | "USER";
  departmentId?: string | null;
  departmentName?: string | null;
  positionName?: string | null;
  avatarUrl?: string | null;
}

export const SESSION_COOKIE_NAME = "logbook_session";

export async function encryptSession(payload: SessionUser): Promise<string> {
  return new SignJWT({ user: payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function decryptSession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return (payload.user as SessionUser) || null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return decryptSession(token);
}

export async function setSessionCookie(user: SessionUser) {
  const token = await encryptSession(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
