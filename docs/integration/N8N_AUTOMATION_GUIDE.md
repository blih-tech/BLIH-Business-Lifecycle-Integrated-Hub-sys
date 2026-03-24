# n8n Automation Guide

**Module:** Integrations & Automation  
**Tool:** n8n (Workflow Automation)  
**Version:** 1.1  
**Last Updated:** February 2026

---

## Table of Contents

1. [Architectural Deep Dive](#1-architectural-deep-dive)
2. [Deployment & Infrastructure](#2-deployment--infrastructure)
3. [Authentication & Security](#3-authentication--security)
4. [BLIH Custom Nodes](#4-blih-custom-nodes)
5. [Advanced Workflow Patterns](#5-advanced-workflow-patterns)
6. [Debugging & Error Handling](#6-debugging--error-handling)
7. [Production Best Practices](#7-production-best-practices)

---

## 1. Architectural Deep Dive

n8n acts as the "glue" layer for BLIH, orchestrating events between the backend services and external world without requiring code changes to the core monolith.

### 1.1 Event-Driven Topology

```
Events (Webhooks)      Processing (n8n)        Actions (API)
┌─────────────┐       ┌────────────────┐      ┌──────────────┐
│  CRM Module │──────>│ Webhook Node   │      │  Slack API   │
│ (Lead Created)      │ (Wait for Event)      │ (Send Notif) │
└─────────────┘       └───────┬────────┘      └──────▲───────┘
                              │                      │
                      ┌───────▼────────┐      ┌──────┴───────┐
                      │ Transform Logic│──────>│  Email Service │
                      │ (JS Function)  │      │ (Send Welcome)│
                      └────────────────┘      └──────────────┘
```

### 1.2 Execution Modes

- **Default (Regular):** Executes workflows sequentially. Good for low volume.
- **Queue Mode (Worker):** Distributes execution across multiple worker nodes using Redis. Required for high-scale environments (>10 workflows/sec).

---

## 2. Deployment & Infrastructure

We deploy n8n using Docker Compose, typically segregated from the main app network for security but linked via internal bridge for API access.

### 2.1 Docker Compose Configuration

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - '5678:5678'
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASS}
      - N8N_HOST=${DOMAIN_NAME}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://${DOMAIN_NAME}/webhook
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=${DB_USER}
      - DB_POSTGRESDB_PASSWORD=${DB_PASS}
      - EXECUTIONS_DATA_PRUNE=true
      - EXECUTIONS_DATA_MAX_AGE=168 # 7 Days
      - EXECUTIONS_MODE=regular # Change to 'queue' for scaling
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - blih_internal

volumes:
  n8n_data:

networks:
  blih_internal:
    external: true # Join existing BLIH network
```

### 2.2 Reverse Proxy (Nginx)

Expose n8n securely using Nginx with SSL:

```nginx
server {
    listen 443 ssl;
    server_name n8n.yourcompany.com;

    ssl_certificate /etc/letsencrypt/live/n8n.../fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/n8n.../privkey.pem;

    location / {
        proxy_pass http://n8n:5678;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Upgrade $http_upgrade;
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
        proxy_buffering off;
        proxy_cache off;
    }
}
```

---

## 3. Authentication & Security

### 3.1 BLIH Integration Auth

To allow n8n to call BLIH APIs safely:

1. **Create Service Account:** In BLIH Admin, create a user `n8n_bot` with `ROLE_INTEGRATION`.
2. **Generate API Key:** Generate a persistent API Key (e.g., `sk_live_...`).
3. **n8n Credential:**
   - Type: `Header Auth`
   - Name: `Authorization`
   - Value: `Bearer sk_live_...`

### 3.2 Webhook Security (HMAC)

To verify that incoming webhooks to n8n are actually from BLIH:

1. **BLIH:** Signs payloads with `HmacSHA256(payload, secret)`. Sends signature in header `X-BLIH-Signature`.
2. **n8n:** Use **Crypto** node to replicate the hash and compare.

**Workflow Validation Step:**

```javascript
// Function Node
const crypto = require('crypto');
const secret = 'my_webhook_secret';
const signature = items[0].json.headers['x-blih-signature'];
const payload = JSON.stringify(items[0].json.body);

const expected = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

if (signature !== expected) {
  throw new Error('Invalid Webhook Signature');
}
return items;
```

---

## 4. BLIH Custom Nodes (Optional)

For a better developer experience, we can construct a declarative **OpenAPI node**.

1. **Export Spec:** Download `openapi.json` from BLIH API.
2. **Import to n8n:** Use the "OpenAPI" node type (via community nodes) to auto-generate UI for all API endpoints.

Alternatively, standard **HTTP Request** nodes are sufficient for most tasks.

**Common Configuration:**

- **URL:** `http://blih-backend:3000/api/v1/{{resource}}` (Internal Docker DNS)
- **Auth:** Header Auth Credential
- **Keep Alive:** True (for performance)

---

## 5. Advanced Workflow Patterns

### 5.1 The "Saga" Pattern (Long-running)

Handle complex business logic that spans days (e.g., Onboarding).

1. **Wait Node:** "Wait 2 Days" or "Wait for Webhook".
2. **State Management:** Use n8n static data (`$getWorkflowStaticData()`) to store state between executions if needed, though standard Flow logic handles wait states natively.

### 5.2 Error Propagation

Push errors back to BLIH/Monitoring.

- **Error Workflow:** Create a dedicated "Error Handler" workflow.
- **Trigger:** In Workflow Settings, set "Error Workflow" to this handler.
- **Action:** Post error details (Node name, Error message, Execution ID) to Slack `#ops-alerts` and PagerDuty.

### 5.3 Batch Processing

For bulk updates (e.g., updating 10,000 Lead Scores):

1. **BLIH API:** Get all Leads (paginated).
2. **Split In Batches:** Batch size 50.
3. **Calculation:** Compute new score.
4. **HTTP Request:** `PATCH /leads` (Bulk endpoint if available, otherwise Loop).
5. **Wait:** 100ms (Rate Limit protection).

---

## 6. Debugging & Error Handling

### 6.1 Execution Logs

- **UI:** View visual execution path (Green/Red lines).
- **Data:** Inspect JSON Input/Output for every node.
- **Retry:** "Retry Failed Execution" button allows re-running from the failed node with corrected logic.

### 6.2 Common Errors

| Error              | Cause                           | Fix                                                                                               |
| ------------------ | ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `ECONNREFUSED`     | n8n cannot reach BLIH container | Use Docker service name `http://blih-backend` not `localhost`                                     |
| `401 Unauthorized` | API Key invalid/expired         | Rotate API Key in n8n Credentials                                                                 |
| `Memory Leak`      | Large binary files              | Avoid "All Executions" logging for heavy workflows. Use `binary` property, don't convert to JSON. |

---

## 7. Production Best Practices

1. **Git Integration:** Enable n8n Git sync to version control your workflows.
   - `N8N_GIT_SYNC_ACTIVE=true`
2. **Pruning:** aggressively prune execution logs (7 days max) to prevent DB bloat.
3. **Queue Mode:** Use Redis if running >50 concurrent executions.
4. **Environment Variables:** Never hardcode secrets. Use `{{ $env.API_KEY }}` in nodes.
5. **High Availability:** Run Multiple n8n Workers behind a Load Balancer (requires Queue Mode).

---

**Related Documentation:**

- [AI_CHATBOT_RAG_GUIDE.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/modules/AI_CHATBOT_RAG_GUIDE.md) - AI Workflows
- [DEPLOYMENT_INFRASTRUCTURE.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/integration/DEPLOYMENT_INFRASTRUCTURE.md) - Infrastructure Context
