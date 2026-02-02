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

