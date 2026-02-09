import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export type OAuthProvider = "GOOGLE" | "LINE";

export type OAuthStatePayload = {
  typ: "oauth_state";
  provider: OAuthProvider;
  returnTo?: string;
  nonce: string;
};

function getOAuthStateSecret(): string {
  return process.env.OAUTH_STATE_SECRET || process.env.JWT_SECRET || "dev-secret-change-me";
}

export function createOAuthState(provider: OAuthProvider, returnTo?: string): string {
  const payload: OAuthStatePayload = {
    typ: "oauth_state",
    provider,
    returnTo,
    nonce: crypto.randomUUID(),
  };

  return jwt.sign(payload, getOAuthStateSecret(), {
    algorithm: "HS256",
    expiresIn: "10m",
  });
}

export function verifyOAuthState(token: string): OAuthStatePayload {
  const payload = jwt.verify(token, getOAuthStateSecret(), { algorithms: ["HS256"] }) as OAuthStatePayload;
  if (!payload || payload.typ !== "oauth_state") throw new Error("invalid oauth state");
  return payload;
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing`);
  return value;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

