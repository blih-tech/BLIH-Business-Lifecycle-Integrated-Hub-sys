# BLIH System Authentication Flow - Comprehensive Technical Documentation

## Overview

The BLIH System implements a robust, enterprise-grade authentication system using Keycloak as the identity provider with OAuth 2.0 + OpenID Connect (OIDC) protocol. This documentation provides a complete technical reference for the authentication flow, security mechanisms, and integration patterns.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Keycloak      │
│   (Next.js)     │    │   (NestJS)      │    │   Identity      │
│                 │    │                 │    │   Provider      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. GET /api/auth/login │                       │
         ├──────────────────────►│                       │
         │                       │ 2. Generate PKCE       │
         │                       │    State/Nonce        │
         │                       │    Store Cookies      │
         │                       │                       │
         │                       │ 3. Redirect to        │
         │                       │    Keycloak Auth      │
         │                       ├──────────────────────►│
         │                       │                       │ 4. User Login
         │                       │                       │    Authentication
         │                       │                       │    (SSO/MFA)
         │                       │                       │
         │                       │ 5. Callback with      │
         │                       │    Authorization Code │
         │                       │◄──────────────────────│
         │                       │                       │
         │                       │ 6. Exchange Code      │
         │                       │    for Tokens         │
         │                       │    Validate ID Token   │
         │                       │    Set HttpOnly Cookies│
         │                       │                       │
         │ 7. Redirect to        │                       │
         │    Dashboard          │                       │
         │◄──────────────────────│                       │
         │                       │                       │
         │ 8. API Calls with     │                       │
         │    HttpOnly Cookies    │                       │
         ├──────────────────────►│                       │
         │                       │ 9. Validate Tokens    │
         │                       │    Extract Principal   │
         │                       │    Apply RBAC          │
         │                       │◄──────────────────────│
```

## Authentication Flow Details

### 1. Login Initiation (Frontend → Backend)

**Endpoint:** `GET /api/auth/login`

**Frontend Implementation:**

```typescript
// apps/web/src/app/api/auth/login/route.ts
export async function GET(request: Request) {
  const clientId = requireEnv('KEYCLOAK_CLIENT_ID');
  const redirectUri = requireEnv('KEYCLOAK_REDIRECT_URI');

  // Generate PKCE parameters
  const state = base64UrlEncode(randomBytes(16));
  const nonce = base64UrlEncode(randomBytes(16));
  const codeVerifier = base64UrlEncode(randomBytes(32));
  const codeChallenge = base64UrlEncode(
    createHash('sha256').update(codeVerifier).digest(),
  );

  // Store transient cookies
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set('kc_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
  response.cookies.set('kc_verifier', codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
  response.cookies.set('kc_nonce', nonce, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });

  return response;
}
```

**Backend Implementation:**

```typescript
// apps/api/src/core/auth/auth.controller.ts
@Public()
@Get('login')
async login(
  @Query('redirect') redirectPath: string,
  @Query('prompt') prompt: string,
  @Req() request: Request,
  @Res() response: Response,
): Promise<void> {
  // Rate limiting check
  await this.authRateLimitService.consumeLoginAttempt(requestContext.ipAddress);

  // Generate OIDC context
  const authRequest = createOidcAuthRequestContext({
    pkceEnabled: env.AUTH_PKCE_ENABLED,
    pkceMethod: env.AUTH_PKCE_METHOD,
    nonceEnabled: env.AUTH_NONCE_ENABLED,
  });

  // Build Keycloak authorization URL
  const authorizeUrl = buildAuthorizeUrl({
    keycloakUrl: env.KEYCLOAK_URL,
    realm: env.KEYCLOAK_REALM,
    clientId: env.KEYCLOAK_AUTH_CLIENT_ID,
    redirectUri: env.KEYCLOAK_AUTH_REDIRECT_URI,
    scopes: env.KEYCLOAK_AUTH_SCOPES,
    state: authRequest.state,
    codeChallenge: authRequest.codeChallenge,
    pkceMethod: env.AUTH_PKCE_METHOD,
    nonce: authRequest.nonce,
    prompt,
  });

  // Set transient cookies
  response.cookie(AUTH_COOKIE_NAMES.state, authRequest.state, cookieOptions);
  response.cookie(AUTH_COOKIE_NAMES.verifier, authRequest.codeVerifier, cookieOptions);
  response.cookie(AUTH_COOKIE_NAMES.redirect, safeRedirectPath, cookieOptions);
  response.cookie(AUTH_COOKIE_NAMES.nonce, authRequest.nonce, cookieOptions);

  response.redirect(302, authorizeUrl);
}
```

### 2. Keycloak Authentication

**Keycloak Endpoint:** `/realms/{realm}/protocol/openid-connect/auth`

**Parameters:**

- `response_type=code`
- `client_id={client_id}`
- `redirect_uri={redirect_uri}`
- `scope=openid profile email`
- `state={state}`
- `code_challenge={code_challenge}`
- `code_challenge_method=S256`
- `nonce={nonce}`

**Security Features:**

- **PKCE (Proof Key for Code Exchange):** Prevents authorization code interception attacks
- **State Parameter:** Prevents CSRF attacks
- **Nonce Parameter:** Prevents ID token replay attacks
- **Secure Redirect URI:** Validates against allowed origins

### 3. Authorization Code Exchange (Backend)

**Endpoint:** `GET /api/auth/callback`

```typescript
@Public()
@Get('callback')
async callback(
  @Query('code') code: string,
  @Query('state') state: string,
  @Req() request: Request,
  @Res() response: Response,
): Promise<void> {
  // Validate state and retrieve stored values
  const storedState = readCookie(request, AUTH_COOKIE_NAMES.state);
  const codeVerifier = readCookie(request, AUTH_COOKIE_NAMES.verifier);
  const storedNonce = readCookie(request, AUTH_COOKIE_NAMES.nonce);

  // Security validation
  if (!code || !state || !storedState || state !== storedState ||
      (env.AUTH_PKCE_ENABLED && !codeVerifier) ||
      (env.AUTH_NONCE_ENABLED && !storedNonce)) {
    this.clearTransientCookies(response);
    response.redirect(302, loginErrorUrl);
    return;
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await this.tokenService.exchangeAuthorizationCode(
      code,
      codeVerifier,
      env.KEYCLOAK_REALM,
      env.KEYCLOAK_AUTH_CLIENT_ID,
      env.KEYCLOAK_AUTH_CLIENT_SECRET,
      env.KEYCLOAK_AUTH_REDIRECT_URI,
    );

    // Validate ID token
    const validatedIdToken = await this.tokenService.validateIdToken(
      tokenResponse.id_token,
      env.KEYCLOAK_REALM,
      env.KEYCLOAK_AUTH_CLIENT_ID,
      env.AUTH_NONCE_ENABLED ? storedNonce : undefined,
    );

    // Generate CSRF token
    const csrfToken = createCsrfToken();

    // Set HttpOnly cookies
    response.cookie(AUTH_COOKIE_NAMES.access, tokenResponse.access_token,
      buildCookieOptions(this.getCookieSettings(), (tokenResponse.expires_in ?? 300) * 1000));
    response.cookie(AUTH_COOKIE_NAMES.refresh, tokenResponse.refresh_token,
      buildCookieOptions(this.getCookieSettings(), (tokenResponse.refresh_expires_in ?? env.AUTH_REFRESH_TOKEN_TTL_SECONDS) * 1000));
    response.cookie(AUTH_COOKIE_NAMES.id, tokenResponse.id_token,
      buildCookieOptions(this.getCookieSettings(), (tokenResponse.refresh_expires_in ?? tokenResponse.expires_in ?? env.AUTH_REFRESH_TOKEN_TTL_SECONDS) * 1000));
    response.cookie(AUTH_COOKIE_NAMES.csrf, csrfToken,
      buildReadableCookieOptions(this.getCookieSettings(), (tokenResponse.refresh_expires_in ?? env.AUTH_REFRESH_TOKEN_TTL_SECONDS) * 1000));

    // Clear transient cookies
    this.clearTransientCookies(response);

    // Redirect to success page
    response.redirect(302, this.buildFrontendRedirect(successRedirectPath, request));
  } catch (error) {
    // Handle authentication errors
    this.clearTransientCookies(response);
    this.clearAuthCookies(response);
    response.redirect(302, this.appendErrorCode(loginErrorUrl, errorCode));
  }
}
```

### 4. Token Validation & Principal Resolution

**Guard Implementation:**

```typescript
// apps/api/src/shared/guards/keycloak-auth.guard.ts
@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Resolve access token (cookie or bearer)
    const token = this.resolveAccessToken(request.headers);

    // Validate access token
    const payload = await this.tokenService.validateAccessToken(token, realm);

    // Load user profile if needed
    let profileClaims = this.claimsFromTokenPayload(payload);
    if (!profileClaims.sub || this.shouldLoadUserInfo(profileClaims)) {
      profileClaims = await this.loadUserInfoClaims(
        token,
        realm,
        profileClaims,
      );
    }

    // Map to principal
    let principal = this.mapper.toPrincipal(payload, realm);
    principal = this.hydratePrincipalSubject(principal, profileClaims);

    // Enforce MFA for privileged roles
    this.enforcePrivilegedMfa(principal.roles, payload.amr ?? []);

    // Enrich with user context and permissions
    request.user = await this.enrichPrincipal(principal, profileClaims);

    return true;
  }
}
```

## Cookie Management

### Authentication Cookies

| Cookie Name  | Purpose                    | HttpOnly | Secure | SameSite | Max Age                  |
| ------------ | -------------------------- | -------- | ------ | -------- | ------------------------ |
| `kc_access`  | Access token for API calls | ✅       | ✅     | Lax      | Token expires_in         |
| `kc_refresh` | Refresh token for renewal  | ✅       | ✅     | Lax      | Token refresh_expires_in |
| `kc_id`      | ID token for user identity | ✅       | ✅     | Lax      | Token refresh_expires_in |
| `kc_csrf`    | CSRF protection token      | ❌       | ✅     | Lax      | Token refresh_expires_in |

### Transient Cookies (Login Flow)

| Cookie Name   | Purpose                   | HttpOnly | Secure | SameSite | Max Age    |
| ------------- | ------------------------- | -------- | ------ | -------- | ---------- |
| `kc_state`    | OAuth 2.0 state parameter | ✅       | ✅     | Lax      | 10 minutes |
| `kc_verifier` | PKCE code verifier        | ✅       | ✅     | Lax      | 10 minutes |
| `kc_redirect` | Post-login redirect path  | ✅       | ✅     | Lax      | 10 minutes |
| `kc_nonce`    | OIDC nonce parameter      | ✅       | ✅     | Lax      | 10 minutes |

## Token Management

### Access Token Validation

```typescript
// apps/api/src/platform/keycloak/keycloak-token.service.ts
async validateAccessToken(token: string, realm: string): Promise<KeycloakTokenPayload> {
  const expectedAudience = this.keycloak.expectedAudience;

  try {
    const payload = await this.verifyJwtToken(token, realm);

    // Validate audience/azp
    const audOk = payload.aud != null
      ? Array.isArray(payload.aud)
        ? payload.aud.includes(expectedAudience)
        : payload.aud === expectedAudience
      : payload.azp === expectedAudience;

    if (!audOk) {
      throw new KeycloakTokenValidationError('Token audience mismatch');
    }

    return payload;
  } catch (error) {
    throw new KeycloakTokenValidationError('Invalid or expired access token', error);
  }
}
```

### JWT Verification Process

1. **Format Validation:** Verify JWT structure (3 segments)
2. **Header Validation:** Extract and validate `kid` (key ID)
3. **JWKS Retrieval:** Fetch JSON Web Key Set from Keycloak
4. **Signature Verification:** Verify token signature using public key
5. **Claims Validation:** Validate issuer, audience, expiration, etc.
6. **Cache Management:** Cache JWKS with TTL and LRU eviction

### Refresh Token Flow

```typescript
@Public()
@Post('refresh')
async refresh(
  @Body() dto: RefreshTokenRequestDto,
  @Req() request: Request,
  @Res({ passthrough: true }) response: Response,
) {
  const cookieRefreshToken = readCookie(request, AUTH_COOKIE_NAMES.refresh);
  const refreshToken = cookieRefreshToken ?? dto.token;
  const isBrowserCookieMode = Boolean(cookieRefreshToken);

  if (!refreshToken) {
    throw new UnauthorizedException('Missing refresh token');
  }

  try {
    const refreshed = await this.tokenService.refreshToken(
      refreshToken,
      env.KEYCLOAK_REALM,
      isBrowserCookieMode ? env.KEYCLOAK_AUTH_CLIENT_ID : env.KEYCLOAK_CLIENT_ID,
      isBrowserCookieMode ? env.KEYCLOAK_AUTH_CLIENT_SECRET : env.KEYCLOAK_CLIENT_SECRET,
    );

    if (isBrowserCookieMode) {
      // Rotate cookies with new tokens
      response.cookie(AUTH_COOKIE_NAMES.access, refreshed.access_token, newCookieOptions);
      response.cookie(AUTH_COOKIE_NAMES.refresh, refreshed.refresh_token, newCookieOptions);

      if (refreshed.id_token) {
        response.cookie(AUTH_COOKIE_NAMES.id, refreshed.id_token, newCookieOptions);
      }

      // Update CSRF token
      const csrfToken = createCsrfToken();
      response.cookie(AUTH_COOKIE_NAMES.csrf, csrfToken, csrfCookieOptions);
    }

    return {
      active: true,
      policyVersion: env.AUTH_POLICY_VERSION,
      scopes: refreshed.scope?.split(' ').filter(Boolean) ?? [],
      roles: [],
      permissions: [],
      accessToken: isBrowserCookieMode ? undefined : refreshed.access_token,
      refreshToken: isBrowserCookieMode ? undefined : refreshed.refresh_token,
    };
  } catch (error) {
    if (isBrowserCookieMode) {
      this.clearAuthCookies(response);
    }
    throw error;
  }
}
```

## Security Features

### 1. PKCE (Proof Key for Code Exchange)

- **Purpose:** Prevents authorization code interception attacks
- **Implementation:** S256 method with SHA-256 hashing
- **Code Verifier:** 32-byte random value
- **Code Challenge:** Base64URL-encoded SHA-256 hash of verifier

### 2. State Parameter

- **Purpose:** Prevents CSRF attacks
- **Generation:** 32-byte cryptographically secure random value
- **Storage:** HttpOnly cookie with 10-minute TTL
- **Validation:** Strict comparison against stored value

### 3. Nonce Parameter

- **Purpose:** Prevents ID token replay attacks
- **Generation:** 32-byte cryptographically secure random value
- **Validation:** ID token nonce must match stored nonce

### 4. CSRF Protection

- **CSRF Token:** Generated per session, stored in readable cookie
- **Validation:** Required for state-changing operations
- **Rotation:** New token generated on each refresh

### 5. MFA Enforcement

```typescript
private enforcePrivilegedMfa(roles: string[], amr?: string[]): void {
  if (!this.keycloak.enforceMfaForPrivileged) {
    return;
  }

  const hasPrivilegedRole = (roles ?? []).some((role) =>
    this.privilegedRoles.has(role.toLowerCase()),
  );

  if (!hasPrivilegedRole) {
    return;
  }

  const hasMfa = (amr ?? []).some((method) => method.toLowerCase() === 'mfa');
  if (!hasMfa) {
    throw new UnauthorizedException('MFA is required for privileged roles');
  }
}
```

### 6. Rate Limiting

- **Login Attempts:** Configurable rate limiting per IP
- **Token Validation:** Built-in protection against brute force
- **Session Management:** Automatic cleanup of expired sessions

## Role-Based Access Control (RBAC)

### Principal Enrichment

```typescript
private async enrichPrincipal(
  principal: AuthPrincipal,
  profileClaims: KeycloakProfileClaims,
): Promise<AuthPrincipal> {
  // Get user context from database
  const contextData = await this.principalEnrichment.getContext(
    principal.sub,
    profileClaims,
  );

  // Get persisted permissions
  const permissions = await this.userPermissionSnapshot.getPersistedPermissions(principal.sub);

  return {
    ...principal,
    permissions,
    userId: contextData.userId ?? principal.sub,
    username: principal.username || contextData.username || profileClaims.username,
    email: principal.email || contextData.email || profileClaims.email || profileClaims.username,
    firstName: contextData.firstName || profileClaims.firstName,
    lastName: contextData.lastName || profileClaims.lastName,
    phone: contextData.phone,
    status: contextData.status ?? 'ACTIVE',
    departmentId: contextData.departmentId ?? null,
  };
}
```

### Frontend Role-Based Routing

```typescript
// apps/web/src/shared/auth/role-routing.ts
export function getDashboardKey(roles: Role[]): DashboardKey | null {
  const roleSet = new Set<Role>(roles);
  for (const key of DASHBOARD_PRIORITY) {
    const matchers = DASHBOARD_ROLE_MATCHERS[key];
    if (matchers.some((role) => roleSet.has(role))) {
      return key;
    }
  }
  return null;
}

export function getDashboardPath(roles: Role[]): string | null {
  const key = getDashboardKey(roles);
  return key ? `/dashboard/${key}` : null;
}
```

## Logout Flow

### Single Logout (SLO)

```typescript
@Public()
@Get('logout')
async logout(
  @Query('redirect') redirectPath: string,
  @Req() request: Request,
  @Res() response: Response,
): Promise<void> {
  const accessToken = readCookie(request, AUTH_COOKIE_NAMES.access);
  const refreshToken = readCookie(request, AUTH_COOKIE_NAMES.refresh);
  const idToken = readCookie(request, AUTH_COOKIE_NAMES.id);

  // Revoke refresh token
  if (refreshToken) {
    try {
      await this.tokenService.revokeToken(
        refreshToken,
        env.KEYCLOAK_REALM,
        'refresh_token',
        env.KEYCLOAK_AUTH_CLIENT_ID,
        env.KEYCLOAK_AUTH_CLIENT_SECRET,
      );
    } catch (error) {
      this.logger.warn('Refresh token revocation failed during logout');
    }
  }

  // Clear all cookies
  this.clearAuthCookies(response);
  this.clearTransientCookies(response);

  // Redirect to Keycloak SLO if ID token present
  if (!idToken) {
    response.redirect(302, postLogoutRedirectUrl);
    return;
  }

  response.redirect(302, buildEndSessionUrl({
    keycloakUrl: env.KEYCLOAK_URL,
    realm: env.KEYCLOAK_REALM,
    logoutUrl: env.KEYCLOAK_LOGOUT_URL,
    idToken,
    postLogoutRedirectUri: postLogoutRedirectUrl,
  }));
}
```

## Session Management

### Frontend Session Check

```typescript
// apps/web/src/shared/auth/session.ts
export const getSession = cache(async (): Promise<SessionResponse> => {
  const host = (await headers()).get('host');
  const baseUrl = host ? `http://${host}` : 'http://localhost:3000';
  const cookieHeader = (await cookies()).toString();

  const res = await fetch(`${baseUrl}/api/auth/session`, {
    cache: 'no-store',
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });

  if (!res.ok) {
    return {
      authenticated: false,
      roles: [],
      username: null,
      email: null,
      exp: null,
    };
  }

  return (await res.json()) as SessionResponse;
});
```

### Backend Session Endpoint

```typescript
@Public()
@Get('session')
async getSession(@Req() request: Request): Promise<SessionResponse> {
  const accessToken = readCookie(request, AUTH_COOKIE_NAMES.access);

  if (!accessToken) {
    return {
      authenticated: false,
      roles: [],
      username: null,
      email: null,
      exp: null,
    };
  }

  try {
    const payload = await this.tokenService.validateAccessToken(accessToken, env.KEYCLOAK_REALM);
    const principal = await this.enrichPrincipal(this.mapper.toPrincipal(payload, env.KEYCLOAK_REALM), {});

    return {
      authenticated: true,
      roles: principal.roles,
      username: principal.username,
      email: principal.email,
      exp: payload.exp ?? null,
    };
  } catch (error) {
    return {
      authenticated: false,
      roles: [],
      username: null,
      email: null,
      exp: null,
    };
  }
}
```

## Error Handling

### Authentication Error Types

| Error Type              | Cause                              | Resolution              |
| ----------------------- | ---------------------------------- | ----------------------- |
| `invalid_state`         | State parameter mismatch           | Restart login flow      |
| `invalid_code`          | Authorization code invalid/expired | Restart login flow      |
| `token_exchange`        | Token exchange failed              | Restart login flow      |
| `invalid_nonce`         | Nonce validation failed            | Restart login flow      |
| `invalid_id_token`      | ID token validation failed         | Restart login flow      |
| `missing_refresh_token` | Refresh token rotation failed      | Force re-authentication |

### Error Response Format

```typescript
// Frontend error redirect
if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.json(
      {
        error: 'invalid_state',
        code: Boolean(code),
        state,
        storedState,
        hasVerifier: Boolean(codeVerifier),
        callbackUrl: url.toString(),
      },
      { status: 400 },
    );
  }
  return NextResponse.redirect(
    new URL('/auth/signin?error=invalid_state', url),
  );
}
```

## Configuration

### Environment Variables

```typescript
// Keycloak Configuration
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=blih-system
KEYCLOAK_AUTH_CLIENT_ID=blih-system-web
KEYCLOAK_AUTH_CLIENT_SECRET=your-client-secret
KEYCLOAK_AUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback/keycloak
KEYCLOAK_AUTH_SCOPES=openid profile email
KEYCLOAK_AUTHORIZATION_URL=/protocol/openid-connect/auth
KEYCLOAK_LOGOUT_URL=/protocol/openid-connect/logout

// Authentication Configuration
AUTH_PKCE_ENABLED=true
AUTH_PKCE_METHOD=S256
AUTH_NONCE_ENABLED=true
AUTH_COOKIE_HTTP_ONLY=true
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAME_SITE=lax
AUTH_COOKIE_PATH=/
AUTH_STATE_TTL_SECONDS=600
AUTH_REFRESH_TOKEN_TTL_SECONDS=1800
AUTH_POLICY_VERSION=2026.1

// Security Configuration
AUTH_ALLOWED_REDIRECT_PATH_PREFIXES=/,/dashboard,/auth
CORS_ORIGIN=http://localhost:3000
AUTH_FRONTEND_BASE_URL=http://localhost:3000
```

## Integration Points

### 1. API Authentication

All protected endpoints require authentication via `KeycloakAuthGuard`:

```typescript
@UseGuards(KeycloakAuthGuard)
@Get('protected-data')
async getProtectedData(@Req() request: { user: AuthPrincipal }) {
  const principal = request.user;
  // Access principal.sub, principal.roles, principal.permissions
}
```

### 2. Frontend Route Protection

```typescript
// Middleware for route protection
export async function requireAuth() {
  const session = await getSession();
  if (!session.authenticated) {
    redirect('/auth/signin');
  }
}

// Role-based access
export async function requireRole(requiredRole: Role) {
  const session = await getSession();
  if (!session.authenticated || !session.roles.includes(requiredRole)) {
    redirect('/auth/signin');
  }
}
```

### 3. Service-to-Service Authentication

```typescript
// Client credentials flow
const serviceToken = await keycloakTokenService.getServiceToken();
// Use serviceToken for backend service calls
```

## Monitoring and Auditing

### Audit Events

```typescript
export const AUDIT_ACTIONS = {
  AUTH_LOGIN_INITIATED: 'auth.login.initiated',
  AUTH_LOGIN_FAILURE: 'auth.login.failure',
  AUTH_CALLBACK_SUCCESS: 'auth.callback.success',
  AUTH_CALLBACK_FAILURE: 'auth.callback.failure',
  AUTH_TOKEN_EXCHANGE_SUCCESS: 'auth.token_exchange.success',
  AUTH_TOKEN_EXCHANGE_FAILURE: 'auth.token_exchange.failure',
  AUTH_TOKEN_VALIDATION_FAILURE: 'auth.token_validation.failure',
  AUTH_REFRESH_SUCCESS: 'auth.refresh.success',
  AUTH_REFRESH_FAILURE: 'auth.refresh.failure',
  AUTH_LOGOUT: 'auth.logout',
  SESSION_REVOKE: 'session.revoke',
} as const;
```

### Logging

```typescript
// Structured logging for authentication events
this.logAuthEvent(request, AUDIT_ACTIONS.AUTH_LOGIN_INITIATED, {
  redirectPath: safeRedirectPath,
  pkceEnabled: env.AUTH_PKCE_ENABLED,
  nonceEnabled: env.AUTH_NONCE_ENABLED,
});
```

## Best Practices

### 1. Security

- **Always use HTTPS** in production
- **Enable secure cookies** with `Secure` flag
- **Use HttpOnly cookies** to prevent XSS attacks
- **Implement proper CORS** configuration
- **Validate all redirect URLs** against allowlist
- **Rotate secrets regularly** (client secrets, signing keys)
- **Monitor authentication logs** for suspicious activity

### 2. Performance

- **Cache JWKS** to reduce Keycloak calls
- **Use appropriate cookie TTLs** to balance security and UX
- **Implement token refresh** to minimize re-authentication
- **Optimize database queries** for principal enrichment

### 3. User Experience

- **Provide clear error messages** for authentication failures
- **Implement progressive authentication** (MFA only when needed)
- **Support multiple redirect scenarios** (deep linking)
- **Handle session expiration gracefully**

### 4. Maintenance

- **Regular security updates** for Keycloak and dependencies
- **Monitor token expiration** and refresh patterns
- **Test logout flows** across all browsers
- **Validate PKCE and nonce implementations**

## Troubleshooting

### Common Issues

1. **State Mismatch Error**
   - Check cookie domain and path settings
   - Verify browser cookie policies
   - Ensure proper redirect URL configuration

2. **PKCE Validation Failure**
   - Verify code verifier storage
   - Check code challenge method (S256)
   - Ensure proper base64url encoding

3. **Token Validation Errors**
   - Check Keycloak realm configuration
   - Verify client ID and audience settings
   - Ensure JWKS cache is working

4. **MFA Enforcement Issues**
   - Verify privileged role configuration
   - Check Keycloak MFA flow setup
   - Ensure AMR claims are present

### Debug Mode

Enable debug logging in development:

```typescript
// Enable verbose logging
process.env.LOG_LEVEL = 'debug';
process.env.AUTH_DEBUG = 'true';
```

## Conclusion

The BLIH System authentication implementation provides enterprise-grade security with:

- **OAuth 2.0 + OIDC compliance** with PKCE and state/nonce validation
- **Multi-factor authentication** enforcement for privileged roles
- **Comprehensive RBAC** with dynamic permission resolution
- **Secure cookie management** with HttpOnly and SameSite protections
- **Single logout** support across all sessions
- **Rate limiting** and audit logging for security monitoring
- **Flexible integration** patterns for frontend and backend services

This architecture ensures secure, scalable, and maintainable authentication for enterprise applications while providing excellent developer experience and operational visibility.
