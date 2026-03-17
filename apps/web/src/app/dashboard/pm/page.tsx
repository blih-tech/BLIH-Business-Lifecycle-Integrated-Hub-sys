import { isAuthorizedForDashboard } from "@/shared/auth/role-routing";
import { getSession } from "@/shared/auth/session";
import { redirect } from "next/navigation";

export default async function ProjectManagementDashboardPage() {
  const session = await getSession();
  if (!session.authenticated) {
    redirect("/auth/signin");
  }

  if (!isAuthorizedForDashboard("pm", session.roles)) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 p-6 md:p-10">
      <h1 className="text-2xl font-semibold tracking-tight">Project Management Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Roadmaps, milestones, and delivery progress across teams.
      </p>
    </main>
  );
}
