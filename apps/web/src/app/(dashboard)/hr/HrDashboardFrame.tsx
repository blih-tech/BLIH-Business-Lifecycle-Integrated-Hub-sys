'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { HrSidebarShell } from '@/app/(dashboard)/hr/HrSidebarShell';
import { AppHeader } from '@/shared/components/AppHeader';
import {
  HrAbilityProvider,
  useHrAbility,
} from '@/shared/auth/hr-ability-context';
import { JobPermissions } from '@repo/types/rbac/permissions.constants';
import { useGuardedAction } from '@/shared/hooks/use-guarded-action';
import { SidebarProvider, useSidebar } from '@/shared/components/ui/sidebar';

type HrDashboardFrameProps = {
  user: {
    initials: string;
    name: string;
    email: string;
    onLogout?: () => void;
  };
  roles: string[];
  permissions: string[];
  children: React.ReactNode;
  isLoading?: boolean;
};

function HrDashboardFrameInner({
  user,
  children,
  isLoading,
}: Pick<HrDashboardFrameProps, 'user' | 'children' | 'isLoading'>) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasPermission } = useHrAbility();
  const guardCreateNavigation = useGuardedAction(JobPermissions.CREATE);
  const isHrRoot = pathname === '/hr';
  const { toggleSidebar } = useSidebar();
  const [subnavOpen, setSubnavOpen] = React.useState(!isHrRoot);

  const createActionByPath = React.useMemo(
    () => ({
      '/hr/recruitment/requests': {
        label: 'Create New Request',
        onClick: () =>
          guardCreateNavigation(() =>
            router.push('/hr/recruitment/requests?create=new-request'),
          ),
      },
    }),
    [guardCreateNavigation, router],
  );

  const rawCreateAction =
    createActionByPath[pathname as keyof typeof createActionByPath];

  const createAction =
    rawCreateAction && hasPermission(JobPermissions.CREATE)
      ? rawCreateAction
      : undefined;

  React.useEffect(() => {
    setSubnavOpen(!isHrRoot);
  }, [isHrRoot]);

  const handleHeaderToggle = React.useCallback(() => {
    if (isHrRoot) {
      toggleSidebar();
      return;
    }
    setSubnavOpen((prev) => !prev);
  }, [isHrRoot, toggleSidebar]);

  const handleLogout = React.useCallback(() => {
    window.location.href = '/api/auth/logout?redirect=/';
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <HrSidebarShell
        user={{ ...user, onLogout: handleLogout }}
        subnavOpen={subnavOpen}
        onRequestOpenSubnav={() => setSubnavOpen(true)}
        isLoading={isLoading}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader
          onToggleSubnav={handleHeaderToggle}
          showCreate={Boolean(createAction)}
          createLabel={createAction?.label}
          onCreate={createAction?.onClick}
        />
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export function HrDashboardFrame({
  user,
  roles,
  permissions,
  children,
  isLoading,
}: HrDashboardFrameProps): React.ReactElement {
  return (
    <SidebarProvider defaultOpen={false} className="w-full">
      <HrAbilityProvider roles={roles} permissions={permissions}>
        <HrDashboardFrameInner user={user} isLoading={isLoading}>
          {children}
        </HrDashboardFrameInner>
      </HrAbilityProvider>
    </SidebarProvider>
  );
}
