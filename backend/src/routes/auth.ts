import { Router } from "express";
import prisma from "../utils/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { signAuthToken } from "../utils/jwt";
import { requireAuth, type AuthedRequest } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const { email, password, confirmPassword } = req.body ?? {};
  if (typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "email is required" });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "password must be at least 8 characters" });
  }
  if (confirmPassword !== undefined && confirmPassword !== password) {
    return res.status(400).json({ error: "passwords do not match" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const socialID = `local:${normalizedEmail}`;

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return res.status(409).json({ error: "email already in use" });

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: passwordHash,
      authProvider: "LOCAL",
      role: "CANDIDATE", // default; can be changed at role selection
      socialID,
      CandidateProfile: {
        create: {},
      },
    },
    select: { id: true, email: true, role: true },
  });

  const token = signAuthToken({ sub: user.id, role: user.role });
  return res.status(201).json({ token, user });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "email is required" });
  }
  if (typeof password !== "string" || password.length === 0) {
    return res.status(400).json({ error: "password is required" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, role: true, password: true, authProvider: true },
  });

  // Avoid leaking which field failed.
  if (!user || user.authProvider !== "LOCAL" || !user.password) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const ok = await verifyPassword(user.password, password);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });

  const token = signAuthToken({ sub: user.id, role: user.role });
  return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      CandidateProfile: { select: { id: true, fullName: true } },
      CompanyProfile: { select: { id: true, companyName: true } },
    },
  });
  return res.json({ user });
});

authRouter.patch("/me/role", requireAuth, async (req: AuthedRequest, res) => {
  const { role } = req.body ?? {};
  if (role !== "CANDIDATE" && role !== "COMPANY") {
    return res.status(400).json({ error: "role must be CANDIDATE or COMPANY" });
  }

  const userId = req.user!.id;
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, role: true },
  });

  const token = signAuthToken({ sub: updated.id, role: updated.role });
  return res.json({ token, user: updated });
});

