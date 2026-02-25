import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type TokenPayload = {
  realm_access?: { roles?: string[] };
  preferred_username?: string;
  email?: string;
  exp?: number;
};

function decodeJwtPayload(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieJar = await cookies();
  const token = cookieJar.get("kc_access")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false, roles: [] });
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false, roles: [] });
  }

  const username =
    payload.preferred_username ??
    (payload as unknown as { username?: string }).username ??
    null;
  const email = payload.email ?? null;

  return NextResponse.json({
    authenticated: true,
    roles: payload.realm_access?.roles ?? [],
    username,
    email,
    exp: payload.exp ?? null,
  });
}
