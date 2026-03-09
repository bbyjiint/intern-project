import type { Response, Request } from "express";
import jwt from "jsonwebtoken";

export const AUTH_COOKIE_NAME = "auth";

export function getAuthCookieOptions(args?: {
  rememberMe?: boolean;
}) {
  const rememberMe = args?.rememberMe ?? false;

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(rememberMe ? { maxAge: 30 * 24 * 60 * 60 * 1000 } : {}),
  };
}

export function setAuthCookie(res: Response, token: string, args?: { rememberMe?: boolean }) {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions(args));
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export function getUserIdFromRequest(req: Request): string {

  const token = req.cookies?.[AUTH_COOKIE_NAME]

  if (!token) {
    throw new Error("Unauthorized")
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET!) as any

  return payload.sub
}