import { NextResponse } from "next/server";

function isDemoModeEnabled() {
  return process.env.DEMO_MODE === "true";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  if (!isDemoModeEnabled()) {
    return NextResponse.redirect(new URL("/auth/signin", requestUrl));
  }

  const response = NextResponse.redirect(new URL("/dashboard/hr", requestUrl));
  response.cookies.set("demo_session", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}
