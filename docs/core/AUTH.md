# BLIH Authentication and Authorization

**Purpose:** Single-login SSO and authorization model for one company with multiple departments.  
**Audience:** Architects, Backend Developers, Security  
**Version:** 1.1 | February 2026

---

## 1. Overview

- **One realm = one company** (`blih`).
- **One login page** (Keycloak).
- **One authentication flow** (OIDC).
- **One session** across HR, CRM, Finance, Brain, Chatbot, and Core.
- **Departments are authorization scope only** (not separate authentication domains).

---

## 2. SSO Runtime Flow

1. User signs in once via Keycloak.
2. Gateway/BFF validates access token and forwards trusted principal context to module APIs.
3. Core/module API enforces RBAC and data scope locally.
4. Cross-module side effects are event-driven via `blih.events`.

---

## 3. Authentication

- **Identity Provider:** Keycloak.
- **Primary token:** JWT access token. When the API validates the token directly (no gateway), it checks `iss` (issuer, from `JWT_EXPECTED_ISSUER` or `KEYCLOAK_URL`/`KEYCLOAK_REALM`), `aud` (audience), and expiry.
- **Refresh token:** Used for renewal and revocation.
- **Session revocation endpoint:** `POST /api/v1/auth/revoke-session`.
- **Privileged MFA enforcement:** `super_admin` and `security_admin` require MFA.

### 3.1 Trusted Gateway Principal Headers

When `TRUST_PROXY_PRINCIPAL_HEADERS=true`, API services accept gateway-forwarded principal headers (guarded by `x-internal-auth` shared secret):

- `x-principal-sub`
- `x-principal-realm`
- `x-principal-roles`
- `x-principal-permissions`
- `x-principal-scopes`
- `x-principal-session-id`
- `x-principal-client-id`
- `x-principal-policy-version`
- `x-correlation-id`

---

## 4. Authorization

### 4.1 Permission Format

- Permission roles use `resource:action` (lowercase) for API access control.
- Examples: `user:view`, `user:create`, `role:assign`, `audit:view`, `config:update`. Module-specific scopes may use `module:resource:action` (e.g. `hr:employee:view`, `finance:invoice:approve`).

### 4.2 Role Taxonomy

- Global / org roles: `super_admin`, `auditor`, `security_admin`, `admin`.
- Module/function roles: `hr:manager`, `crm:manager`, `finance:manager`, `brain:manager`, `chatbot:operator`, `project_manager`, `department_head`, `employee`, `client`, `user`.

### 4.3 Data Scope Levels

- `global`
- `organization`
- `department`
- `self`

`Role.dataScope` is persisted in Core policy storage and enforced in query/service layer after permission checks.

---

## 5. Principal Contract

The runtime principal includes:

- `sub`
- `email`
- `realm`
- `policyVersion`
- `roles`
- `permissions`
- `scopes`
- `sessionId`
- `clientId`
- `departmentId`
- `organizationId`

`departmentId` and `organizationId` are enriched from Core user context.

---

## 6. Policy Source of Truth

- **Canonical source:** Core DB.
- **Projection target:** Keycloak roles/claims.
- **Sync direction by default:** Core -> Keycloak.
- `SYNC_ROLES_FROM_KEYCLOAK=false` keeps Core policy canonical.

---

## 7. API Endpoints (Auth Module)

- `POST /api/v1/auth/validate`
- `POST /api/v1/auth/introspect`
- `POST /api/v1/auth/exchange`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/revoke-session`
- `GET /api/v1/auth/me`

---

## 8. Summary

| Topic | Approach |
|-------|----------|
| Single sign-on | One Keycloak realm (`blih`), one login, one session |
| Department handling | Authorization and data visibility only |
| AuthZ model | RBAC + data scope |
| Gateway strategy | Gateway verifies token and forwards trusted principal context |
| Policy source | Core DB canonical, Keycloak as projection |
