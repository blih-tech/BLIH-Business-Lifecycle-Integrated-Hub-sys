# CRM API Documentation

**Module:** Customer Relationship Management  
**Version:** 1.0  
**Last Updated:** February 2026  
**Base URL:** `/api/v1/crm`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Customers API](#2-customers-api)
3. [Leads API](#3-leads-api)
4. [Deals API](#4-deals-api)
5. [Activities API](#5-activities-api)
6. [Error Handling](#6-error-handling)

---

## 1. Authentication

All CRM endpoints require JWT authentication:

```http
Authorization: Bearer <jwt_token>
```

**Required Permissions:**
- `CRM:customers:read` - View customers
- `CRM:customers:write` - Create/edit customers
- `CRM:deals:read` - View deals
- `CRM:deals:write` - Create/edit deals

---

## 2. Customers API

### 2.1 List Customers

```http
GET /api/v1/crm/customers
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Items per page (default: 20, max: 100) |
| `search` | string | No | Search by name/email |
| `status` | enum | No | `LEAD`, `PROSPECT`, `CUSTOMER`, `INACTIVE` |
| `owner_id` | string | No | Filter by owner |
| `sort` | string | No | Sort field (default: `created_at`) |
| `order` | enum | No | `ASC` or `DESC` (default: `DESC`) |

**Response:**
```json
{
  "data": [
    {
      "id": "cust_abc123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+251-911-123456",
      "company": "Acme Corp",
      "status": "CUSTOMER",
      "owner": {
        "id": "user_123",
        "name": "Jane Sales Rep"
      },
      "tags": ["enterprise", "high-value"],
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-02-10T14:00:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### 2.2 Get Customer

```http
GET /api/v1/crm/customers/:id
```

**Response:**
```json
{
  "id": "cust_abc123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+251-911-123456",
  "company": "Acme Corp",
  "website": "https://acme.com",
  "address": {
    "street": "123 Main St",
    "city": "Addis Ababa",
    "country": "Ethiopia"
  },
  "status": "CUSTOMER",
  "owner_id": "user_123",
  "tags": ["enterprise"],
  "customFields": {
    "industry": "Technology",
    "employees": 500
  },
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-02-10T14:00:00Z"
}
```

### 2.3 Create Customer

```http
POST /api/v1/crm/customers
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+251-911-123456",
  "company": "Acme Corp",
  "website": "https://acme.com",
  "status": "LEAD",
  "owner_id": "user_123",
  "tags": ["enterprise"],
  "customFields": {
    "industry": "Technology"
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "cust_abc123",
  ... // Full customer object
}
```

### 2.4 Update Customer

```http
PATCH /api/v1/crm/customers/:id
```

**Request Body:** (Partial update)
```json
{
  "status": "CUSTOMER",
  "tags": ["enterprise", "high-value"]
}
```

**Response:** `200 OK`

### 2.5 Delete Customer

```http
DELETE /api/v1/crm/customers/:id
```

**Response:** `204 No Content`

> **Note:** This is a soft delete. Use `?hard=true` for permanent deletion (requires `CRM:customers:delete` permission).

---

## 3. Leads API

### 3.1 List Leads

```http
GET /api/v1/crm/leads
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | enum | `NEW`, `CONTACTED`, `QUALIFIED`, `LOST` |
| `source` | enum | `WEBSITE`, `REFERRAL`, `MARKETING`, `COLD_CALL` |
| `score` | integer | Lead score filter (0-100) |

**Response:**
```json
{
  "data": [
    {
      "id": "lead_xyz789",
      "firstName": "Alice",
      "lastName": "Prospect",
      "email": "alice@company.com",
      "phone": "+251-922-654321",
      "company": "Prospect Inc",
      "status": "QUALIFIED",
      "source": "WEBSITE",
      "score": 85,
      "owner_id": "user_123",
      "created_at": "2026-02-05T09:00:00Z"
    }
  ],
  "meta": { ... }
}
```

### 3.2 Convert Lead to Customer

```http
POST /api/v1/crm/leads/:id/convert
```

**Response:**
```json
{
  "customer_id": "cust_new123",
  "message": "Lead converted successfully"
}
```

---

## 4. Deals API

### 4.1 List Deals

```http
GET /api/v1/crm/deals
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `stage` | enum | `PROSPECTING`, `QUALIFICATION`, `PROPOSAL`, `NEGOTIATION`, `CLOSED_WON`, `CLOSED_LOST` |
| `customer_id` | string | Filter by customer |
| `min_value` | number | Minimum deal value |
| `max_value` | number | Maximum deal value |

**Response:**
```json
{
  "data": [
    {
      "id": "deal_123abc",
      "title": "Enterprise License - Acme Corp",
      "customer": {
        "id": "cust_abc123",
        "name": "John Doe",
        "company": "Acme Corp"
      },
      "value": 50000,
      "currency": "USD",
      "stage": "NEGOTIATION",
      "probability": 70,
      "expected_close_date": "2026-03-15",
      "owner_id": "user_123",
      "created_at": "2026-01-20T10:00:00Z",
      "updated_at": "2026-02-10T14:00:00Z"
    }
  ],
  "meta": { ... }
}
```

### 4.2 Create Deal

```http
POST /api/v1/crm/deals
```

**Request Body:**
```json
{
  "title": "Enterprise License - Acme Corp",
  "customer_id": "cust_abc123",
  "value": 50000,
  "currency": "USD",
  "stage": "PROSPECTING",
  "expected_close_date": "2026-03-15",
  "owner_id": "user_123",
  "notes": "Initial contact made via email"
}
```

### 4.3 Update Deal Stage

```http
PATCH /api/v1/crm/deals/:id/stage
```

**Request Body:**
```json
{
  "stage": "PROPOSAL",
  "notes": "Sent proposal document"
}
```

### 4.4 Win/Lose Deal

```http
POST /api/v1/crm/deals/:id/close
```

**Request Body:**
```json
{
  "status": "WON",  // or "LOST"
  "actual_value": 48000,
  "notes": "Closed with 4% discount",
  "lost_reason": null  // Required if status = "LOST"
}
```

---

## 5. Activities API

### 5.1 List Activities

```http
GET /api/v1/crm/activities
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `customer_id` | string | Filter by customer |
| `deal_id` | string | Filter by deal |
| `type` | enum | `CALL`, `EMAIL`, `MEETING`, `NOTE`, `TASK` |
| `from_date` | date | Start date (ISO 8601) |
| `to_date` | date | End date |

**Response:**
```json
{
  "data": [
    {
      "id": "act_456def",
      "type": "MEETING",
      "subject": "Product Demo",
      "description": "Demonstrated key features",
      "customer_id": "cust_abc123",
      "deal_id": "deal_123abc",
      "scheduled_at": "2026-02-08T14:00:00Z",
      "duration_minutes": 60,
      "participants": ["user_123", "user_456"],
      "status": "COMPLETED",
      "created_by": "user_123",
      "created_at": "2026-02-05T10:00:00Z"
    }
  ],
  "meta": { ... }
}
```

### 5.2 Create Activity

```http
POST /api/v1/crm/activities
```

**Request Body:**
```json
{
  "type": "CALL",
  "subject": "Follow-up call",
  "description": "Discussed pricing options",
  "customer_id": "cust_abc123",
  "deal_id": "deal_123abc",
  "scheduled_at": "2026-02-12T10:00:00Z",
  "duration_minutes": 30
}
```

---

## 6. Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2026-02-10T14:00:00Z",
  "path": "/api/v1/crm/customers"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `CONFLICT` | 409 | Duplicate customer (email exists) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

## Rate Limits

- **Standard:** 100 requests/minute per user
- **Bulk Operations:** 10 requests/minute
- **Exports:** 5 requests/hour

---

## Webhooks

Subscribe to CRM events:

```http
POST /api/v1/crm/webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks/crm",
  "events": ["customer.created", "deal.won", "deal.lost"],
  "secret": "your_webhook_secret"
}
```

**Event Payload:**
```json
{
  "event": "deal.won",
  "timestamp": "2026-02-10T14:00:00Z",
  "data": {
    "deal_id": "deal_123abc",
    "value": 48000,
    "customer_id": "cust_abc123"
  }
}
```

---

**Related Documentation:**
- [CRM_SECURITY.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/security/CRM_SECURITY.md) - Security controls
- [MODULE_CRM.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/modules/MODULE_CRM.md) - Feature documentation
- [API_REFERENCE_COMPLETE.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/api/API_REFERENCE_COMPLETE.md) - Full API reference

**Last Updated:** February 2026
