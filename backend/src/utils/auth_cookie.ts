import type { Response } from "express";

export const AUTH_COOKIE_NAME = "auth";

function getAuthCookieOptions(args?: { rememberMe?: boolean }) {
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
