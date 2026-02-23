# BLIH Request Flow

**Purpose:** Documents the order of execution for every API request in the BLIH backend, aligned with CORE_LOGIC_COMPLETE.md section 2.3 (Compliance-First Design).  
**Audience:** Backend developers, auditors  
**Version:** 1.1 | February 2026

---

## Pipeline order

Every authenticated API operation follows this sequence:

```
User Request
    -> Authentication (JWT)
    -> Authorization (RBAC)
    -> Validation (business rules / DTOs)
    -> Pre-Audit Hook (capture "before" state)
    -> Business Logic (controller -> use case)
    -> Post-Audit Hook (capture "after" state, persist audit)
    -> Event Publishing (in use case, to blih.events)
    -> Unified Response Envelope
```

---

## Single-Realm Behavior

- API tenant/realm override inputs are not used for normal endpoints.
- Runtime realm is resolved from backend configuration (`KEYCLOAK_REALM`) via `RealmContextService`.
- `x-realm` request header is not required and is ignored for authentication realm resolution.

---

## Implementation in blih-system-backend

| Step | Component | Location / registration |
|------|-----------|---------------------------|
| **Middleware** | Correlation ID | `CorrelationIdMiddleware` - `AppModule.configure()` applied to `*path` |
| **Authentication** | JWT validation | `KeycloakAuthGuard` - applied per controller via `@UseGuards(KeycloakAuthGuard, RbacGuard)` |
| **Authorization** | RBAC permission check | `RbacGuard` - same; evaluates `@Roles()` and scope |
| **Validation** | DTO / business rules | Global `ValidationPipe` - `main.ts` `app.useGlobalPipes(new ValidationPipe())` |
| **Pre-Audit** | Capture "before" state | `PreAuditInterceptor` - `APP_INTERCEPTOR` in `AppModule` (registered before `AuditInterceptor`). Uses `@AuditState({ resourceIdKey, loadBefore: true })` and `AuditStateService` to load entity snapshot and attach to request. |
| **Business logic** | Controller + use case | Controller handler invokes use case. |
| **Post-Audit** | Capture "after" state, persist | `AuditInterceptor` - `APP_INTERCEPTOR` in `AppModule`. Reads `before` from request (set by PreAudit), uses handler response or body as `after`, writes to `AuditLog` with `before` / `after` / `resourceId`. |
| **Event publishing** | Notify other modules | Inside use cases: `EventBusService.publish(eventType, data, metadata)` to exchange `blih.events`. |
| **Response** | Unified envelope | `ResponseEnvelopeInterceptor` wraps every HTTP route output into `ApiResponse<T>`. `HttpExceptionFilter` emits the same shape for errors. |

---

## Interceptor order

In `AppModule`, interceptors are registered in this order (first registered runs first on the way in):

1. `LoggingInterceptor`
2. `PreAuditInterceptor` - runs before the controller; loads "before" state when `@AuditState({ loadBefore: true })` is present.
3. `AuditInterceptor` - runs after the controller (in `tap`); persists one audit record with before/after and outcome.
4. `ResponseEnvelopeInterceptor` - finalizes all successful handler outputs into the unified response contract.

---

## Unified Response Contract

- All HTTP routes return the same top-level shape:
  - `success: boolean`
  - `message: string`
  - `data: T | null`
  - `error: { code, details?, fieldErrors? } | null`
  - `meta: { timestamp, requestId, version, pagination? }`
- Validation and runtime exceptions are normalized by `HttpExceptionFilter` into the same contract (`success=false`, `data=null`, non-null `error`).
- Internal paginated handler output must be:
  - `{ items: T[], pagination: { page, limit, total, totalPages, hasNextPage, hasPreviousPage } }`
- Public pagination is exposed only in `meta.pagination`, with canonical `totalItems`.

---

## Pre-Audit and Post-Audit details

- **Pre-Audit:** For routes decorated with `@Audit(...)` and `@AuditState({ resourceIdKey: 'params.id', loadBefore: true })`, `PreAuditInterceptor` resolves the resource id from the request, calls `AuditStateService.loadBeforeState(resource, id)`, and attaches the snapshot to `request.auditBeforeState` and `request.auditResourceId`.
- **Post-Audit:** `AuditInterceptor` persists to `AuditLog` with `before` = `request.auditBeforeState`, `after` = handler response body (if object) or `request.body`, and `resourceId` = `request.auditResourceId`. So audit records contain both before and after state when pre-audit is used.

---

## References

- [CORE_LOGIC_COMPLETE.md](./CORE_LOGIC_COMPLETE.md) section 2.3 - Compliance-First Design flow
- [EVENT_CONTRACTS.md](./EVENT_CONTRACTS.md) - Event envelope and `blih.events`
- Backend: `src/app.module.ts`, `src/main.ts`, `src/shared/interceptors/audit.interceptor.ts`, `src/shared/interceptors/pre-audit.interceptor.ts`, `src/shared/interceptors/response-envelope.interceptor.ts`, `src/shared/filters/http-exception.filter.ts`
