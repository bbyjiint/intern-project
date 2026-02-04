import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

export type AuthTokenPayload = {
  sub: string; // userId
  role: "CANDIDATE" | "COMPANY";
};

export function signAuthToken(payload: AuthTokenPayload, opts?: { expiresIn?: SignOptions["expiresIn"] }): string {
  const secret: Secret = process.env.JWT_SECRET || "dev-secret-change-me";
  const options: SignOptions = {
    algorithm: "HS256",
    expiresIn: opts?.expiresIn ?? "7d",
  };
  return jwt.sign(payload, secret, options);
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const secret: Secret = process.env.JWT_SECRET || "dev-secret-change-me";
  try {
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] }) as AuthTokenPayload;
    
    // Validate payload structure
    if (!payload.sub || !payload.role) {
      throw new Error("Invalid token payload: missing sub or role");
    }
    
    if (payload.role !== "CANDIDATE" && payload.role !== "COMPANY") {
      throw new Error(`Invalid token payload: invalid role ${payload.role}`);
    }
    
    return payload;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    } else if (error.name === "NotBeforeError") {
      throw new Error("Token not active yet");
    }
    throw error;
  }
}

