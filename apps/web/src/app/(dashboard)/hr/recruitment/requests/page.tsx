import { RecruitmentRequestsContent } from '@/features/hr/recruitment/requests';
import { JobPermissions } from '@repo/types/rbac/permissions.constants';
import { userHasPermission } from '@/shared/auth/permission-check';
import { AccessDeniedCallout } from '@/shared/components/access/access-denied-callout';
import { getSession } from '@/shared/auth/session';

export default async function RecruitmentRequestsPage() {
  const session = await getSession();
  const canViewJobs = userHasPermission(
    session.permissions,
    session.roles,
    JobPermissions.VIEW,
  );

  if (!canViewJobs) {
    return (
      <AccessDeniedCallout
        title="Cannot view job requests"
        description="You do not have permission to list hiring requests and jobs in this workspace."
        requiredPermission={JobPermissions.VIEW}
      />
    );
  }

  return (
    <RecruitmentRequestsContent currentUserName={session.username ?? 'User'} />
  );
}
