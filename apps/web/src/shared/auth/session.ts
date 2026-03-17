import { type Role } from "@/shared/constants/roles";
import { cookies, headers } from "next/headers";
import { cache } from "react";

export type SessionResponse = {
  authenticated: boolean;
  roles: Role[];
  username: string | null;
  email: string | null;
  exp: number | null;
};

export const getSession = cache(async (): Promise<SessionResponse> => {
  const host = (await headers()).get("host");
  const baseUrl = host ? `http://${host}` : "http://localhost:3000";
  const cookieHeader = (await cookies()).toString();
  const res = await fetch(`${baseUrl}/api/auth/session`, {
    cache: "no-store",
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
  if (!res.ok) {
    return { authenticated: false, roles: [], username: null, email: null, exp: null };
  }
  return (await res.json()) as SessionResponse;
});
