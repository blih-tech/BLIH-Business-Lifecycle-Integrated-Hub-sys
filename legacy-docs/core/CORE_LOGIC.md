# BLIH Core Logic & Orchestration

This document describes the "Business Engine" of the BLIH system—the logic that governs how data flows between modules, how global constraints are enforced, and how complex business processes are orchestrated.

## 1. Business Engine Overview

BLIH operates on a **Decentralized Logic / Centralized Governance** model.

- **Module Logic**: Specific business rules (e.g., payroll calculations, tax rules) reside within their respective NestJS business services.
- **Core Platform Logic**: Global cross-cutting concerns (e.g., auth, audit, notifications) are handled by the Core Platform.
- **Orchestration**: Complex transitions that bridge two or more domains (e.g., CRM to Projects) are managed via the **Event Bus (RabbitMQ)** and **Saga Patterns**.

## 2. Cross-Module Orchestration

The system uses asynchronous events to trigger logic in downstream modules.

### Case Study: Lead-to-Project Lifecycle

1.  **CRM Module**: A user marks a `Deal` as `WON`.
    - Logic: Update deal status, calculate final commissions.
    - Event: Emits `crm.deal.won`.
2.  **Projects Module**: Listens for `crm.deal.won`.
    - Logic:
      - Auto-create a `Project` record linked to the `Deal`.
      - Create a `Project Folder` in the Knowledge Base (Brain).
      - Copy "Service Items" from the Deal as initial "Milestones" in the Project.
3.  **Finance Module**: Listens for `crm.deal.won`.
    - Logic: Generate a "Deposit Invoice" if the project terms require upfront payment.

## 3. Data Integrity & Polyglot Consistency

Maintaining a consistent "Source of Truth" across MongoDB, PostgreSQL, and Qdrant requires specific logic patterns:

- **Primary Source (PostgreSQL)**: The authoritative record for transactional data (Users, Transactions, Metadata).
- **Secondary Projection (MongoDB)**: Optimized views for UI performance (Dashboards, Complex Forms). Logic in the API layer ensures that any update to the Primary Source emits an event to update the Projection.
- **Vector Projection (Qdrant)**: Logic in the Brain module automatically generates embeddings whenever "Knowledge Content" is updated in MongoDB.

## 4. Global Constraints

The following logic rules are enforced globally to ensure consistency:

### 📅 Temporal Logic

- **Timezones**: All database timestamps are stored in **UTC**. Conversion to local timezone (e.g., `Africa/Addis_Ababa`) happens at the Presentation Layer.
- **Calendars**: The system supports the **Ethiopian Calendar** for HR and Attendance logic. A global utility service handles the algorithmic conversion between Gregorian and Ethiopian dates.

### 💰 Monetary Logic

- **Precision**: Monetary values are stored as integers (cents/minimum units) to avoid floating-point errors.
- **Multi-Currency**: Base currency is **ETB**. Exchange rates are fetched daily and cached in Redis. Every transaction stores both the _transacted currency_ and the _base currency equivalent_ at the time of transaction.

## 5. State Machine Patterns

All core business entities (Leads, Employees, Projects, Invoices) follow a standardized status transition logic:

| Event     | Transition           | Validation Rule                                     |
| --------- | -------------------- | --------------------------------------------------- |
| `APPROVE` | `PENDING` → `ACTIVE` | Requires a User with sufficient `ActionPermission`. |
| `SUSPEND` | `ACTIVE` → `SUSPND`  | Only if no critical dependencies exist.             |
| `ARCHIVE` | `*` → `ARCHIV`       | Immutable state. No further edits allowed.          |

## 6. Audit & Governance Logic

The **Audit Service** logic ensures "Defense in Depth":

- **Pre-Hook logic**: Captures the "Before" state of a record.
- **Post-Hook logic**: Captures the "After" state and compares for a diff.
- **Immutability**: Audit logs are written to an Append-Only database. Logic at the database driver level prevents `DELETE` or `UPDATE` operations on the `audit_logs` table.
- **Evidence Bundling**: Logic in the Compliance sub-system allows a user to "flag" multiple audit logs as evidence for a specific ISO control, creating a logical link for auditors.

---

_Last Updated: February 2026_
