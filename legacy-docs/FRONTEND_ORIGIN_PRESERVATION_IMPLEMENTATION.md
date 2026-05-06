# Frontend Origin Preservation Implementation

## Overview

This document describes the implementation of the missing frontend origin preservation model using the `kc_frontend_origin` cookie to ensure users are redirected back to the correct frontend after Keycloak authentication.

## Problem Solved

The BLIH System authentication flow had a critical gap where the frontend origin was not preserved throughout the Keycloak redirect process, causing production redirect failures:

```
Frontend → Backend (login)
Backend → Keycloak
Keycloak → Production backend callback
Backend → redirect to frontend (❌ Origin lost)
```

## Implementation Details

### Phase 1: Cookie Infrastructure ✅

- Added `kc_frontend_origin` to `AUTH_COOKIE_NAMES` constant
- Updated `clearTransientCookies()` to include the new cookie
- Created utility functions for frontend origin extraction and validation

### Phase 2: Login Flow Enhancement ✅

- Modified login endpoint to capture frontend origin from headers
- Implemented header priority: `X-Frontend-Origin` → `Origin` → `Referer`
- Added origin validation against `CORS_ALLOWED_ORIGINS`
- Store validated origin in `kc_frontend_origin` cookie with same TTL as other transient cookies

### Phase 3: Callback Flow Enhancement ✅

- Modified callback endpoint to read `kc_frontend_origin` cookie
- Updated `buildFrontendRedirect()` method to prioritize stored origin
- Added fallback to existing dynamic origin extraction for backward compatibility
- Enhanced logging to track origin preservation usage

### Phase 4: Security & Testing ✅

- Implemented comprehensive origin validation against allowed origins list
- Added security logging for origin preservation attempts
- Created complete test coverage for all new functionality
- Maintained backward compatibility with existing authentication flows

## Technical Changes

### Files Modified

1. **`apps/api/src/core/auth/utils/oidc.util.ts`**
   - Added `kc_frontend_origin` to `AUTH_COOKIE_NAMES`
   - Implemented `extractFrontendOrigin()` function
   - Implemented `validateFrontendOrigin()` function
   - Implemented `isValidOrigin()` helper function

2. **`apps/api/src/core/auth/auth.controller.ts`**
   - Updated imports to include new utility functions
   - Enhanced login method to capture and store frontend origin
   - Enhanced callback method to read and use stored frontend origin
   - Updated `buildFrontendRedirect()` to prioritize stored origin
   - Updated `clearTransientCookies()` to include new cookie
   - Added comprehensive logging for origin tracking

3. **`apps/api/src/core/auth/utils/oidc.util.spec.ts`**
   - Added comprehensive test suite for frontend origin preservation
   - Tests cover header extraction, validation, and edge cases

## Header Priority System

The frontend origin extraction follows this priority order:

1. **`X-Frontend-Origin`** (explicit client signal)
2. **`Origin`** header (standard browser header)
3. **`Referer`** header (fallback extraction)

## Security Features

- **Origin Validation**: All origins are validated against `CORS_ALLOWED_ORIGINS` environment variable
- **Wildcard Support**: Supports `*` wildcard for allowing all origins
- **Protocol Validation**: Only allows `http://` and `https://` protocols
- **Transient Cookie**: Origin cookie has same TTL as other auth transient cookies
- **Security Logging**: All origin preservation attempts are logged for audit trails

## Flow Diagram

```text
Frontend (localhost:3000)
   └── GET /api/v1/auth/login
       Header: X-Frontend-Origin: http://localhost:3000
Backend
   └── Extract origin from X-Frontend-Origin
   └── Validate against CORS_ALLOWED_ORIGINS
   └── Store in kc_frontend_origin cookie
   └── redirect → Keycloak
Keycloak
   └── redirect → backend callback
Backend callback
   └── Read kc_frontend_origin cookie
   └── Use stored origin for redirect
   └── redirect user → http://localhost:3000/dashboard
```

## Environment Variables

No new environment variables required. Uses existing:

- `CORS_ORIGIN` - Comma-separated list of allowed frontend origins
- `AUTH_STATE_TTL_SECONDS` - TTL for transient cookies

## Testing

Comprehensive test coverage includes:

- ✅ Header extraction from all three header types
- ✅ Header priority validation
- ✅ Origin validation against allowed list
- ✅ Wildcard origin support
- ✅ Invalid URL handling
- ✅ Cookie constant presence
- ✅ Edge cases (missing headers, invalid URLs)

## Backward Compatibility

The implementation maintains full backward compatibility:

- Existing authentication flows continue to work unchanged
- Dynamic origin extraction remains as fallback
- No breaking changes to API contracts
- Gradual adoption - frontend can start sending `X-Frontend-Origin` header when ready

## Usage Examples

### Frontend Implementation

```typescript
// Frontend should send X-Frontend-Origin header
fetch('/api/v1/auth/login', {
  headers: {
    'X-Frontend-Origin': window.location.origin,
  },
});
```

### Backend Logging

```json
{
  "action": "auth_login_initiated",
  "frontendOriginStored": true,
  "frontendOrigin": "https://app.example.com"
}

{
  "action": "auth_callback_success",
  "frontendOriginUsed": true,
  "frontendOrigin": "https://app.example.com"
}
```

## Benefits

1. **Reliable Cross-Environment Authentication** - Works across dev, staging, production
2. **Multiple Frontend Domain Support** - Supports different frontend URLs
3. **Improved User Experience** - No more incorrect redirects
4. **Enhanced Security** - Origin validation against allowed list
5. **Backward Compatibility** - Existing flows continue to work
6. **Comprehensive Monitoring** - Full audit trail of origin preservation

## Deployment Notes

- No database changes required
- No environment variable changes required
- No frontend changes required (but recommended for optimal experience)
- Transparent to existing authentication flows
- Can be deployed incrementally

This implementation successfully resolves the production authentication redirect issues while maintaining security and backward compatibility.
