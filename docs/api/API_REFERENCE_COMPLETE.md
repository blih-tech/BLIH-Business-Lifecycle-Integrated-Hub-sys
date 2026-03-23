# BLIH Complete API Reference

**Version:** 1.0  
**Last Updated:** February 2026  
**Base URL:** `https://api.blih.yourcompany.com`

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Authentication](#2-authentication)
3. [API Modules Overview](#3-api-modules-overview)
4. [Common Patterns](#4-common-patterns)
5. [Error Handling](#5-error-handling)
6. [Rate Limiting](#6-rate-limiting)
7. [Webhooks](#7-webhooks)
8. [SDKs & Tools](#8-sdks--tools)

---

## 1. Quick Start

### 1.1 Get API Access

1. **Login to BLIH** and navigate to Settings → API Keys
2. **Create API Key** with required scopes
3. **Copy the key** (shown only once)

### 1.2 Make Your First Request

```bash
curl -X GET "https://api.blih.yourcompany.com/api/v1/users/me" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

**Response:**

```json
{
  "id": "user_123",
  "email": "you@company.com",
  "name": "Your Name",
  "company_id": "comp_abc",
  "roles": ["ADMIN"],
  "permissions": ["HR:read", "CRM:write", ...]
}
```

---

## 2. Authentication

### 2.1 Authentication Methods

| Method        | Use Case                 | Format                              |
| ------------- | ------------------------ | ----------------------------------- |
| **API Key**   | Server-to-server         | `Authorization: Bearer sk_live_...` |
| **JWT Token** | User sessions            | `Authorization: Bearer eyJhbGc...`  |
| **OAuth 2.0** | Third-party integrations | `Authorization: Bearer oauth_token` |

### 2.2 Get JWT Token

```http
POST /api/v1/auth/login
```

**Request:**

```json
{
  "email": "user@company.com",
  "password": "your_password",
  "mfa_code": "123456" // If MFA enabled
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "rt_abc123...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### 2.3 Refresh Token

```http
POST /api/v1/auth/refresh
```

**Request:**

```json
{
  "refresh_token": "rt_abc123..."
}
```

---

## 3. API Modules Overview

### 3.1 Core Module (`/api/v1/core`)

**System-wide functionality**

| Endpoint              | Description       |
| --------------------- | ----------------- |
| `GET /users`          | List users        |
| `GET /companies`      | List companies    |
| `GET /audit-logs`     | Query audit trail |
| `POST /notifications` | Send notification |

📄 **[CORE_API.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/CORE_API.md)** - Full documentation

---

### 3.2 HR Module (`/api/v1/hr`)

**Human Resources management**

**Key Endpoints:**

```
GET    /hr/employees           # List employees
POST   /hr/employees           # Create employee
GET    /hr/employees/:id       # Get employee details
PATCH  /hr/employees/:id       # Update employee

GET    /hr/jobs                # Job postings
GET    /hr/candidates          # Recruitment
GET    /hr/attendance          # Time & attendance
GET    /hr/payroll             # Payroll processing
```

📄 **[HR_API.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/HR_API.md)** - Full documentation

---

### 3.3 CRM Module (`/api/v1/crm`)

**Customer Relationship Management**

**Key Endpoints:**

```
GET    /crm/customers          # List customers
POST   /crm/customers          # Create customer
GET    /crm/leads              # Sales leads
POST   /crm/leads/:id/convert  # Convert lead to customer

GET    /crm/deals              # Sales pipeline
POST   /crm/deals              # Create deal
PATCH  /crm/deals/:id/stage    # Update deal stage
POST   /crm/deals/:id/close    # Win/lose deal

GET    /crm/activities         # Activities log
POST   /crm/activities         # Log activity
```

📄 **[CRM_API.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/CRM_API.md)** - Full documentation

---

### 3.4 Finance Module (`/api/v1/finance`)

**Finance & Accounting**

**Key Endpoints:**

```
GET    /finance/accounts             # Chart of accounts
GET    /finance/accounts/:id/balance # Account balance

GET    /finance/journal-entries      # Journal entries
POST   /finance/journal-entries      # Create entry
POST   /finance/journal-entries/:id/post  # Post entry

GET    /finance/invoices             # Invoices
POST   /finance/invoices             # Create invoice
POST   /finance/payments             # Record payment
POST   /finance/payment-requests/:id/approve  # Approve payment

GET    /finance/reports/balance-sheet     # Balance sheet
GET    /finance/reports/profit-loss       # P&L Statement
GET    /finance/reports/cash-flow         # Cash flow
```

📄 **[FINANCE_API.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/FINANCE_API.md)** - Full documentation

---

### 3.5 Projects Module (`/api/v1/projects`)

**Project Management**

**Key Endpoints:**

```
GET    /projects                     # List projects
POST   /projects                     # Create project
POST   /projects/:id/members         # Add team member

GET    /projects/:id/tasks           # Tasks
POST   /projects/:id/tasks           # Create task
PATCH  /projects/:id/tasks/:taskId   # Update task

GET    /projects/:id/time-entries    # Time tracking
POST   /projects/:id/time-entries    # Log time
POST   /projects/:id/time-entries/approve  # Approve time

GET    /projects/:id/documents       # Documents
POST   /projects/:id/documents       # Upload document
GET    /projects/:id/timeline        # Gantt chart data
```

📄 **[PROJECTS_API.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/PROJECTS_API.md)** - Full documentation

---

### 3.6 Brain (AI) Module (`/api/v1/brain`)

**AI & Knowledge Management**

**Key Endpoints:**

```
GET    /brain/knowledge/documents    # Knowledge base
POST   /brain/knowledge/documents    # Upload document
DELETE /brain/knowledge/documents/:id # Delete document

POST   /brain/rag/search             # Semantic search
POST   /brain/rag/query              # RAGquery with answer

POST   /brain/chat/sessions          # Start AI chat
POST   /brain/chat/sessions/:id/messages  # Send message
GET    /brain/chat/sessions/:id/messages  # Chat history

POST   /brain/decisions              # Record decision
GET    /brain/decisions              # Search decisions
GET    /brain/decisions/:id/similar  # Similar decisions
```

📄 **[BRAIN_API.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/BRAIN_API.md)** - Full documentation

---

## 4. Common Patterns

### 4.1 Pagination

All list endpoints support pagination:

```http
GET /api/v1/crm/customers?page=2&limit=50
```

**Response:**

```json
{
  "data": [...],
  "meta": {
    "total": 500,
    "page": 2,
    "limit": 50,
    "totalPages": 10,
    "hasNext": true,
    "hasPrevious": true
  }
}
```

### 4.2 Filtering

```http
GET /api/v1/hr/employees?department=Engineering&status=ACTIVE
```

### 4.3 Sorting

```http
GET /api/v1/crm/deals?sort=value&order=DESC
```

### 4.4 Field Selection

Request only specific fields:

```http
GET /api/v1/crm/customers?fields=id,email,company
```

### 4.5 Search

Full-text search:

```http
GET /api/v1/hr/employees?search=john
```

### 4.6 Date Ranges

```http
GET /api/v1/finance/journal-entries?from_date=2026-01-01&to_date=2026-01-31
```

---

## 5. Error Handling

### 5.1 Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "value": "invalid-email"
      }
    ]
  },
  "timestamp": "2026-02-10T14:00:00Z",
  "path": "/api/v1/crm/customers",
  "request_id": "req_abc123"
}
```

### 5.2 Common HTTP Status Codes

| Code    | Meaning               | Example                  |
| ------- | --------------------- | ------------------------ |
| **200** | OK                    | Successful GET, PATCH    |
| **201** | Created               | Successful POST          |
| **204** | No Content            | Successful DELETE        |
| **400** | Bad Request           | Validation error         |
| **401** | Unauthorized          | Missing/invalid token    |
| **403** | Forbidden             | Insufficient permissions |
| **404** | Not Found             | Resource doesn't exist   |
| **409** | Conflict              | Duplicate resource       |
| **422** | Unprocessable Entity  | Business rule violation  |
| **429** | Too Many Requests     | Rate limit exceeded      |
| **500** | Internal Server Error | Server error             |

### 5.3 Error Codes Reference

| Code                  | Description              | Action                    |
| --------------------- | ------------------------ | ------------------------- |
| `UNAUTHORIZED`        | Invalid credentials      | Re-authenticate           |
| `FORBIDDEN`           | Insufficient permissions | Contact admin             |
| `VALIDATION_ERROR`    | Invalid input            | Fix request data          |
| `NOT_FOUND`           | Resource not found       | Check ID                  |
| `CONFLICT`            | Duplicate resource       | Use different value       |
| `RATE_LIMIT_EXCEEDED` | Too many requests        | Wait and retry            |
| `SOD_VIOLATION`       | Segregation of duties    | Different approver needed |
| `JAILBREAK_DETECTED`  | AI prompt injection      | Rephrase query            |

---

## 6. Rate Limiting

### 6.1 Rate Limits by Endpoint Type

| Endpoint Type       | Limit        | Window   |
| ------------------- | ------------ | -------- |
| **Standard**        | 100 requests | 1 minute |
| **Reports**         | 20 requests  | 1 hour   |
| **AI Queries**      | 50 requests  | 1 hour   |
| **Bulk Operations** | 10 requests  | 1 minute |
| **File Uploads**    | 20 requests  | 1 hour   |

### 6.2 Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1707573600
```

### 6.3 Rate Limit Exceeded Response

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit of 100 requests per minute exceeded",
    "retry_after": 45
  }
}
```

**HTTP Status:** `429 Too Many Requests`

---

## 7. Webhooks

### 7.1 Webhook Events

Subscribe to real-time events:

| Module       | Events                                                            |
| ------------ | ----------------------------------------------------------------- |
| **HR**       | `employee.created`, `employee.terminated`, `attendance.submitted` |
| **CRM**      | `customer.created`, `deal.won`, `deal.lost`                       |
| **Finance**  | `invoice.created`, `payment.received`, `payment.approved`         |
| **Projects** | `project.created`, `task.completed`, `time.submitted`             |
| **Brain**    | `document.indexed`, `decision.created`                            |

### 7.2 Create Webhook

```http
POST /api/v1/webhooks
```

**Request:**

```json
{
  "url": "https://your-app.com/webhooks/blih",
  "events": ["customer.created", "deal.won"],
  "secret": "your_webhook_secret"
}
```

### 7.3 Webhook Payload

```json
{
  "id": "evt_abc123",
  "event": "deal.won",
  "timestamp": "2026-02-10T14:00:00Z",
  "data": {
    "deal_id": "deal_123",
    "value": 50000,
    "customer_id": "cust_456"
  },
  "signature": "sha256=..."
}
```

### 7.4 Verify Webhook Signature

```typescript
import crypto from 'crypto';

function verifyWebhook(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return `sha256=${expectedSignature}` === signature;
}
```

---

## 8. SDKs & Tools

### 8.1 Official SDKs

```bash
# JavaScript/TypeScript
npm install @blih/sdk

# Python
pip install blih-sdk

# PHP
composer require blih/sdk
```

### 8.2 SDK Usage Example

```typescript
import { BLIHClient } from '@blih/sdk';

const client = new BLIHClient({
  apiKey: 'sk_live_...',
  baseURL: 'https://api.blih.yourcompany.com',
});

// List customers
const customers = await client.crm.customers.list({
  status: 'ACTIVE',
  limit: 50,
});

// Create deal
const deal = await client.crm.deals.create({
  title: 'Enterprise License',
  customer_id: 'cust_123',
  value: 50000,
});
```

### 8.3 Postman Collection

Import our Postman collection for easy testing:

**Download:** [BLIH_API_Postman_Collection.json](link)

### 8.4 OpenAPI Specification

**OpenAPI 3.0 Spec:** [https://api.blih.yourcompany.com/openapi.json](link)

Use with tools like:

- Swagger UI
- Redoc
- Postman

---

## API Versioning

### Current Version: v1

- **Backward compatibility:** Minor changes won't break existing integrations
- **Deprecation policy:** 6 months notice before removing endpoints
- **Version header:** Include `X-API-Version: 1` for explicit versioning

---

## Support & Resources

### Documentation

- **Core API:** [CORE_API.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/CORE_API.md)
- **HR API:** [HR_API.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/HR_API.md)
- **CRM API:** [CRM_API.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/CRM_API.md)
- **Finance API:** [FINANCE_API.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/FINANCE_API.md)
- **Projects API:** [PROJECTS_API.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/PROJECTS_API.md)
- **Brain API:** [BRAIN_API.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/BRAIN_API.md)

### Security

- **Security Overview:** [SECURITY_OVERVIEW.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/security/SECURITY_OVERVIEW.md)

### Getting Help

- **Email:** api-support@yourcompany.com
- **Slack:** #api-support
- **Status Page:** https://status.blih.yourcompany.com

---

**Last Updated:** February 2026  
**API Version:** 1.0  
**Maintained by:** API Team
