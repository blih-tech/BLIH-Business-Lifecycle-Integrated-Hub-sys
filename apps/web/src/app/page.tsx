import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ROLES } from "@/shared/constants/roles";
import { cookies, headers } from "next/headers";

type SessionResponse = {
  authenticated: boolean;
  roles: string[];
  username: string | null;
  email: string | null;
  exp: number | null;
};

async function getSession(): Promise<SessionResponse> {
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
}

export default async function Home() {
  const session = await getSession();
  const isSuperAdmin = session.roles.includes(ROLES.SUPERADMIN);
  const isHrManager = session.roles.includes(ROLES.HR_MANAGER);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-6xl space-y-6 p-6 md:p-10">
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">BLIH CORE</h1>
            <Badge>{session.authenticated ? "Signed in" : "Guest"}</Badge>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Session overview from Keycloak access token.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild>
              <a href="/auth/signin">Sign in</a>
            </Button>
            <Button variant="secondary" asChild>
              <a href="/api/auth/logout">Sign out</a>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>User Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Username:</span>{" "}
                {session.username ?? "—"}
              </p>
              <p>
                <span className="font-medium text-foreground">Email:</span>{" "}
                {session.email ?? "—"}
              </p>
              <p>
                <span className="font-medium text-foreground">Roles:</span>{" "}
                {session.roles.length > 0 ? session.roles.join(", ") : "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role-Based UI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Superadmin:</span>{" "}
                {isSuperAdmin ? "Visible" : "Hidden"}
              </p>
              <p>
                <span className="font-medium text-foreground">HR Manager:</span>{" "}
                {isHrManager ? "Visible" : "Hidden"}
              </p>
            </CardContent>
          </Card>
        </section>

        {isSuperAdmin && (
          <section className="rounded-xl border border-border bg-sidebar p-6 text-sidebar-foreground">
            <p className="text-sm font-medium">Superadmin Console</p>
            <p className="mt-1 text-sm opacity-90">
              This section is only visible to users with the <code>superadmin</code> role.
            </p>
          </section>
        )}

        {isHrManager && (
          <section className="rounded-xl border border-border bg-card p-6">
            <p className="text-sm font-medium">HR Manager Workspace</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Visible only when the <code>hr_manager</code> role is present.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
