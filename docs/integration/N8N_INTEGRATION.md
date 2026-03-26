# n8n Integration Specification

**Module:** Automation  
**Component:** BLIH <-> n8n Connectivity  
**Version:** 1.0  
**Last Updated:** February 2026

---

## Table of Contents

1. [Authentication Integration](#1-authentication-integration)
2. [Trigger Nodes (Webhooks)](#2-trigger-nodes-webhooks)
3. [Action Nodes (API Wrappers)](#3-action-nodes-api-wrappers)
4. [Custom BLIH n8n Nodes](#4-custom-blih-n8n-nodes)
5. [Embedded Workflow Editor](#5-embedded-workflow-editor)

---

## 1. Authentication Integration

Secure bidirectional communication between BLIH and n8n.

### 1.1 n8n -> BLIH (API Access)

n8n acts as an Integration User in BLIH.

- **Auth Method:** JWT (Service Account)
- **Token Generation:**
  ```http
  POST /api/v1/auth/service-accounts
  { "name": "n8n Automation", "roles": ["INTEGRATION_MANAGER"] }
  ```
- **n8n Credential:** `Header Auth` -> `Authorization: Bearer <JWT>`

### 1.2 BLIH -> n8n (Trigger Access)

BLIH triggers n8n workflows via Webhooks.

- **Access Scope:** Internal Docker Network (No public internet access needed).
- **Security:** `X-BLIH-Signature` HMAC Header.
- **Whitelist:** BLIH only sends requests to `http://n8n:5678/*`.

---

## 2. Trigger Nodes (Webhooks)

Standardized Webhook payloads BLIH sends to n8n.

### 2.1 Global Event Bus

BLIH emits events for **all** standard lifecycle changes. n8n can subscribe to any.

**Endpoint Pattern:** `POST /webhook/{workflow_id}`

**Standard Payload:**
```json
{
  "event_type": "crm.lead.created",
  "occurred_at": "2026-02-10T12:00:00Z",
  "actor": {
    "id": "u_system",
    "type": "SYSTEM"
  },
  "resource": {
    "id": "lead_123",
    "type": "LEAD",
    "url": "https://blih.com/crm/leads/lead_123"
  },
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "score": 45
  }
}
```

### 2.2 Supported Events

| Module | Event | Description |
|--------|-------|-------------|
| **CRM** | `lead.created`, `lead.converted`, `deal.stage_changed` | Sales pipeline automation |
| **Finance** | `invoice.overdue`, `payment.received`, `expense.approved` | Dunning and reconciliation |
| **Projects** | `task.assigned`, `milestone.reached`, `budget.exceeded` | Notifications |
| **Brain** | `document.indexed`, `chat.handoff` | Knowledge ops |

---

## 3. Action Nodes (API Wrappers)

Although n8n uses generic HTTP Request nodes, we provide a **BLIH OpenAPI Specification** for easy configuration.

### 3.1 Importing OpenAPI Spec

1. Download: `https://api.blih.com/openapi.json`
2. n8n Action: **OpenAPI Node**
3. Select Operation: `Find Invoices` or `Create Lead`
4. UI generates form fields automatically.

### 3.2 Common Actions

**CRM: Create Activity**
- **Method:** POST `/crm/activities`
- **Use Case:** Log an interactions (Email/Call) from external tools.

**Finance: Create Invoice**
- **Method:** POST `/finance/invoices`
- **Use Case:** Generate invoice from e-commerce order (Shopify/WooCommerce).

**System: Send Notification**
- **Method:** POST `/notifications/send`
- **Use Case:** Push in-app alert to user.

---

## 4. Custom BLIH n8n Nodes

For a premium integration experience, we develop a custom n8n node package: `n8n-nodes-blih`.

### 4.1 Node Structure

**File:** `BLIH.node.ts`

```typescript
export class BLIH implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'BLIH',
        name: 'blih',
        icon: 'file:blih.svg',
        group: ['transform'],
        version: 1,
        defaults: { name: 'BLIH' },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'blihApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                options: [
                    { name: 'Lead', value: 'lead' },
                    { name: 'Invoice', value: 'invoice' },
                ],
                default: 'lead',
            },
            // ... Operations (Create, Get, Update)
        ]
    };
}
```

### 4.2 Installation

Dockerfile injection:
```dockerfile
FROM n8nio/n8n:latest
USER root
RUN npm install -g n8n-nodes-blih
USER node
```

---

## 5. Embedded Workflow Editor

Integrating the n8n UI *inside* BLIH Dashboard (Iframe).

### 5.1 Iframe Integration

**Route:** `/admin/automation`

```tsx
<iframe 
  src="https://n8n.blih.com/workflow/new?embed=true"
  width="100%"
  height="800px"
  frameBorder="0"
/>
```

### 5.2 SSO (Single Sign-On)

To prevent double-login:
1. BLIH generates a **JWT** for the Admin user.
2. n8n is configured behind `n8n-auth-proxy`.
3. Proxy validates JWT -> Sets `X-N8N-User-Id` header.
4. User is auto-logged into n8n.
