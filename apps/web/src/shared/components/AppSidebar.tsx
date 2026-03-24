import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui/sidebar';
import { SearchInput } from '@/shared/components/SearchInput';
import Image from 'next/image';

type SidebarItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  active?: boolean;
  activeTone?: 'primary' | 'inverse';
  onClick?: () => void;
};

type SidebarUser = {
  initials: string;
  name: string;
  email: string;
};

type SidebarProps = {
  title: string;
  subtitle: string;
  logo: React.ReactNode;
  backgroundImage: string;
  searchPlaceholder?: string;
  searchIcon?: React.ReactNode;
  onSearchChange?: (value: string) => void;
  items: SidebarItem[];
  user?: SidebarUser;
};

export function AppSidebar({
  title,
  subtitle,
  logo,
  backgroundImage,
  searchPlaceholder = 'Search...',
  searchIcon,
  onSearchChange,
  items,
  user,
}: SidebarProps) {
  return (
    <Sidebar
      collapsible="icon"
      className="left-0 h-full min-h-full border-none bg-transparent text-sidebar-foreground [--sidebar-width:280px] [--sidebar-width-icon:64px]"
    >
      <div className="absolute inset-0">
        <Image
          alt=""
          fill
          sizes="280px"
          className="absolute size-full object-cover"
          src={backgroundImage}
        />
        <div className="absolute inset-0 bg-[color:var(--sidebar)]/70" />
      </div>

      <SidebarHeader className="relative border-b border-sidebar-border px-4 py-3 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center gap-3 pl-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-white/10">
            {logo}
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <p className="text-[14px] font-semibold tracking-[-0.16px]">
              {title}
            </p>
            <p className="text-[10px] font-medium tracking-[0.2px] text-white/80 uppercase">
              {subtitle}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="relative px-3 py-2.5 group-data-[collapsible=icon]:px-1.5">
        <SidebarGroup>
          <SidebarGroupContent className="space-y-3">
            <div className="group-data-[collapsible=icon]:hidden">
              <SearchInput
                placeholder={searchPlaceholder}
                icon={searchIcon}
                onChange={onSearchChange}
              />
            </div>

            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    className={[
                      'h-7 rounded-[6px] px-1.5 text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                      item.active
                        ? item.activeTone === 'inverse'
                          ? 'border border-sidebar-foreground hover:border-sidebar-foreground/90 hover:bg-white/10'
                          : 'bg-white text-primary hover:bg-white hover:text-primary'
                        : 'hover:bg-white/10 text-sidebar-foreground',
                    ].join(' ')}
                  >
                    <Link
                      href={item.href}
                      onClick={item.onClick}
                      className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center"
                    >
                      <span
                        className={[
                          'flex h-7 w-7 items-center justify-center rounded-[6px]',
                          item.active
                            ? item.activeTone === 'inverse'
                              ? 'text-white'
                              : 'text-primary'
                            : 'text-white',
                        ].join(' ')}
                      >
                        {item.icon}
                      </span>
                      <span className="text-[12px] font-semibold tracking-[-0.1px] group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge ? (
                    <SidebarMenuBadge
                      className={[
                        'right-2 top-1.5 h-3 w-3 rounded-full text-[8px]',
                        item.active && item.activeTone !== 'inverse'
                          ? 'bg-primary text-primary-foreground'
                          : item.active && item.activeTone === 'inverse'
                            ? 'bg-white text-primary'
                            : 'bg-white/20 text-white',
                      ].join(' ')}
                    >
                      {item.badge}
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="relative border-t border-sidebar-border px-3 py-3 group-data-[collapsible=icon]:px-1.5">
        {user ? (
          <div className="flex items-center gap-2.5 pl-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0">
            <div className="flex size-[28px] items-center justify-center rounded-full bg-white text-[10px] text-primary">
              {user.initials}
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <p className="text-[12px] font-semibold tracking-[-0.08px] text-white">
                {user.name}
              </p>
              <p className="text-[9px] text-white">{user.email}</p>
            </div>
          </div>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
