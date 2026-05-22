'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { HrSidebarShell } from '@/app/(dashboard)/hr/HrSidebarShell';
import { AppHeader } from '@/shared/components/AppHeader';
import {
  HrAbilityProvider,
  useHrAbility,
} from '@/shared/auth/hr-ability-context';
import { useSession } from '@/shared/auth/use-session';
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
  children: React.ReactNode;
  isLoading?: boolean;
};

function getInitialsFromName(
  firstName: string | null,
  lastName: string | null,
  fallback: string | null,
): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  const value = firstName ?? lastName ?? fallback;
  if (!value) return '??';
  const trimmed = value.trim();
  if (!trimmed) return '??';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    const only = parts[0];
    return only ? only.slice(0, 2).toUpperCase() : '??';
  }
  const first = parts[0]?.[0] ?? '';
  const last = parts.at(-1)?.[0] ?? '';
  return (first + last).toUpperCase() || '??';
}

function getDisplayName(
  firstName: string | null,
  lastName: string | null,
  username: string | null,
  email: string | null,
): string {
  if (firstName && lastName) return `${firstName} ${lastName}`;
  return firstName ?? lastName ?? username ?? email ?? 'User';
}

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
  const [isNavigating, startNavigating] = React.useTransition();

  const createActionByPath = React.useMemo(
    () => ({
      '/hr/recruitment/requests': {
        label: 'Create New Request',
        onClick: () =>
          startNavigating(() => {
            guardCreateNavigation(() =>
              router.push('/hr/recruitment/requests?create=new-request'),
            );
          }),
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
          isLoading={isNavigating}
        />
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export function HrDashboardFrame({
  children,
  isLoading,
}: Pick<HrDashboardFrameProps, 'children' | 'isLoading'>): React.ReactElement {
  const session = useSession();
  const user = {
    initials: getInitialsFromName(
      session.firstName,
      session.lastName,
      session.username ?? session.email,
    ),
    name: getDisplayName(
      session.firstName,
      session.lastName,
      session.username,
      session.email,
    ),
    email: session.email ?? 'user@blih.local',
  };

  return (
    <SidebarProvider defaultOpen={false} className="w-full">
      <HrAbilityProvider
        roles={session.roles}
        permissions={session.permissions}
      >
        <HrDashboardFrameInner user={user} isLoading={isLoading}>
          {children}
        </HrDashboardFrameInner>
      </HrAbilityProvider>
    </SidebarProvider>
  );
}
