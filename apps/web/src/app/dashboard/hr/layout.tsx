import { HrDashboardFrame } from '@/app/dashboard/hr/HrDashboardFrame';
import { getSession } from '@/shared/auth/session';

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
    <HrDashboardFrame
      user={{
        initials: getInitials(session.username ?? session.email),
        name: userName,
        email: userEmail,
      }}
    >
      {children}
    </HrDashboardFrame>
  );
}
