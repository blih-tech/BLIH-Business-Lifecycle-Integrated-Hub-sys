import type { ReactNode } from 'react';

import { AuthGate } from '@/shared/auth/AuthGate';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Auth gating runs client-side because the API issues HttpOnly cookies on a
  // different host (blihapi.blihmarketing.com) that this SSR pass cannot read.
  // AuthGate calls /auth/me with credentials, redirects to /api/auth/login on
  // 401, and supplies the session to children via SessionContext.
  return <AuthGate>{children}</AuthGate>;
}
