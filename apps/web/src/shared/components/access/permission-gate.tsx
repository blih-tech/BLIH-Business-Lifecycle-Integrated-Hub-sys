'use client';

import type { ReactNode } from 'react';

import { useHrAbility } from '@/shared/auth/hr-ability-context';

import { AccessDeniedCallout } from './access-denied-callout';

type PermissionGateProps = {
  anyOf?: readonly string[];
  allOf?: readonly string[];
  children: ReactNode;
  fallback?: ReactNode;
  /** When false, children still render but callers should use disabled UI separately. */
  mode?: 'hide' | 'show-fallback';
};

export function PermissionGate({
  anyOf,
  allOf,
  children,
  fallback,
  mode = 'show-fallback',
}: PermissionGateProps): React.ReactElement | null {
  const { hasAnyPermission, hasAllPermissions } = useHrAbility();

  const allowedAny = anyOf?.length ? hasAnyPermission(anyOf) : true;
  const allowedAll = allOf?.length ? hasAllPermissions(allOf) : true;
  const allowed = allowedAny && allowedAll;

  if (allowed) {
    return <>{children}</>;
  }

  if (mode === 'hide') {
    return null;
  }

  return <>{fallback ?? <AccessDeniedCallout />}</>;
}
