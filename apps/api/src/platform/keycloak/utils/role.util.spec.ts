import { hasWildcardPermission, normalizePermission } from './role.util';

describe('role.util', () => {
  it('normalizes permissions to lowercase', () => {
    expect(normalizePermission('USER:CREATE')).toBe('user:create');
  });

  it('matches exact 2-part permissions', () => {
    expect(hasWildcardPermission(['user:view'], 'user:view')).toBe(true);
    expect(hasWildcardPermission(['user:create'], 'user:view')).toBe(false);
  });

  it('matches resource wildcard and global wildcard', () => {
    expect(hasWildcardPermission(['invoice:*'], 'invoice:approve')).toBe(true);
    expect(hasWildcardPermission(['*'], 'system_realm:update')).toBe(true);
  });

  it('does not match unsupported formats', () => {
    expect(hasWildcardPermission(['system:*:*'], 'system_audit:view')).toBe(
      false,
    );
    expect(
      hasWildcardPermission(['invoice:*'], 'finance:invoice:approve'),
    ).toBe(false);
  });
});
