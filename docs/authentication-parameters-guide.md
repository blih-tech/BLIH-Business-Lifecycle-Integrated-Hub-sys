# Authentication Parameters Guide

## Overview

The BLIH authentication system supports several parameters to control the login flow behavior and redirect destinations. This guide explains each parameter and their use cases.

## Login Endpoint Parameters

### `redirect` (string, optional)

**Purpose**: Relative URL path for post-login redirect
**Example**: `/dashboard`, `/profile`, `/admin/users`
**Usage**: `GET /api/v1/auth/login?redirect=/dashboard`

**Use Cases**:

- Direct users to specific pages after login
- Different redirect paths for different user roles
- Deep linking to specific application sections

### `redirect_origin` (string, optional) ⭐ **NEW**

**Purpose**: Frontend origin URL (base URL) for post-login redirects
**Example**: `http://localhost:3000`, `https://myapp.example.com`
**Usage**: `GET /api/v1/auth/login?redirect_origin=http://localhost:3000`

**Priority**: Takes highest priority over all other origin detection methods:

1. `redirect_origin` query parameter
2. `x-frontend-origin` header
3. `origin` header
4. `referer` header
5. `AUTH_FRONTEND_BASE_URL` fallback

**Use Cases**:

- **Mobile Applications**: `myapp://auth/callback`
- **Third-party Integrations**: `https://partner.example.com/auth`
- **Multi-tenant Applications**: `https://tenant1.example.com`
- **Development Environments**: `http://localhost:3000`

### `prompt` (string, optional)

**Purpose**: OIDC parameter that controls Keycloak authentication behavior
**Values**:

- `login` - Force login screen, even if user has active session
- `consent` - Force consent screen for permissions
- `none` - Attempt silent auth, fail if user interaction required
- `select_account` - Force account selection screen

**Usage**: `GET /api/v1/auth/login?prompt=login`

**Use Cases**:

#### Security Sensitive Actions

```bash
# Force re-authentication before admin access
GET /api/v1/auth/login?redirect=/admin&prompt=login
```

#### New Permissions Added

```bash
# Force consent for new scopes
GET /api/v1/auth/login?redirect=/dashboard&prompt=consent
```

#### Mobile App Background Refresh

```bash
# Silent authentication attempt
GET /api/v1/auth/login?prompt=none
```

#### Multiple Account Selection

```bash
# Force account chooser
GET /api/v1/auth/login?prompt=select_account
```

## Logout Endpoint Parameters

### `redirect` (string, optional)

**Purpose**: Relative URL path for post-logout redirect
**Example**: `/login`, `/home`
**Usage**: `GET /api/v1/auth/logout?redirect=/login`

### `redirect_origin` (string, optional) ⭐ **NEW**

**Purpose**: Frontend origin URL for post-logout redirects
**Example**: `http://localhost:3000`, `https://myapp.example.com`
**Usage**: `GET /api/v1/auth/logout?redirect_origin=http://localhost:3000`

**Priority**: Same origin detection priority as login endpoint

## Combined Examples

### Complete Login Flow

```bash
# Full-featured login with all parameters
GET /api/v1/auth/login?redirect=/dashboard&redirect_origin=https://myapp.example.com&prompt=login
```

**Result**: User forced to login, then redirected to `https://myapp.example.com/dashboard`

### Complete Logout Flow

```bash
# Logout with custom redirect
GET /api/v1/auth/logout?redirect=/login&redirect_origin=https://myapp.example.com
```

**Result**: User logged out and redirected to `https://myapp.example.com/login`

## Security Considerations

### Origin Validation

- `redirect_origin` is validated against `CORS_ORIGIN` environment variable
- Only configured origins are permitted
- Invalid origins fall back to next priority method
- All attempts are logged for security monitoring

### Path Validation

- `redirect` paths are validated against `AUTH_ALLOWED_REDIRECT_PATH_PREFIXES`
- Prevents open redirect attacks
- Only relative paths are allowed
- Must start with `/` and not contain `//`

## Configuration

### Environment Variables

```bash
# Allowed origins for redirect_origin validation
CORS_ORIGIN=https://myapp.example.com,http://localhost:3000,https://admin.example.com

# Allowed redirect path prefixes
AUTH_ALLOWED_REDIRECT_PATH_PREFIXES=/,/dashboard,/admin,/profile

# Default redirect paths
AUTH_POST_LOGIN_REDIRECT_URI=/dashboard
AUTH_POST_LOGOUT_REDIRECT_URI=/login
```

## Migration Guide

### From Headers to Query Parameters

**Before** (headers only):

```bash
# Set headers in request
Headers: {
  'x-frontend-origin': 'https://myapp.example.com'
}
```

**After** (query parameters):

```bash
# Use query parameter instead
GET /api/v1/auth/login?redirect_origin=https://myapp.example.com
```

### Benefits of Query Parameters

- **URL-based**: No need to set custom headers
- **Bookmarkable**: URLs can be saved and shared
- **Mobile-friendly**: Easier for mobile app integration
- **Third-party integration**: Simpler for external services

## Error Handling

### Invalid redirect_origin

If `redirect_origin` is not in allowed list:

1. System logs the attempt for security monitoring
2. Falls back to header-based detection
3. Continues authentication flow normally

### Invalid redirect Path

If `redirect` path is not allowed:

1. Falls back to `AUTH_POST_LOGIN_REDIRECT_URI`
2. Logs the attempt for debugging
3. Continues with safe default path

## Testing

### Manual Testing

```bash
# Test redirect_origin priority
curl "http://localhost:5000/api/v1/auth/login?redirect_origin=https://test.example.com"

# Test prompt parameter
curl "http://localhost:5000/api/v1/auth/login?prompt=login"

# Test combined parameters
curl "http://localhost:5000/api/v1/auth/login?redirect=/dashboard&redirect_origin=https://test.example.com&prompt=consent"
```

### Automated Testing

The system includes comprehensive test coverage:

- Origin priority detection
- Parameter validation
- Fallback behavior
- Security validation
- Audit logging verification

## Best Practices

### Frontend Applications

1. **Use redirect_origin** for multi-environment deployments
2. **Use specific redirect paths** for different user flows
3. **Use prompt=login** for security-sensitive actions
4. **Validate origins** in your configuration

### Mobile Applications

1. **Use custom scheme origins**: `myapp://auth`
2. **Handle prompt=none** for silent refresh
3. **Implement fallback** for failed silent auth
4. **Store origin securely** in app configuration

### Third-party Integrations

1. **Register your origin** in CORS_ORIGIN
2. **Use specific redirect paths** for your integration
3. **Handle all prompt values** gracefully
4. **Implement proper error handling**

## Troubleshooting

### Common Issues

#### "Origin not allowed"

- **Cause**: `redirect_origin` not in `CORS_ORIGIN` list
- **Solution**: Add your origin to environment configuration

#### "Redirect path not allowed"

- **Cause**: `redirect` path not in `AUTH_ALLOWED_REDIRECT_PATH_PREFIXES`
- **Solution**: Add your path prefix to allowed list

#### "Invalid prompt parameter"

- **Cause**: Unsupported prompt value
- **Solution**: Use standard OIDC prompt values

### Debug Information

Enable verbose logging to trace parameter processing:

```bash
VERBOSE_REQUEST_LOGGING=true npm run dev
```

Check audit logs for parameter usage:

```json
{
  "action": "auth.login.initiated",
  "redirectOriginUsed": true,
  "redirectOrigin": "https://myapp.example.com",
  "redirectPath": "/dashboard",
  "prompt": "login"
}
```
