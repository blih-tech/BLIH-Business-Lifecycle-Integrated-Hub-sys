export interface AuthPrincipal {
  sub: string;
  email: string;
  username?: string;
  realm: string;
  policyVersion: string;
  roles: string[];
  permissions: string[];
  scopes: string[];
  sessionId?: string;
  clientId?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: string;
  position?: string;
}
