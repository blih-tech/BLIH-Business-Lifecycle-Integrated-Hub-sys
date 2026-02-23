import { ForbiddenException } from '@nestjs/common';

export const ensureRealmMatch = (
  expectedRealm: string | null | undefined,
  actualRealm: string,
): void => {
  if (!expectedRealm) {
    return;
  }

  if (expectedRealm !== actualRealm) {
    throw new ForbiddenException('Realm mismatch');
  }
};
