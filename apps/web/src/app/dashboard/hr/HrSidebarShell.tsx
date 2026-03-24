'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

import { AppSidebar } from '@/shared/components/AppSidebar';
import { SearchInput } from '@/shared/components/SearchInput';
import {
  HR_MAIN_NAV,
  type HrMainNavItem,
} from '@/shared/constants/hr-navigation';
import { cn } from '@/shared/lib/utils';
import { useSidebar } from '@/shared/components/ui/sidebar';

const assets = {
  background:
    'https://www.figma.com/api/mcp/asset/7e31743a-72ac-4836-87e2-fc85df229e91',
};

type HrSidebarShellProps = {
  subnavOpen: boolean;
  onRequestOpenSubnav: () => void;
  user: {
    initials: string;
    name: string;
    email: string;
  };
};

const FALLBACK_MAIN_NAV: HrMainNavItem = {
  id: 'fallback',
  label: 'HR',
  href: '/dashboard/hr',
  icon: 'briefcase',
  subItems: [],
};

function iconFor(key: HrMainNavItem['icon']) {
  switch (key) {
    case 'briefcase':
      return <Briefcase className="h-3.5 w-3.5" />;
    case 'users':
      return <Users className="h-3.5 w-3.5" />;
    case 'user-square':
      return <UserSquare2 className="h-3.5 w-3.5" />;
    case 'layout-grid':
      return <LayoutGrid className="h-3.5 w-3.5" />;
    case 'sparkles':
      return <Sparkles className="h-3.5 w-3.5" />;
    case 'graduation-cap':
      return <GraduationCap className="h-3.5 w-3.5" />;
    case 'log-out':
      return <LogOut className="h-3.5 w-3.5" />;
    case 'building-2':
      return <Building2 className="h-3.5 w-3.5" />;
    default:
      return <Briefcase className="h-3.5 w-3.5" />;
  }
}

function resolveActiveMain(pathname: string): HrMainNavItem {
  const matched = HR_MAIN_NAV.find((item) => {
    if (pathname.startsWith(item.href)) return true;
    return (
      item.subItems?.some((subItem) => pathname.startsWith(subItem.href)) ??
      false
    );
  });

  if (matched) return matched;
  return HR_MAIN_NAV[0] ?? FALLBACK_MAIN_NAV;
}

export function HrSidebarShell({
  subnavOpen,
  onRequestOpenSubnav,
  user,
}: HrSidebarShellProps) {
  const { setOpen } = useSidebar();
  const pathname = usePathname();
  const isHrRoot = pathname === '/dashboard/hr';
  const activeMain = isHrRoot ? null : resolveActiveMain(pathname);
  const activeSubItems = activeMain?.subItems ?? [];
  const activeSubHref =
    activeSubItems.find((subItem) => pathname.startsWith(subItem.href))?.href ??
    activeSubItems[0]?.href;

  const items = HR_MAIN_NAV.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    icon: iconFor(item.icon),
    badge: item.badge,
    active: activeMain?.id === item.id,
    activeTone: activeMain?.id === item.id ? ('primary' as const) : undefined,
    onClick: item.subItems?.length
      ? () => {
          onRequestOpenSubnav();
          setOpen(false);
        }
      : undefined,
  }));

  return (
    <div className="flex h-full">
      <AppSidebar
        title="Blih CORE"
        subtitle="HR Portal"
        backgroundImage={assets.background}
        logo={
          <Link
            href="/dashboard/hr"
            aria-label="Go to HR dashboard"
            className="inline-flex items-center justify-center"
          >
            <Brain className="h-5 w-5" />
          </Link>
        }
        searchIcon={<Search className="h-2.5 w-2.5 text-white" />}
        items={items}
        user={user}
      />

      <div
        className={cn(
          'hidden md:block sticky top-0 h-svh shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-out',
          subnavOpen ? 'w-[304px] opacity-100' : 'w-0 opacity-0',
        )}
      >
        {activeSubItems.length > 0 ? (
          <aside
            className={cn(
              'flex h-svh w-[304px] flex-col border-r border-[#e5e7eb] bg-[#f9fafb] transition-transform duration-300 ease-out',
              subnavOpen ? 'translate-x-0' : '-translate-x-2',
            )}
          >
            <div className="flex shrink-0 flex-col justify-center border-b border-[#e5e5e5] px-6 pl-8 h-[56px]">
              <p className="text-[15px] font-semibold leading-5 tracking-[-0.25px] text-black">
                {activeMain?.label}
              </p>
              <p className="text-[12px] font-semibold text-[#1e77f7]">
                HR Portal
              </p>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto bg-[#f8f8f8] px-6 py-4">
              <div className="mb-3">
                <SearchInput
                  placeholder="Search..."
                  variant="light"
                  icon={<Search className="size-3 text-black" />}
                />
              </div>
              <ul className="w-full space-y-1">
                {activeSubItems.map((subItem) => {
                  const isActive = activeSubHref === subItem.href;
                  return (
                    <li key={subItem.id}>
                      <Link
                        href={subItem.href}
                        className={[
                          'flex h-[34px] items-center justify-between rounded-[6px] px-[11px] text-[13px] font-medium tracking-[-0.12px] text-black transition-colors',
                          isActive
                            ? 'border border-[#e5e5e5] bg-white'
                            : 'border border-transparent hover:bg-[#f3f3f3]',
                        ].join(' ')}
                      >
                        <span>{subItem.label}</span>
                        {subItem.badge ? (
                          <span className="flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-medium leading-none text-white">
                            {subItem.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="flex h-[54px] shrink-0 flex-col justify-center border-t border-[#e5e5e5] px-6 pl-8">
              <p className="text-[14px] font-semibold leading-5 tracking-[-0.12px] text-black">
                {user.name}
              </p>
              <p className="text-[11px] leading-4 text-[#666]">{user.email}</p>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
