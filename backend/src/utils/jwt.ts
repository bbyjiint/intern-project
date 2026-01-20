import jwt from "jsonwebtoken";

export type AuthTokenPayload = {
  sub: string; // userId
  role: "CANDIDATE" | "COMPANY";
};

export function signAuthToken(payload: AuthTokenPayload): string {
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  return jwt.sign(payload, secret, { algorithm: "HS256", expiresIn: "7d" });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  return jwt.verify(token, secret, { algorithms: ["HS256"] }) as AuthTokenPayload;
}

