import { getDashboardPath } from "@/shared/auth/role-routing";
import { getSession } from "@/shared/auth/session";
import { redirect } from "next/navigation";

export default async function DashboardIndexPage() {
  const session = await getSession();
  if (!session.authenticated) {
    redirect("/auth/signin");
  }

  const dashboardPath = getDashboardPath(session.roles);
  if (dashboardPath) {
    redirect(dashboardPath);
  }

  redirect("/auth/signin?error=role_missing");
}
