'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { AppHeader } from '@/shared/components/AppHeader';
import { SidebarProvider, useSidebar } from '@/shared/components/ui/sidebar';
import { HrSidebarShell } from '@/app/dashboard/hr/HrSidebarShell';

type HrDashboardFrameProps = {
  user: {
    initials: string;
    name: string;
    email: string;
  };
  children: React.ReactNode;
};

function HrDashboardFrameInner({ user, children }: HrDashboardFrameProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isHrRoot = pathname === '/dashboard/hr';
  const { toggleSidebar } = useSidebar();
  const [subnavOpen, setSubnavOpen] = React.useState(!isHrRoot);

  const createActionByPath = React.useMemo(
    () => ({
      '/dashboard/hr/recruitment/requests': {
        label: 'Create New Request',
        onClick: () => router.push('/dashboard/hr/recruitment/requests?create=new-request'),
      },
    }),
    [router],
  );

  const createAction = createActionByPath[pathname as keyof typeof createActionByPath];

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

  return (
    <div className="flex min-h-screen w-full bg-background">
      <HrSidebarShell
        user={user}
        subnavOpen={subnavOpen}
        onRequestOpenSubnav={() => setSubnavOpen(true)}
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

export function HrDashboardFrame({ user, children }: HrDashboardFrameProps) {
  return (
    <SidebarProvider defaultOpen={false} className="w-full">
      <HrDashboardFrameInner user={user}>{children}</HrDashboardFrameInner>
    </SidebarProvider>
  );
}
