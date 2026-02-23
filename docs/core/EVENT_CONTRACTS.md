# BLIH Event Contracts

**Purpose:** Canonical event envelope schema, versioning, and public event catalog for `blih.events`.  
**Audience:** Backend developers, integration teams  
**Version:** 1.1 | February 2026

---

## 1. Exchange and Routing

- **Exchange:** `blih.events` (RabbitMQ topic exchange)
- **Routing key convention:** `{module}.{entity}.{action}`
- **Hard rules:**
1. Modules do not call other modules directly.
2. Cross-module communication is event-only.
3. Events are immutable.
4. Events are versioned.

---

## 2. Event Envelope (Required)

```json
{
  "eventType": "core.user.created",
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-02-13T12:00:00.000Z",
  "source": "blih-system-core",
  "data": {
    "userId": "user-123",
    "keycloakId": "kc-123"
  },
  "metadata": {
    "version": "1.0",
    "schema": "blih.event.core.user.created.v1",
    "correlationId": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "user-123"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventType` | string | Yes | Routing key |
| `eventId` | UUID string | Yes | Unique event occurrence id |
| `timestamp` | ISO-8601 string | Yes | Event occurrence timestamp |
| `source` | string | Yes | Publisher id/service |
| `data` | object | Yes | Immutable payload |
| `metadata.version` | string | Yes | Contract version (for compatibility) |
| `metadata.schema` | string | Yes | Schema id/name |
| `metadata.correlationId` | string | Yes | Trace id across flows |
| `metadata.userId` | string | No | Acting user |
| `metadata.realm` | string | No | **Deprecated for single-tenant.** Omit in new events. Consumers must not rely on it for tenant resolution; use configured realm (e.g. `KEYCLOAK_REALM`) instead. |

---

## 3. Versioning Rules

- Existing event type + version meanings must never be changed.
- Evolve by:
1. New event type (preferred for semantic changes), or
2. New `metadata.version` (for schema-compatible evolution)
- Consumers must deterministically ignore unsupported major versions.
- Consumers should be idempotent by `eventId`.

---

## 4. Core Identity Event Standardization

Use canonical `core.*` naming. Legacy event types are deprecated.

### 4.1 Legacy (deprecated, removal TBD)

- `user.created` → use `core.user.created`
- `user.updated` → use `core.user.updated`
- `user.disabled` → use `core.user.disabled`
- `role.assigned` → use `core.role.assigned`
- `role.revoked` → use `core.role.revoked`
- `permission.changed` → use `core.permission.changed`
- `session.revoked` → use `core.session.revoked`

### 4.2 Canonical Naming

- `core.user.created`
- `core.user.updated`
- `core.user.disabled`
- `core.role.assigned`
- `core.role.revoked`
- `core.permission.changed`
- `core.department.changed`
- `core.session.revoked`

---

## 5. Public Event Catalog (Current)

| Event type | Version | Module | Description |
|------------|---------|--------|-------------|
| `hr.employee.hired` | 1.0 | HR | Employee hired |
| `hr.employee.updated` | 1.0 | HR | Employee updated |
| `hr.employee.terminated` | 1.0 | HR | Employee terminated |
| `crm.deal.won` | 1.0 | CRM | Deal won |
| `projects.project.completed` | 1.0 | Projects | Project completed |
| `finance.invoice.paid` | 1.0 | Finance | Invoice paid |
| `brain.policy.published` | 1.0 | Brain | Policy published |
| `chatbot.response.sent` | 1.0 | Chatbot | Chatbot response emitted |
| `audit.finding.critical` | 1.0 | Core | Critical audit finding |
| `core.user.created` | 1.0 | Core | User created |
| `core.user.updated` | 1.0 | Core | User updated |
| `core.user.disabled` | 1.0 | Core | User disabled |
| `core.role.assigned` | 1.0 | Core | Role assigned |
| `core.role.revoked` | 1.0 | Core | Role revoked |
| `core.permission.changed` | 1.0 | Core | Permission changed |
| `core.department.changed` | 1.0 | Core | Department change propagated |
| `core.session.revoked` | 1.0 | Core | Session revoked/logout propagated |

---

## 6. Consumer Rules

1. Bind only to explicit routing keys/patterns relevant to your module.
2. Validate `metadata.version` and `metadata.schema`.
3. Ignore unsupported major versions.
4. Keep handlers idempotent by `eventId`.
5. Never replace event-driven flows with direct module API calls.

---

## 7. Queue Topology (Per-Module Queues)

Each module subscribes via a dedicated queue bound to `blih.events`. All queues use DLQ (`system.dlq`) for failed messages after retries.

| Queue                  | Binding Patterns                                                                 |
| ---------------------- | -------------------------------------------------------------------------------- |
| `core.events`          | `core.user.*`, `core.role.*`, `core.permission.*`, `core.session.*`, `core.department.*`, `user.*`, `role.*`, `system.user.*`, `system.role.*`, `system.config.*` |
| `hr.events`            | `hr.employee.*`, `system.hr.employee.*`                                          |
| `notifications.events` | `hr.employee.hired`, `audit.finding.critical`, `brain.policy.published`, `notification.*` |
| `crm.events`           | `crm.*`, `system.crm.*`                                                          |
| `finance.events`       | `finance.*`, `system.finance.*`                                                  |
| `projects.events`      | `projects.*`, `system.projects.*`                                                |
| `brain.events`         | `brain.*`, `system.brain.*`                                                      |
| `chatbot.events`       | `chatbot.*`, `system.chatbot.*`                                                  |
| `system.events`        | `audit.critical`                                                                 |

---

## 8. Handler Registration and Multi-Handler Behavior

- Multiple handlers may register for the same event type. All registered handlers are invoked in parallel via `Promise.allSettled`.
- If any handler fails, the message is retried (up to configurable max retries) and then moved to `system.dlq`.
- Handlers are registered per-module (e.g. `CoreSyncEventsHandler`, `NotificationEventsHandler`, `SystemEventsConsumerService`).
- Use `EventBusService.registerHandler(eventType, handler)` in `OnModuleInit`.
