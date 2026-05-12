'use client';

import { useCallback } from 'react';

import { useHrAbility } from '@/shared/auth/hr-ability-context';
import { notifyPermissionDenied } from '@/shared/components/access/notify-permission-denied';

/**
 * Wraps an action so it runs only if the user has the given permission;
 * otherwise shows a permission-denied toast.
 */
export function useGuardedAction(
  requiredPermission: string,
): (action: () => void) => void {
  const { hasPermission } = useHrAbility();

  return useCallback(
    (action: () => void) => {
      if (!hasPermission(requiredPermission)) {
        notifyPermissionDenied();
        return;
      }
      action();
    },
    [hasPermission, requiredPermission],
  );
}
