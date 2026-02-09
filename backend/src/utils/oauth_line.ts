import { createRemoteJWKSet, jwtVerify } from "jose";
import { requireEnv } from "./oauth";

export type LineIdTokenClaims = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
};

const LINE_JWKS = createRemoteJWKSet(new URL("https://api.line.me/oauth2/v2.1/certs"));

export async function verifyLineIdToken(idToken: string): Promise<LineIdTokenClaims> {
  const channelId = requireEnv("LINE_CHANNEL_ID");
  const { payload } = await jwtVerify(idToken, LINE_JWKS, {
    issuer: "https://access.line.me",
    audience: channelId,
  });

  const sub = typeof payload.sub === "string" ? payload.sub : undefined;
  if (!sub) throw new Error("line token missing sub");

  const email = typeof payload.email === "string" ? payload.email : undefined;
  const name = typeof payload.name === "string" ? payload.name : undefined;
  const picture = typeof payload.picture === "string" ? payload.picture : undefined;

  return { sub, email, name, picture };
}

export type LineTokenResponse = {
  access_token?: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

export async function exchangeLineCodeForTokens(args: {
  code: string;
  redirectUri: string;
}): Promise<LineTokenResponse> {
  const channelId = requireEnv("LINE_CHANNEL_ID");
  const channelSecret = requireEnv("LINE_CHANNEL_SECRET");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: args.code,
    redirect_uri: args.redirectUri,
    client_id: channelId,
    client_secret: channelSecret,
  });

  const resp = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  const json = (await resp.json()) as LineTokenResponse;
  if (!resp.ok) {
    const msg = json.error_description || json.error || "LINE token exchange failed";
    throw new Error(msg);
  }
  return json;
}

