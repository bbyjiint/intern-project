import { Router } from "express";
import { randomUUID } from "crypto";
import prisma from "../utils/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { signAuthToken } from "../utils/jwt";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { createOAuthState, normalizeEmail, requireEnv, verifyOAuthState, type OAuthProvider } from "../utils/oauth";
import { verifyGoogleIdToken } from "../utils/oauth_google";
import { exchangeLineCodeForTokens, verifyLineIdToken } from "../utils/oauth_line";

export const authRouter = Router();

async function findOrCreateSocialUser(args: {
  provider: OAuthProvider;
  providerUserId: string;
  email: string;
}) {
  const email = normalizeEmail(args.email);
  const socialID = `${args.provider.toLowerCase()}:${args.providerUserId}`;

  const bySocial = await prisma.user.findUnique({
    where: { socialID },
    select: { id: true, email: true, role: true },
  });
  if (bySocial) return bySocial;

  const byEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true, authProvider: true },
  });
  if (byEmail) {
    // Schema constraint: `email` is unique, and we currently support one auth provider per user.
    throw new Error("EMAIL_ALREADY_IN_USE_WITH_DIFFERENT_PROVIDER");
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: null,
      authProvider: args.provider,
      role: null, // Role will be set on role selection page
      socialID,
      ...(args.provider === "LINE" ? { lineUserID: args.providerUserId } : {}),
    },
    select: { id: true, email: true, role: true },
  });
  return user;
}

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
      role: null, // Role will be set on role selection page
      socialID,
    },
    select: { id: true, email: true, role: true },
  });

  // Sign token without role (role is null initially)
  const token = signAuthToken({ sub: user.id, role: user.role ?? "CANDIDATE" });
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

  // Use temporary role for token if user hasn't selected role yet
  const token = signAuthToken({ sub: user.id, role: user.role ?? "CANDIDATE" });
  return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// ---------- Google ----------
// Token-based login (SPA-friendly). Client sends Google `id_token`.
authRouter.post("/google", async (req, res) => {
  const { idToken } = req.body ?? {};
  if (typeof idToken !== "string" || idToken.length < 20) {
    return res.status(400).json({ error: "idToken is required" });
  }

  try {
    const claims = await verifyGoogleIdToken(idToken);
    if (!claims.email) return res.status(400).json({ error: "google account has no email" });

    const user = await findOrCreateSocialUser({
      provider: "GOOGLE",
      providerUserId: claims.sub,
      email: claims.email,
    });

    // Use temporary role for token if user hasn't selected role yet
    const token = signAuthToken({ sub: user.id, role: user.role ?? "CANDIDATE" });
    return res.json({ token, user });
  } catch (e: any) {
    if (e?.message === "EMAIL_ALREADY_IN_USE_WITH_DIFFERENT_PROVIDER") {
      return res.status(409).json({ error: "email already in use with a different login method" });
    }
    return res.status(401).json({ error: "invalid google token" });
  }
});

// Redirect-based login (classic OAuth).
authRouter.get("/google/start", async (req, res) => {
  const clientId = requireEnv("GOOGLE_CLIENT_ID");
  const redirectUri = requireEnv("GOOGLE_REDIRECT_URI");
  const returnTo = typeof req.query.returnTo === "string" ? req.query.returnTo : undefined;

  const state = createOAuthState("GOOGLE", returnTo);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

authRouter.get("/google/callback", async (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code : undefined;
  const state = typeof req.query.state === "string" ? req.query.state : undefined;
  if (!code || !state) return res.status(400).json({ error: "missing code/state" });

  let returnTo: string | undefined;
  try {
    const s = verifyOAuthState(state);
    if (s.provider !== "GOOGLE") return res.status(400).json({ error: "invalid state" });
    returnTo = s.returnTo;
  } catch {
    return res.status(400).json({ error: "invalid state" });
  }

  try {
    const clientId = requireEnv("GOOGLE_CLIENT_ID");
    const clientSecret = requireEnv("GOOGLE_CLIENT_SECRET");
    const redirectUri = requireEnv("GOOGLE_REDIRECT_URI");

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const resp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });

    const json = (await resp.json()) as { id_token?: string; error?: string; error_description?: string };
    if (!resp.ok || !json.id_token) {
      return res.status(401).json({ error: json.error_description || json.error || "google token exchange failed" });
    }

    const claims = await verifyGoogleIdToken(json.id_token);
    if (!claims.email) return res.status(400).json({ error: "google account has no email" });

    const user = await findOrCreateSocialUser({
      provider: "GOOGLE",
      providerUserId: claims.sub,
      email: claims.email,
    });

    const token = signAuthToken({ sub: user.id, role: user.role ?? "CANDIDATE" });

    if (returnTo) {
      const url = new URL(returnTo);
      url.searchParams.set("token", token);
      return res.redirect(url.toString());
    }

    return res.json({ token, user });
  } catch (e: any) {
    if (e?.message === "EMAIL_ALREADY_IN_USE_WITH_DIFFERENT_PROVIDER") {
      return res.status(409).json({ error: "email already in use with a different login method" });
    }
    return res.status(401).json({ error: "google login failed" });
  }
});

// ---------- LINE ----------
// Token-based login (e.g. LINE LIFF can provide an `id_token`).
authRouter.post("/line", async (req, res) => {
  const { idToken } = req.body ?? {};
  if (typeof idToken !== "string" || idToken.length < 20) {
    return res.status(400).json({ error: "idToken is required" });
  }

  try {
    const claims = await verifyLineIdToken(idToken);
    if (!claims.email) return res.status(400).json({ error: "line token missing email (request scope 'email')" });

    const user = await findOrCreateSocialUser({
      provider: "LINE",
      providerUserId: claims.sub,
      email: claims.email,
    });

    // Use temporary role for token if user hasn't selected role yet
    const token = signAuthToken({ sub: user.id, role: user.role ?? "CANDIDATE" });
    return res.json({ token, user });
  } catch (e: any) {
    if (e?.message === "EMAIL_ALREADY_IN_USE_WITH_DIFFERENT_PROVIDER") {
      return res.status(409).json({ error: "email already in use with a different login method" });
    }
    return res.status(401).json({ error: "invalid line token" });
  }
});

// Redirect-based LINE login.
authRouter.get("/line/start", async (req, res) => {
  const channelId = requireEnv("LINE_CHANNEL_ID");
  const redirectUri = requireEnv("LINE_REDIRECT_URI");
  const returnTo = typeof req.query.returnTo === "string" ? req.query.returnTo : undefined;

  const state = createOAuthState("LINE", returnTo);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: channelId,
    redirect_uri: redirectUri,
    state,
    scope: "openid profile email",
  });

  return res.redirect(`https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`);
});

authRouter.get("/line/callback", async (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code : undefined;
  const state = typeof req.query.state === "string" ? req.query.state : undefined;
  if (!code || !state) return res.status(400).json({ error: "missing code/state" });

  let returnTo: string | undefined;
  try {
    const s = verifyOAuthState(state);
    if (s.provider !== "LINE") return res.status(400).json({ error: "invalid state" });
    returnTo = s.returnTo;
  } catch {
    return res.status(400).json({ error: "invalid state" });
  }

  try {
    const redirectUri = requireEnv("LINE_REDIRECT_URI");
    const tokenResp = await exchangeLineCodeForTokens({ code, redirectUri });
    if (!tokenResp.id_token) return res.status(401).json({ error: "LINE did not return id_token" });

    const claims = await verifyLineIdToken(tokenResp.id_token);
    if (!claims.email) return res.status(400).json({ error: "line token missing email (request scope 'email')" });

    const user = await findOrCreateSocialUser({
      provider: "LINE",
      providerUserId: claims.sub,
      email: claims.email,
    });

    const token = signAuthToken({ sub: user.id, role: user.role ?? "CANDIDATE" });

    if (returnTo) {
      const url = new URL(returnTo);
      url.searchParams.set("token", token);
      return res.redirect(url.toString());
    }

    return res.json({ token, user });
  } catch (e: any) {
    if (e?.message === "EMAIL_ALREADY_IN_USE_WITH_DIFFERENT_PROVIDER") {
      return res.status(409).json({ error: "email already in use with a different login method" });
    }
    return res.status(401).json({ error: "line login failed" });
  }
});

// Optional: exchange a LINE `code` for an app JWT (no browser redirect needed).
authRouter.post("/line/code", async (req, res) => {
  const { code, redirectUri } = req.body ?? {};
  if (typeof code !== "string" || code.length < 2) return res.status(400).json({ error: "code is required" });
  if (typeof redirectUri !== "string" || redirectUri.length < 5) {
    return res.status(400).json({ error: "redirectUri is required" });
  }

  try {
    const tokenResp = await exchangeLineCodeForTokens({ code, redirectUri });
    if (!tokenResp.id_token) return res.status(401).json({ error: "LINE did not return id_token" });

    const claims = await verifyLineIdToken(tokenResp.id_token);
    if (!claims.email) return res.status(400).json({ error: "line token missing email (request scope 'email')" });

    const user = await findOrCreateSocialUser({
      provider: "LINE",
      providerUserId: claims.sub,
      email: claims.email,
    });

    // Use temporary role for token if user hasn't selected role yet
    const token = signAuthToken({ sub: user.id, role: user.role ?? "CANDIDATE" });
    return res.json({ token, user });
  } catch (e: any) {
    if (e?.message === "EMAIL_ALREADY_IN_USE_WITH_DIFFERENT_PROVIDER") {
      return res.status(409).json({ error: "email already in use with a different login method" });
    }
    return res.status(401).json({ error: "line login failed" });
  }
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

  // Add displayName based on role
  const displayName = user?.role === "CANDIDATE" 
    ? user.CandidateProfile?.fullName || user.email
    : user?.role === "COMPANY"
    ? user.CompanyProfile?.companyName || user.email
    : user?.email || "User";

  return res.json({ 
    user: {
      ...user,
      displayName,
    }
  });
});

authRouter.patch("/me/role", requireAuth, async (req: AuthedRequest, res) => {
  const { role } = req.body ?? {};
  if (role !== "CANDIDATE" && role !== "COMPANY") {
    return res.status(400).json({ error: "role must be CANDIDATE or COMPANY" });
  }

  const userId = req.user!.id;
  
  // Check if user already has a role
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, CandidateProfile: { select: { id: true } }, CompanyProfile: { select: { id: true } } },
  });

  if (currentUser?.role) {
    return res.status(400).json({ error: "role has already been set" });
  }

  // Update role and create appropriate profile
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      role,
      ...(role === "CANDIDATE" && !currentUser?.CandidateProfile
        ? { CandidateProfile: { create: { id: randomUUID(), updatedAt: new Date() } } }
        : {}),
      ...(role === "COMPANY" && !currentUser?.CompanyProfile
        ? { CompanyProfile: { create: { id: randomUUID(), companyName: "Company", updatedAt: new Date() } } }
        : {}),
    },
    select: { id: true, email: true, role: true },
  });

  const token = signAuthToken({ sub: updated.id, role: updated.role! });
  return res.json({ token, user: updated });
});

