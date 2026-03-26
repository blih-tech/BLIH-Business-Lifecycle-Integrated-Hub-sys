# BLIH Core Architecture and Module Boundaries

**Purpose:** Defines how the core platform and domain modules interact; enforces event-driven communication and no direct cross-module API calls.  
**Audience:** Backend developers, architects  
**Version:** 1.0 | February 2026

---

## 1. Module boundaries

### Core vs domain modules

- **Core** (`blih-system-backend/src/core`): Shared platform capabilities — auth, RBAC, audit, event bus, persistence, notifications, organization, realms, system config. Core does not depend on domain modules.
- **Domain modules** (e.g. `src/hr`, `src/crm`, `src/finance`, `src/project`, `src/brain`, `src/chatbot`): Business logic and entities for a single bounded context. They may depend only on **core** and **shared** (`src/shared`).

### Rule: No direct cross-module calls

1. **Domain modules MUST NOT** import or call other domain modules’ controllers, services, or use cases.  
   Example: HR must not call CRM’s API or inject CRM’s services.

2. **Cross-module communication is only via events.**  
   Publish and subscribe through `EventBusService` and the RabbitMQ exchange `blih.events`. See [EVENT_CONTRACTS.md](./EVENT_CONTRACTS.md).

3. **Domain modules** may only depend on:
   - `src/core/*` (auth, rbac, audit, infrastructure, users, organization, etc.)
   - `src/shared/*` (decorators, guards, pipes, utils, interfaces)

---

## 2. Event-driven communication

- **Exchange:** `blih.events` (topic).
- **Naming:** `{module}.{entity}.{action}` (e.g. `hr.employee.hired`, `crm.deal.won`).
- **Envelope:** Every event has `metadata.version` and `metadata.schema`; see EVENT_CONTRACTS.md.
- **Core identity events** use canonical `core.*` names (e.g. `core.user.created`, `core.role.assigned`, `core.department.changed`).

To integrate with another module:

- **Publish** domain events after mutations via `EventBusService.publish(...)`.
- **Subscribe** by registering handlers with the event bus for the relevant routing patterns (e.g. `hr.employee.*`), or by binding queues to those patterns.

---

## 3. Enforcement

- **Documentation:** This file and CORE_LOGIC_COMPLETE.md are the source of truth.
- **Optional:** The backend can enforce module boundaries via ESLint `no-restricted-imports` so that `src/hr`, `src/crm`, `src/finance`, `src/project`, `src/brain`, `src/chatbot` cannot import from each other.

---

## 4. References

- [CORE_LOGIC_COMPLETE.md](./CORE_LOGIC_COMPLETE.md) — Business logic, flow, event rules
- [EVENT_CONTRACTS.md](./EVENT_CONTRACTS.md) — Event envelope and catalog
- [REQUEST_FLOW.md](./REQUEST_FLOW.md) — Request pipeline (auth → RBAC → validation → pre/post audit → event publish)
