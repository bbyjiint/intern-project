import type { Request, Response, NextFunction } from "express";
import { verifyAuthToken } from "../utils/jwt";

export type AuthedRequest = Request & { user?: { id: string; role: "CANDIDATE" | "COMPANY" } };

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    console.log(`[Auth] Missing token for ${req.method} ${req.path}`);
    return res.status(401).json({ error: "Missing Bearer token" });
  }

  try {
    const payload = verifyAuthToken(token);
    req.user = { id: payload.sub, role: payload.role };
    console.log(`[Auth] Token validated for user ${payload.sub} with role ${payload.role} on ${req.method} ${req.path}`);
    return next();
  } catch (error: any) {
    console.log(`[Auth] Token validation failed for ${req.method} ${req.path}:`, error.message || "Invalid token");
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(role: "CANDIDATE" | "COMPANY") {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.log(`[Auth] No user in request for ${req.method} ${req.path}`);
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.role !== role) {
      console.log(`[Auth] Role mismatch for ${req.method} ${req.path}: expected ${role}, got ${req.user.role} (user: ${req.user.id})`);
      return res.status(403).json({ 
        error: "Forbidden",
        message: `This endpoint requires ${role} role, but you have ${req.user.role} role`
      });
    }
    return next();
  };
}

