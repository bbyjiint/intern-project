import type { Response } from "express";

export const AUTH_COOKIE_NAME = "auth";

export function getAuthCookieOptions(args?: {
  rememberMe?: boolean;
}): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge?: number;
} {
  const rememberMe = args?.rememberMe ?? false;
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
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

