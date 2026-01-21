import { OAuth2Client } from "google-auth-library";
import { requireEnv } from "./oauth";

export type GoogleIdTokenClaims = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

let cachedClient: OAuth2Client | undefined;

function getClient(): OAuth2Client {
  if (!cachedClient) {
    const clientId = requireEnv("GOOGLE_CLIENT_ID");
    cachedClient = new OAuth2Client(clientId);
  }
  return cachedClient;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdTokenClaims> {
  const clientId = requireEnv("GOOGLE_CLIENT_ID");
  const ticket = await getClient().verifyIdToken({ idToken, audience: clientId });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) throw new Error("google token missing required claims");

  return {
    sub: payload.sub,
    email: payload.email,
    email_verified: payload.email_verified,
    name: payload.name,
    picture: payload.picture,
  };
}

