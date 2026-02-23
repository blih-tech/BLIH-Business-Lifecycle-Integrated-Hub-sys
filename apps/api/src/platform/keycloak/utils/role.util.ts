export const normalizePermission = (permission: string): string =>
  permission.trim().toLowerCase();

export const hasWildcardPermission = (
  permissions: string[],
  requested: string,
): boolean => {
  const normalizedRequested = normalizePermission(requested);
  const requestedParts = normalizedRequested.split(':');
  if (requestedParts.length !== 2) {
    return false;
  }

  return permissions.some((entry) => {
    const normalized = normalizePermission(entry);
    if (normalized === '*' || normalized === normalizedRequested) {
      return true;
    }

    const candidateParts = normalized.split(':');
    if (candidateParts.length !== 2) {
      return false;
    }

    return candidateParts[0] === requestedParts[0] && candidateParts[1] === '*';
  });
};
