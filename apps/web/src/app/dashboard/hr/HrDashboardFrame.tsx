'use client';

import * as React from 'react';

import { AppHeader } from '@/shared/components/AppHeader';
import { SidebarProvider } from '@/shared/components/ui/sidebar';
import { HrSidebarShell } from '@/app/dashboard/hr/HrSidebarShell';

type HrDashboardFrameProps = {
  user: {
    initials: string;
    name: string;
    email: string;
  };
  children: React.ReactNode;
};

export function HrDashboardFrame({ user, children }: HrDashboardFrameProps) {
  const [subnavOpen, setSubnavOpen] = React.useState(true);

  return (
    <SidebarProvider defaultOpen={false} className="w-full">
      <div className="flex min-h-screen w-full bg-background">
        <HrSidebarShell
          user={user}
          subnavOpen={subnavOpen}
          onRequestOpenSubnav={() => setSubnavOpen(true)}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AppHeader onToggleSubnav={() => setSubnavOpen((prev) => !prev)} />
          <main className="min-h-0 flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
