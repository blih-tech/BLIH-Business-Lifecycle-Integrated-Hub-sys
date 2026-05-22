import { HrDashboardFrame } from '@/app/(dashboard)/hr/HrDashboardFrame';

type HrDashboardLayoutProps = {
  children: React.ReactNode;
};

export default function HrDashboardLayout({
  children,
}: HrDashboardLayoutProps) {
  // Session is provided by the parent (dashboard) layout via <AuthGate>;
  // HrDashboardFrame reads it through useSession().
  return <HrDashboardFrame>{children}</HrDashboardFrame>;
}
