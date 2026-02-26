import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

function buildLogoutUrl({
  idToken,
  postLogoutRedirect,
}: {
  idToken: string;
  postLogoutRedirect: string;
}): string {
  const base = requireEnv("KEYCLOAK_URL").replace(/\/+$/, "");
  const realm = requireEnv("KEYCLOAK_REALM");
  const url = new URL(`${base}/realms/${realm}/protocol/openid-connect/logout`);
  url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set("post_logout_redirect_uri", postLogoutRedirect);
  return url.toString();
}

export async function GET(request: Request) {
  const cookieJar = await cookies();
  const idToken = cookieJar.get("kc_id")?.value;
  cookieJar.delete("kc_access");
  cookieJar.delete("kc_refresh");
  cookieJar.delete("kc_id");
  cookieJar.delete("kc_state");
  cookieJar.delete("kc_verifier");
  cookieJar.delete("kc_nonce");

  const redirectParam =
    new URL(request.url).searchParams.get("redirect") ?? "/auth/signin";
  const redirectUrl = new URL(redirectParam, request.url);

  if (idToken) {
    return NextResponse.redirect(
      buildLogoutUrl({ idToken, postLogoutRedirect: redirectUrl.toString() }),
    );
  }

  return NextResponse.redirect(redirectUrl);
}
