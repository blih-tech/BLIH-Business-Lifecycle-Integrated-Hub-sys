import { AppHeader } from '@/shared/components/AppHeader';
import { AppSidebar } from '@/shared/components/AppSidebar';
import { getSession } from '@/shared/auth/session';
import { SidebarProvider } from '@/shared/components/ui/sidebar';
import {
  Brain,
  Briefcase,
  Building2,
  GraduationCap,
  LayoutGrid,
  LogOut,
  Search,
  Sparkles,
  Users,
  UserSquare2,
} from 'lucide-react';

const assets = {
  background:
    'https://www.figma.com/api/mcp/asset/7e31743a-72ac-4836-87e2-fc85df229e91',
};

type HrDashboardLayoutProps = {
  children: React.ReactNode;
};

function getInitials(value: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return '??';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) {
    const only = parts[0];
    if (!only) return '??';
    return only.slice(0, 2).toUpperCase();
  }
  const firstPart = parts[0];
  const lastPart = parts.at(-1);
  if (!firstPart || !lastPart) return '??';
  const first = firstPart[0] ?? '';
  const last = lastPart[0] ?? '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || '??';
}

export default async function HrDashboardLayout({
  children,
}: HrDashboardLayoutProps) {
  const session = await getSession();
  const userName = session.username ?? 'User';
  const userEmail = session.email ?? 'user@blih.local';

  return (
    <SidebarProvider defaultOpen={false} className="w-full">
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar
          title="Blih CORE"
          subtitle="HR Portal"
          backgroundImage={assets.background}
          logo={<Brain className="h-5 w-5" />}
          searchIcon={<Search className="h-2.5 w-2.5 text-white" />}
          items={[
            {
              id: 'recruitment',
              label: 'Recruitment & Hiring',
              href: '/dashboard/hr',
              icon: <Briefcase className="h-3.5 w-3.5" />,
              badge: '4',
              active: true,
              activeTone: 'primary',
            },
            {
              id: 'onboarding',
              label: 'Onboarding & Probation',
              href: '/dashboard/hr/onboarding',
              icon: <Users className="h-3.5 w-3.5" />,
              badge: '3',
              active: false,
              activeTone: 'inverse',
            },
            {
              id: 'people',
              label: 'People Profiles',
              href: '/dashboard/hr/people',
              icon: <UserSquare2 className="h-3.5 w-3.5" />,
            },
            {
              id: 'attendance',
              label: 'Attendance & Leave',
              href: '/dashboard/hr/attendance',
              icon: <LayoutGrid className="h-3.5 w-3.5" />,
            },
            {
              id: 'performance',
              label: 'Performance',
              href: '/dashboard/hr/performance',
              icon: <Sparkles className="h-3.5 w-3.5" />,
            },
            {
              id: 'talent',
              label: 'Talent Management',
              href: '/dashboard/hr/talent',
              icon: <GraduationCap className="h-3.5 w-3.5" />,
            },
            {
              id: 'exit',
              label: 'Exit & Off boarding',
              href: '/dashboard/hr/exit',
              icon: <LogOut className="h-3.5 w-3.5" />,
            },
            {
              id: 'workforce',
              label: 'Workforce Finance',
              href: '/dashboard/hr/workforce',
              icon: <Building2 className="h-3.5 w-3.5" />,
            },
          ]}
          user={{
            initials: getInitials(session.username ?? session.email),
            name: userName,
            email: userEmail,
          }}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 min-h-0 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
