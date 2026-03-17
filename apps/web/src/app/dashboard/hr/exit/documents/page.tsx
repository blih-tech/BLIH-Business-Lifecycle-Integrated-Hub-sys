import { ExitDocumentsContent } from "@/features/hr/exit/documents";
import { isAuthorizedForDashboard } from "@/shared/auth/role-routing";
import { getSession } from "@/shared/auth/session";
import { redirect } from "next/navigation";

export default async function ExitDocumentsPage() {
  const session = await getSession();
  if (!session.authenticated) {
    redirect("/auth/signin");
  }

  if (!isAuthorizedForDashboard("hr", session.roles)) {
    redirect("/dashboard");
  }

  return <ExitDocumentsContent />;
}
