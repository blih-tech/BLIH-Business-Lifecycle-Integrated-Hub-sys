# BLIH Core Logic Documentation

This document serves as the definitive guide to the **BLIH Business Engine**. It details the logic governing cross-module orchestration, global system constraints, and the lifecycle of core business entities.

---

## 🏛️ 1. Core Principles

The Business Engine is built upon four foundational principles:

1.  **Modular Autonomy**: Every module (HR, CRM, etc.) owns its business logic and data schema. Integration is handled via contract-based events.
2.  **Event-Driven Integration**: Actions in one module trigger side effects in others asynchronously through RabbitMQ.
3.  **Compliance-First**: Every state change must pass through the RBAC and Audit Logic layers.
4.  **Single Company Context**: All logic is scoped to the `BLIH` company context, ensuring strictly isolated organizational data.

---

## 🌍 2. Global Constraints & Utilities

These logic rules are enforced system-wide to ensure data consistency.

### 📅 Temporal Logic: UTC and Ethiopian Calendar
*   **Storage**: All timestamps are stored in **UTC** in the database.
*   **Presentation**: User-facing dates are converted based on the organizational timezone (`Africa/Addis_Ababa`).
*   **Calendar Translation**: For HR (Attendance, Leave) and Finance (Tax cycles), the system uses the `EthiopianCalendarService` to algorithmically map Gregorian dates to the 13-month Ethiopian calendar.
    *   *Rule*: All business logic calculations for "Months" in HR use the Ethiopian cycle unless specified otherwise.

### 💹 Monetary Precision: Integer cents
*   **No Floats**: To prevent rounding errors, all monetary values (salaries, deal values, tax) are stored as **integers** (e.g., $100.00 is stored as `10000`).
*   **Calculations**: Division for tax or commission is performed last in the logic chain to maximize precision.
*   **Base Currency**: The system source of truth is **ETB**. Transactions in other currencies store the `spot_rate` and `base_equivalent` at the time of the transaction.

---

## 🔄 3. Entity Lifecycle & State Machines

BLIH uses a standardized **Finite State Machine (FSM)** pattern for all core entities.

| Entity | Primary Statuses | Key Transition Logic |
| :--- | :--- | :--- |
| **Lead (CRM)** | `NEW` → `QUALIFIED` → `CONVERTED` | Transition to `CONVERTED` triggers the auto-creation of a Project and Client Organization. |
| **Employee (HR)** | `ONBOARDING` → `ACTIVE` → `EXIT` | Moving to `ACTIVE` triggers payroll enrollment and IT resource provisioning notifications. |
| **Project (PROJ)** | `DRAFT` → `IN_PROGRESS` → `COMPLETED` | `COMPLETED` triggers project performance analysis and moves the project "Lessons Learned" into the Brain module. |
| **Invoice (FIN)** | `DRAFT` → `SENT` → `PAID` | Transition to `PAID` updates the CRM Deal status and adjusts the Project's "Remaining Budget." |

---

## 🛰️ 4. Cross-Module Orchestration

Complex business processes span multiple modules. Orchestration is managed by **Event-Driven Sagas**.

### Case: The "Sales to Delivery" Workflow
1.  **Trigger**: CRM emits `crm.deal.won`.
2.  **Projects Logic**: Subscribes to event. 
    *   Creates Project record.
    *   Assigns Deal Owner as the initial Project Sponsor.
    *   Initiates "Milestone Generation" based on the Deal's Line Items.
3.  **Brain Logic**: Subscribes to event.
    *   Generates a secure Project Workspace folder.
    *   Populates workspace with standard "Delivery Templates" based on Project Type.
4.  **Finance Logic**: Subscribes to event.
    *   Checks for pre-payment terms.
    *   Generates "Milestone 0" Invoice if required.

---

## 💾 5. Data Synchronization Logic

The system utilizes a **Polyglot Persistence Layer** with specific sync logic:

*   **Transactional Sync (PostgreSQL → MongoDB)**: 
    *   Every `UPDATE` in PostgreSQL emits a `cdc.data.changed` event.
    *   The `ProjectionService` listens and updates the normalized MongoDB documents used for the Dashboard UI.
*   **Vector Sync (MongoDB → Qdrant)**:
    *   When a document is finalized in HR or Brain, the `EmbeddingService` extracts text, generates vectors via the local LLM, and stores the index in Qdrant for RAG search.

---

## 🛡️ 6. Governance & RBAC Logic

Logic-level security is enforced before any data reaches the persistence layer:

*   **Action Permissions**: `module:resource:action` (e.g., `HR:employee:terminate`).
*   **Resource Scoping**: Permissions are further scoped by data ownership (e.g., `OWN_ONLY`, `TEAM_ONLY`, `DEPARTMENT_ONLY`, `GLOBAL`).
*   **Audit Lock**: Once an audit event is published, the `AuditService` ensures it is written to the immutable log. Any attempt to modify an existing log entry triggers a `SecurityAlert` event.

---
*Created: February 2026*
