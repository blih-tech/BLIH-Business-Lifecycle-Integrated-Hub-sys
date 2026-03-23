import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ROLES, type Role } from '@/shared/constants/roles';

type TokenPayload = {
  realm_access?: { roles?: string[] };
  preferred_username?: string;
  email?: string;
  exp?: number;
};

function decodeJwtPayload(token: string): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payloadPart = parts[1];
    if (!payloadPart) return null;
    const payload = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      '=',
    );
    const json = Buffer.from(padded, 'base64').toString('utf8');
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieJar = await cookies();
  const token = cookieJar.get('kc_access')?.value;
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
  const roleValues = new Set<string>(Object.values(ROLES));
  const roles = (payload.realm_access?.roles ?? []).filter(
    (role): role is Role => roleValues.has(role),
  );

  return NextResponse.json({
    authenticated: true,
    roles,
    username,
    email,
    exp: payload.exp ?? null,
  });
}
