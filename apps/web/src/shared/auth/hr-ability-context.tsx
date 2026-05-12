'use client';

import * as React from 'react';

import {
  userHasAnyPermission,
  userHasPermission,
} from '@/shared/auth/permission-check';

export type HrAbilityContextValue = {
  roles: string[];
  permissions: string[];
  hasPermission: (required: string) => boolean;
  hasAnyPermission: (required: readonly string[]) => boolean;
  hasAllPermissions: (required: readonly string[]) => boolean;
};

const HrAbilityContext = React.createContext<HrAbilityContextValue | null>(
  null,
);

export function HrAbilityProvider({
  roles,
  permissions,
  children,
}: {
  roles: string[];
  permissions: string[];
  children: React.ReactNode;
}): React.ReactElement {
  const value = React.useMemo<HrAbilityContextValue>(
    () => ({
      roles,
      permissions,
      hasPermission: (required: string) =>
        userHasPermission(permissions, roles, required),
      hasAnyPermission: (required: readonly string[]) =>
        userHasAnyPermission(permissions, roles, required),
      hasAllPermissions: (required: readonly string[]) => {
        if (required.length === 0) return true;
        return required.every((slug) =>
          userHasPermission(permissions, roles, slug),
        );
      },
    }),
    [roles, permissions],
  );

  return (
    <HrAbilityContext.Provider value={value}>
      {children}
    </HrAbilityContext.Provider>
  );
}

export function useHrAbility(): HrAbilityContextValue {
  const ctx = React.useContext(HrAbilityContext);
  if (!ctx) {
    throw new Error('useHrAbility must be used within HrAbilityProvider');
  }
  return ctx;
}
