# BLIH Core Platform - API Documentation

**Purpose:** REST/GraphQL API endpoints for Core Platform services  
**Audience:** Frontend Developers, Integration Partners, System Architects  
**Version:** 1.0 | February 2026  
**Base URL:** `https://your-domain.com/api/v1/core`

---

## Table of Contents
1. [Authentication & Authorization](#1-authentication--authorization)
2. [Common Response Formats](#2-common-response-formats)
3. [Error Handling](#3-error-handling)
4. [Rate Limiting](#4-rate-limiting)
5. [Identity & Access Management](#5-identity--access-management)
6. [User Management](#6-user-management)
7. [Role & Permission Management](#7-role--permission-management)
8. [Organization Management](#8-organization-management)
9. [Audit & Logging](#9-audit--logging)
10. [Notifications](#10-notifications)
11. [System Configuration](#11-system-configuration)
12. [Webhooks](#12-webhooks)
13. [Health & Monitoring](#13-health--monitoring)

---

## 1. Authentication & Authorization

### 1.1 Authentication Methods

| Method | Use Case | Security Level |
|--------|-----------|----------------|
| **JWT Bearer Token** | API calls, mobile apps | High |
| **OAuth 2.0** | Third-party integrations | High |
| **API Key** | Service-to-service | Medium |
| **Session Cookie** | Web application | High |

### 1.2 JWT Token Structure

```json
{
  "sub": "user-uuid",
  "email": "user@company.com",
  "roles": ["HR_MANAGER", "EMPLOYEE"],
  "permissions": [
    "core:user:view",
    "core:user:update",
    "hr:employee:view"
  ],
  "orgId": "org-uuid",
  "sessionId": "session-uuid",
  "iat": 1640991600,
  "exp": 1640995200,
  "iss": "blih-core",
  "aud": "blih-api"
}
```

### 1.3 OAuth 2.0 Flow

```javascript
// 1. Authorization Request
GET /oauth/authorize?
  response_type=code&
  client_id=your-client-id&
  redirect_uri=https://your-app.com/callback&
  scope=core:user:read core:user:write&
  state=random-string

// 2. Exchange Code for Token
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=authorization-code&
client_id=your-client-id&
client_secret=your-client-secret&
redirect_uri=https://your-app.com/callback

// 3. Token Response
{
  "access_token": "jwt-access-token",
  "refresh_token": "jwt-refresh-token",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "core:user:read core:user:write"
}
```

---

## 2. Common Response Formats

### 2.1 Success Response

```json
{
  "success": true,
  "data": {
    // Response data varies by endpoint
  },
  "meta": {
    "timestamp": "2026-02-15T10:30:00Z",
    "requestId": "req-uuid",
    "version": "1.0",
    "executionTime": 125 // milliseconds
  }
}
```

### 2.2 Paginated Response

```json
{
  "success": true,
  "data": [
    // Array of items
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-02-15T10:30:00Z",
    "requestId": "req-uuid"
  }
}
```

### 2.3 Validation Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "code": "INVALID_FORMAT",
        "message": "Email format is invalid"
      },
      {
        "field": "password",
        "code": "MIN_LENGTH",
        "message": "Password must be at least 12 characters"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-02-15T10:30:00Z",
    "requestId": "req-uuid"
  }
}
```

---

## 3. Error Handling

### 3.1 Error Codes

| Code | HTTP Status | Description |
|-------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or expired authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `CONFLICT` | 409 | Resource conflict (duplicate) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### 3.2 Retry Strategy

```javascript
const retryConfig = {
  maxRetries: 3,
  retryDelay: (attempt) => Math.pow(2, attempt) * 1000, // Exponential backoff
  retryCondition: (error) => {
    return error.status >= 500 || error.status === 429;
  }
};
```

---

## 4. Rate Limiting

### 4.1 Rate Limits by Endpoint

| Endpoint Category | Limit | Window | Burst |
|------------------|--------|--------|-------|
| Authentication | 5 requests | 1 minute | 10 |
| User Management | 100 requests | 1 minute | 150 |
| Audit Logs | 200 requests | 1 minute | 300 |
| Notifications | 50 requests | 1 minute | 75 |
| Configuration | 20 requests | 1 minute | 30 |

### 4.2 Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

---

## 5. Identity & Access Management

### 5.1 Authentication

#### Login
```http
POST /api/v1/core/auth/login
```

**Request Body:**
```json
{
  "email": "user@company.com",
  "password": "secure-password",
  "mfaCode": "123456", // Optional for MFA
  "rememberMe": false,
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.100",
    "deviceFingerprint": "fp-uuid"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["EMPLOYEE"],
      "permissions": ["core:user:view"],
      "lastLoginAt": "2026-02-14T09:00:00Z"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token",
      "expiresIn": 3600
    },
    "session": {
      "id": "session-uuid",
      "createdAt": "2026-02-15T10:30:00Z",
      "expiresAt": "2026-02-15T18:30:00Z"
    }
  }
}
```

#### Logout
```http
POST /api/v1/core/auth/logout
```

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token",
  "allSessions": false // true to logout all sessions
}
```

#### Refresh Token
```http
POST /api/v1/core/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

### 5.2 Multi-Factor Authentication

#### Enable MFA
```http
POST /api/v1/core/auth/mfa/enable
```

**Request Body:**
```json
{
  "method": "TOTP", // TOTP, SMS, EMAIL
  "phoneNumber": "+251911234567" // Required for SMS
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "secret": "JBSWY3DPEHPK3PXP", // For manual entry
    "backupCodes": [
      "12345678",
      "87654321",
      "11112222"
    ]
  }
}
```

#### Verify MFA Setup
```http
POST /api/v1/core/auth/mfa/verify
```

**Request Body:**
```json
{
  "code": "123456",
  "method": "TOTP"
}
```

---

## 6. User Management

### 6.1 Get Users

```http
GET /api/v1/core/users
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20) |
| search | string | Search by name, email |
| role | string | Filter by role |
| status | string | Filter by status (ACTIVE, INACTIVE, SUSPENDED) |
| department | string | Filter by department |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid",
      "email": "john.doe@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+251911234567",
      "department": {
        "id": "dept-uuid",
        "name": "Engineering"
      },
      "position": "Senior Developer",
      "roles": ["EMPLOYEE"],
      "status": "ACTIVE",
      "createdAt": "2020-01-15T10:30:00Z",
      "lastLoginAt": "2026-02-15T09:00:00Z",
      "mfaEnabled": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### 6.2 Create User

```http
POST /api/v1/core/users
```

**Request Body:**
```json
{
  "email": "new.user@company.com",
  "firstName": "New",
  "lastName": "User",
  "phone": "+251911234568",
  "password": "secure-password",
  "departmentId": "dept-uuid",
  "position": "Developer",
  "roles": ["EMPLOYEE"],
  "sendInvitation": true,
  "temporaryPassword": false
}
```

### 6.3 Update User

```http
PUT /api/v1/core/users/:id
```

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "phone": "+251911234569",
  "departmentId": "dept-uuid-2",
  "position": "Senior Developer"
}
```

### 6.4 Deactivate User

```http
DELETE /api/v1/core/users/:id
```

**Request Body:**
```json
{
  "reason": "Employee termination",
  "effectiveDate": "2026-03-01",
  "transferDataTo": "user-uuid" // Optional
}
```

### 6.5 User Profile

```http
GET /api/v1/core/users/:id/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "basicInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "phone": "+251911234567",
      "photo": "https://cdn.company.com/photos/john.jpg"
    },
    "employment": {
      "employeeId": "EMP1001",
      "department": "Engineering",
      "position": "Senior Developer",
      "manager": {
        "id": "manager-uuid",
        "name": "Jane Smith"
      },
      "joinDate": "2020-01-15"
    },
    "preferences": {
      "language": "en",
      "timezone": "Africa/Addis_Ababa",
      "notifications": {
        "email": true,
        "sms": false,
        "push": true
      }
    },
    "security": {
      "mfaEnabled": true,
      "lastPasswordChange": "2026-01-15",
      "activeSessions": 2,
      "loginHistory": [
        {
          "timestamp": "2026-02-15T09:00:00Z",
          "ipAddress": "192.168.1.100",
          "userAgent": "Mozilla/5.0...",
          "success": true
        }
      ]
    }
  }
}
```

---

## 7. Role & Permission Management

### 7.1 Get Roles

```http
GET /api/v1/core/roles
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "role-uuid",
      "name": "HR_MANAGER",
      "displayName": "HR Manager",
      "description": "Full HR management access",
      "permissions": [
        "hr:employee:view",
        "hr:employee:create",
        "hr:employee:update",
        "hr:leave:approve",
        "hr:performance:review"
      ],
      "isSystem": false,
      "userCount": 5,
      "createdAt": "2020-01-01T00:00:00Z"
    }
  ]
}
```

### 7.2 Create Role

```http
POST /api/v1/core/roles
```

**Request Body:**
```json
{
  "name": "PROJECT_MANAGER",
  "displayName": "Project Manager",
  "description": "Project management access",
  "permissions": [
    "projects:view",
    "projects:create",
    "projects:update",
    "projects:assign_team"
  ],
  "isSystem": false
}
```

### 7.3 Get Permissions

```http
GET /api/v1/core/permissions
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "perm-uuid",
      "name": "hr:employee:view",
      "displayName": "View Employees",
      "description": "View employee information",
      "module": "HR",
      "resource": "employee",
      "action": "view",
      "category": "READ"
    }
  ]
}
```

### 7.4 Assign Role to User

```http
POST /api/v1/core/users/:userId/roles
```

**Request Body:**
```json
{
  "roleId": "role-uuid",
  "assignedBy": "admin-uuid",
  "effectiveDate": "2026-02-15",
  "expirationDate": null // Optional
}
```

---

## 8. Organization Management

### 8.1 Get Organization

```http
GET /api/v1/core/organization
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "org-uuid",
    "name": "Company Ltd",
    "code": "COMPANY",
    "domain": "company.com",
    "timezone": "Africa/Addis_Ababa",
    "currency": "ETB",
    "language": "en",
    "settings": {
      "mfaRequired": true,
      "sessionTimeout": 480,
      "passwordPolicy": {
        "minLength": 12,
        "requireUppercase": true,
        "requireNumbers": true,
        "requireSpecialChars": true
      }
    },
    "statistics": {
      "totalUsers": 150,
      "activeUsers": 142,
      "departments": 8,
      "roles": 15
    }
  }
}
```

### 8.2 Get Departments

```http
GET /api/v1/core/departments
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "dept-uuid",
      "name": "Engineering",
      "code": "ENG",
      "parentId": null,
      "manager": {
        "id": "user-uuid",
        "name": "Jane Smith"
      },
      "userCount": 25,
      "subDepartments": [
        {
          "id": "sub-dept-uuid",
          "name": "Frontend Team",
          "userCount": 8
        }
      ]
    }
  ]
}
```

---

## 9. Audit & Logging

### 9.1 Get Audit Logs

```http
GET /api/v1/core/audit/logs
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| startDate | date | Start date (ISO 8601) |
| endDate | date | End date (ISO 8601) |
| userId | string | Filter by user |
| action | string | Filter by action |
| resource | string | Filter by resource |
| result | string | Filter by result (SUCCESS, FAILURE) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "audit-uuid",
      "timestamp": "2026-02-15T10:30:00Z",
      "userId": "user-uuid",
      "userEmail": "john.doe@company.com",
      "action": "hr.employee.update",
      "resource": "employee/emp-001",
      "resourceId": "emp-001",
      "result": "SUCCESS",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "changes": {
        "before": {
          "position": "Developer"
        },
        "after": {
          "position": "Senior Developer"
        }
      },
      "sessionId": "session-uuid",
      "requestId": "req-uuid"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250
  }
}
```

### 9.2 Export Audit Logs

```http
POST /api/v1/core/audit/export
```

**Request Body:**
```json
{
  "startDate": "2026-02-01",
  "endDate": "2026-02-29",
  "filters": {
    "userId": "user-uuid",
    "action": "hr.employee.*"
  },
  "format": "CSV", // CSV, JSON, PDF
  "includeSensitiveData": false
}
```

---

## 10. Notifications

### 10.1 Get Notifications

```http
GET /api/v1/core/notifications
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| type | string | Filter by type (INFO, WARNING, ERROR) |
| read | boolean | Filter by read status |
| page | integer | Page number |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif-uuid",
      "type": "INFO",
      "title": "Leave Request Approved",
      "message": "Your leave request for Feb 20-22 has been approved",
      "data": {
        "leaveRequestId": "leave-uuid",
        "approver": "Jane Smith"
      },
      "read": false,
      "createdAt": "2026-02-15T10:30:00Z",
      "expiresAt": "2026-03-15T10:30:00Z"
    }
  ],
  "unreadCount": 5,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25
  }
}
```

### 10.2 Mark Notification as Read

```http
PUT /api/v1/core/notifications/:id/read
```

### 10.3 Send Notification

```http
POST /api/v1/core/notifications/send
```

**Request Body:**
```json
{
  "recipients": [
    {
      "userId": "user-uuid",
      "type": "USER"
    },
    {
      "roleId": "role-uuid",
      "type": "ROLE"
    }
  ],
  "notification": {
    "type": "INFO",
    "title": "System Maintenance",
    "message": "System will be down for maintenance",
    "channels": ["EMAIL", "PUSH"],
    "priority": "HIGH",
    "data": {
      "maintenanceWindow": "2026-02-20T02:00:00Z"
    }
  }
}
```

---

## 11. System Configuration

### 11.1 Get System Settings

```http
GET /api/v1/core/settings
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authentication": {
      "mfaRequired": true,
      "sessionTimeout": 480,
      "maxConcurrentSessions": 3,
      "passwordPolicy": {
        "minLength": 12,
        "requireUppercase": true,
        "requireNumbers": true,
        "requireSpecialChars": true,
        "preventReuse": 10
      }
    },
    "notifications": {
      "emailEnabled": true,
      "smsEnabled": true,
      "pushEnabled": true,
      "defaultChannels": ["EMAIL"]
    },
    "security": {
      "ipWhitelist": ["192.168.0.0/16"],
      "rateLimiting": {
        "enabled": true,
        "defaultLimit": 100
      }
    }
  }
}
```

### 11.2 Update System Settings

```http
PUT /api/v1/core/settings
```

**Request Body:**
```json
{
  "authentication": {
    "mfaRequired": true,
    "sessionTimeout": 480
  },
  "notifications": {
    "emailEnabled": true,
    "defaultChannels": ["EMAIL", "PUSH"]
  }
}
```

---

## 12. Webhooks

### 12.1 Get Webhooks

```http
GET /api/v1/core/webhooks
```

### 12.2 Create Webhook

```http
POST /api/v1/core/webhooks
```

**Request Body:**
```json
{
  "name": "User Activity Webhook",
  "url": "https://your-system.com/webhooks/blih",
  "events": [
    "user.created",
    "user.updated",
    "user.deleted",
    "auth.login.success",
    "auth.login.failure"
  ],
  "secret": "your-webhook-secret",
  "active": true,
  "retryPolicy": {
    "maxRetries": 3,
    "retryDelay": 1000
  }
}
```

### 12.3 Webhook Event Payloads

**User Created Event:**
```json
{
  "event": "user.created",
  "timestamp": "2026-02-15T10:30:00Z",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "new.user@company.com",
      "firstName": "New",
      "lastName": "User"
    }
  },
  "context": {
    "createdBy": "admin-uuid",
    "requestId": "req-uuid"
  }
}
```

---

## 13. Health & Monitoring

### 13.1 Health Check

```http
GET /api/v1/core/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "HEALTHY",
    "timestamp": "2026-02-15T10:30:00Z",
    "version": "1.0.0",
    "uptime": 86400,
    "services": {
      "database": {
        "status": "HEALTHY",
        "responseTime": 15
      },
      "cache": {
        "status": "HEALTHY",
        "responseTime": 5
      },
      "queue": {
        "status": "HEALTHY",
        "queueDepth": 25
      }
    },
    "metrics": {
      "activeUsers": 142,
      "requestsPerMinute": 150,
      "errorRate": 0.1
    }
  }
}
```

### 13.2 System Metrics

```http
GET /api/v1/core/metrics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "system": {
      "cpuUsage": 45.2,
      "memoryUsage": 67.8,
      "diskUsage": 23.1,
      "networkIO": {
        "bytesIn": 1024000,
        "bytesOut": 512000
      }
    },
    "application": {
      "activeSessions": 142,
      "requestsPerMinute": 150,
      "averageResponseTime": 125,
      "errorRate": 0.1
    },
    "database": {
      "connections": 25,
      "queryTime": 15,
      "slowQueries": 2
    }
  }
}
```

---

## SDK Examples

### JavaScript/Node.js

```javascript
import { CoreAPI } from '@blih/core-sdk';

const coreApi = new CoreAPI({
  baseURL: 'https://your-domain.com/api/v1/core',
  token: 'your-jwt-token'
});

// User management
const users = await coreApi.users.list({
  role: 'EMPLOYEE',
  status: 'ACTIVE'
});

const newUser = await coreApi.users.create({
  email: 'new.user@company.com',
  firstName: 'New',
  lastName: 'User',
  roles: ['EMPLOYEE']
});

// Authentication
const login = await coreApi.auth.login({
  email: 'user@company.com',
  password: 'password'
});

// Audit logs
const auditLogs = await coreApi.audit.logs({
  startDate: '2026-02-01',
  endDate: '2026-02-29',
  action: 'hr.employee.*'
});
```

### Python

```python
from blih_core_sdk import CoreAPI

core_api = CoreAPI(
    base_url='https://your-domain.com/api/v1/core',
    token='your-jwt-token'
)

# Get user profile
profile = core_api.users.get_profile('user-uuid')

# Create role
role = core_api.roles.create({
    'name': 'CUSTOM_ROLE',
    'permissions': ['hr:employee:view']
})

# Send notification
core_api.notifications.send({
    'recipients': [{'userId': 'user-uuid'}],
    'notification': {
        'type': 'INFO',
        'title': 'Welcome!',
        'message': 'Your account has been created'
    }
})
```

---

## Testing

### Authentication Testing

```bash
# Login and get token
curl -X POST https://your-domain.com/api/v1/core/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@company.com",
    "password": "password"
  }'

# Use token for authenticated request
curl -X GET https://your-domain.com/api/v1/core/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Webhook Testing

```bash
# Test webhook endpoint
curl -X POST https://your-webhook-url.com/webhooks \
  -H "Content-Type: application/json" \
  -H "X-BLIH-Signature: sha256=SIGNATURE" \
  -d '{
    "event": "user.created",
    "timestamp": "2026-02-15T10:30:00Z",
    "data": {...}
  }'
```

---

*Core API Version: 1.0*  
*Last Updated: February 2026*  
*For API support: api-support@blih.com*
