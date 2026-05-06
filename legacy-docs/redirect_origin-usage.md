# redirect_origin Query Parameter Documentation

## Overview

The authentication system now supports a `redirect_origin` query parameter that allows frontend applications to specify the origin URL for post-authentication redirects. This parameter takes priority over existing header-based origin detection methods.

## Usage

### Login Endpoint

```
GET /api/v1/auth/login?redirect_origin=http://localhost:3000
```

### Logout Endpoint

```
GET /api/v1/auth/logout?redirect_origin=http://localhost:3000
```

## Priority Order

The system uses the following priority order for origin detection:

1. **`redirect_origin` query parameter** (new - highest priority)
2. `x-frontend-origin` header (existing)
3. `origin` header (existing)
4. `referer` header (existing)
5. `AUTH_FRONTEND_BASE_URL` fallback (existing)

## Security

- The `redirect_origin` parameter is validated against the allowed origins list
- Only origins configured in `CORS_ORIGIN` environment variable are permitted
- Invalid or unauthorized origins will fall back to the next priority method
- All redirect origin usage is logged for audit purposes

## Examples

### Basic Usage

```bash
# Login with custom origin
curl "http://localhost:5000/api/v1/auth/login?redirect_origin=https://myapp.example.com"

# Logout with custom origin
curl "http://localhost:5000/api/v1/auth/logout?redirect_origin=https://myapp.example.com"
```

### Combined with Other Parameters

```bash
# Login with redirect path and custom origin
curl "http://localhost:5000/api/v1/auth/login?redirect=/dashboard&redirect_origin=https://myapp.example.com"

# Logout with redirect path and custom origin
curl "http://localhost:5000/api/v1/auth/logout?redirect=/login&redirect_origin=https://myapp.example.com"
```

## Configuration

Ensure your frontend origins are properly configured in the environment:

```bash
CORS_ORIGIN=https://myapp.example.com,http://localhost:3000,https://admin.example.com
```

## Use Cases

### Mobile Applications

Mobile apps can use the query parameter to specify their custom scheme origins:

```
GET /api/v1/auth/login?redirect_origin=myapp://auth/callback
```

### Third-party Integrations

External services can specify their callback URLs:

```
GET /api/v1/auth/login?redirect_origin=https://partner.example.com/auth
```

### Multi-tenant Applications

Different tenants can be redirected to their specific domains:

```
GET /api/v1/auth/login?redirect_origin=https://tenant1.example.com
```

## Backward Compatibility

This feature is fully backward compatible. Existing applications using headers will continue to work without any changes.

## Audit Logging

The system logs the following information for tracking:

- `redirectOriginUsed`: Boolean indicating if the parameter was provided
- `redirectOrigin`: The actual value provided (or 'not_provided')

## Error Handling

If the `redirect_origin` parameter is provided but not in the allowed origins list, the system will:

1. Log the attempt for security monitoring
2. Fall back to the next priority origin detection method
3. Continue the authentication flow normally
