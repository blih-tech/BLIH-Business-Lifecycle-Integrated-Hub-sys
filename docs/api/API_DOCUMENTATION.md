# BLIH API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Core Platform API](#core-platform-api)
4. [HR Module API](#hr-module-api)
5. [CRM Module API](#crm-module-api)
6. [Projects Module API](#projects-module-api)
7. [Finance Module API](#finance-module-api)
8. [Brain Module API](#brain-module-api)
9. [Compliance Module API](#compliance-module-api)
10. [RAG Service API](#rag-service-api)
11. [Error Handling](#error-handling)
12. [Pagination & Filtering](#pagination--filtering)

---

## Overview

### Base URL
```
Development: http://localhost:4000/api
Production: https://api.blih.company.com/api
```

### API Versioning
Current version: `v1`
All endpoints are prefixed with `/api/v1`

### Content Type
All requests and responses use JSON:
```
Content-Type: application/json
```

### Rate Limiting
- Standard endpoints: 100 requests/minute
- RAG queries: 20 requests/minute
- Batch operations: 10 requests/minute

---

## Authentication

### Authentication Flow
BLIH uses JWT tokens with Keycloak as the identity provider.

### Login
```http
POST /api/v1/auth/login
```

**Request:**
```json
{
  "username": "john.doe@company.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900,
    "tokenType": "Bearer",
    "user": {
      "id": "user-uuid",
      "email": "john.doe@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["HR_MANAGER", "EMPLOYEE"],
      "permissions": [
        "HR:employee:view",
        "HR:employee:create",
        "CRM:deal:view"
      ]
    }
  }
}
```

### Refresh Token
```http
POST /api/v1/auth/refresh
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 900
  }
}
```

### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Current User
```http
GET /api/v1/auth/me
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "john.doe@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "department": "Engineering",
    "roles": ["HR_MANAGER", "EMPLOYEE"],
    "permissions": ["HR:employee:view", "HR:employee:create"]
  }
}
```

---

## Core Platform API

### Audit Logs

#### List Audit Logs
```http
GET /api/v1/audit-logs
Authorization: Bearer {access_token}
Permission Required: ADMIN:audit:view or audit log owner
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `module` | string | Filter by module (HR, CRM, etc.) |
| `action` | string | Filter by action type |
| `userId` | string | Filter by user |
| `startDate` | ISO date | Start date range |
| `endDate` | ISO date | End date range |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "audit-uuid",
        "timestamp": "2024-01-15T10:30:00Z",
        "userId": "user-uuid",
        "userEmail": "john.doe@company.com",
        "action": "employee.create",
        "module": "HR",
        "resourceId": "emp-001",
        "ipAddress": "192.168.1.100",
        "changes": {
          "before": null,
          "after": { "employeeId": "EMP-001", "name": "Jane Smith" }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

#### Export Audit Logs
```http
POST /api/v1/audit-logs/export
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: ADMIN:audit:export
```

**Request:**
```json
{
  "format": "pdf", // or "csv", "xlsx"
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "modules": ["HR", "CRM"],
  "userId": "user-uuid" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://api.blih.company.com/api/v1/downloads/audit-export-uuid.pdf",
    "expiresAt": "2024-01-15T11:30:00Z"
  }
}
```

### Roles & Permissions

#### List Permissions
```http
GET /api/v1/permissions
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "code": "HR:employee:view", "name": "View Employees", "module": "HR" },
    { "code": "HR:employee:create", "name": "Create Employee", "module": "HR" },
    { "code": "CRM:deal:view", "name": "View Deals", "module": "CRM" }
  ]
}
```

#### List Roles
```http
GET /api/v1/roles
Authorization: Bearer {access_token}
Permission Required: ADMIN:roles:view
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "role-uuid",
      "name": "HR Manager",
      "description": "Manages HR operations",
      "permissions": ["HR:employee:view", "HR:employee:create", "HR:employee:edit"],
      "userCount": 5
    }
  ]
}
```

#### Create Role
```http
POST /api/v1/roles
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: ADMIN:roles:create
```

**Request:**
```json
{
  "name": "Finance Officer",
  "description": "Manages financial operations",
  "permissions": ["FINANCE:invoice:view", "FINANCE:invoice:create", "FINANCE:payroll:process"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "role-uuid",
    "name": "Finance Officer",
    "permissions": ["FINANCE:invoice:view", "FINANCE:invoice:create", "FINANCE:payroll:process"],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Notifications

#### List Notifications
```http
GET /api/v1/notifications
Authorization: Bearer {access_token}
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `unreadOnly` | boolean | Show only unread notifications |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "notif-uuid",
        "title": "New Employee Hired",
        "message": "Jane Smith has been hired as Senior Developer",
        "type": "info",
        "read": false,
        "createdAt": "2024-01-15T10:30:00Z",
        "link": "/hr/employees/emp-002"
      }
    ],
    "unreadCount": 5,
    "pagination": { "page": 1, "limit": 20, "total": 15 }
  }
}
```

#### Mark Notification as Read
```http
PUT /api/v1/notifications/{id}/read
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": { "id": "notif-uuid", "read": true }
}
```

#### Mark All as Read
```http
PUT /api/v1/notifications/read-all
Authorization: Bearer {access_token}
```

---

## HR Module API

### Employees

#### List Employees
```http
GET /api/v1/hr/employees
Authorization: Bearer {access_token}
Permission Required: HR:employee:view
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | active, inactive, terminated |
| `department` | string | Filter by department |
| `search` | string | Search by name, email, or employee ID |
| `page` | number | Page number |
| `limit` | number | Items per page |
| `sortBy` | string | Sort field (default: createdAt) |
| `sortOrder` | string | asc or desc (default: desc) |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "emp-uuid",
        "employeeId": "EMP-001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@company.com",
        "department": "Engineering",
        "position": "Senior Developer",
        "status": "active",
        "hireDate": "2023-06-01",
        "managerId": "emp-manager-uuid",
        "contractType": "full-time",
        "avatar": "https://api.blih.company.com/files/avatar-uuid.jpg",
        "createdAt": "2023-06-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 50 }
  }
}
```

#### Get Employee
```http
GET /api/v1/hr/employees/{id}
Authorization: Bearer {access_token}
Permission Required: HR:employee:view
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "emp-uuid",
    "employeeId": "EMP-001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "phone": "+1-555-0123",
    "department": "Engineering",
    "position": "Senior Developer",
    "status": "active",
    "hireDate": "2023-06-01",
    "managerId": "emp-manager-uuid",
    "contractType": "full-time",
    "salary": { "amount": 8000, "currency": "USD", "period": "monthly" },
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "country": "USA"
    },
    "documents": [
      { "id": "doc-uuid", "name": "Contract.pdf", "type": "contract", "uploadedAt": "2023-06-01" }
    ],
    "createdAt": "2023-06-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Create Employee
```http
POST /api/v1/hr/employees
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: HR:employee:create
```

**Request:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@company.com",
  "phone": "+1-555-0124",
  "department": "Engineering",
  "position": "Developer",
  "contractType": "full-time",
  "hireDate": "2024-01-15",
  "managerId": "emp-manager-uuid",
  "salary": { "amount": 7000, "currency": "USD", "period": "monthly" },
  "address": {
    "street": "456 Oak Ave",
    "city": "Boston",
    "country": "USA"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "emp-uuid",
    "employeeId": "EMP-002",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@company.com",
    "status": "active",
    "hireDate": "2024-01-15",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Update Employee
```http
PUT /api/v1/hr/employees/{id}
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: HR:employee:edit
```

**Request:**
```json
{
  "department": "Product",
  "position": "Senior Developer",
  "salary": { "amount": 8500, "currency": "USD", "period": "monthly" }
}
```

#### Terminate Employee
```http
POST /api/v1/hr/employees/{id}/terminate
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: HR:employee:delete
```

**Request:**
```json
{
  "terminationDate": "2024-01-15",
  "reason": "resignation",
  "notes": "Employee resigned to pursue other opportunities"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "emp-uuid",
    "status": "terminated",
    "terminationDate": "2024-01-15",
    "terminatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Contracts

#### List Employee Contracts
```http
GET /api/v1/hr/employees/{employeeId}/contracts
Authorization: Bearer {access_token}
Permission Required: HR:employee:view
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "contract-uuid",
      "type": "employment",
      "startDate": "2023-06-01",
      "endDate": null,
      "status": "active",
      "salary": { "amount": 8000, "currency": "USD", "period": "monthly" },
      "documents": [
        { "id": "doc-uuid", "name": "Contract_2023.pdf", "uploadedAt": "2023-06-01" }
      ]
    }
  ]
}
```

#### Create Contract
```http
POST /api/v1/hr/employees/{employeeId}/contracts
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: HR:employee:edit
```

**Request:**
```json
{
  "type": "amendment",
  "startDate": "2024-01-01",
  "salary": { "amount": 9000, "currency": "USD", "period": "monthly" },
  "documents": ["doc-upload-uuid"]
}
```

### Departments

#### List Departments
```http
GET /api/v1/hr/departments
Authorization: Bearer {access_token}
Permission Required: HR:employee:view
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "dept-uuid",
      "name": "Engineering",
      "managerId": "emp-manager-uuid",
      "employeeCount": 15,
      "parentId": null
    },
    {
      "id": "dept-uuid-2",
      "name": "Backend Team",
      "managerId": "emp-lead-uuid",
      "employeeCount": 8,
      "parentId": "dept-uuid"
    }
  ]
}
```

#### Get Organization Chart
```http
GET /api/v1/hr/org-chart
Authorization: Bearer {access_token}
Permission Required: HR:employee:view
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "root",
    "name": "Company",
    "children": [
      {
        "id": "dept-uuid",
        "name": "Engineering",
        "manager": { "id": "emp-uuid", "name": "Tech Lead" },
        "children": [
          {
            "id": "emp-uuid-2",
            "name": "John Doe",
            "position": "Senior Developer",
            "children": []
          }
        ]
      }
    ]
  }
}
```

---

## CRM Module API

### Leads

#### List Leads
```http
GET /api/v1/crm/leads
Authorization: Bearer {access_token}
Permission Required: CRM:lead:view
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | new, contacted, qualified, converted, lost |
| `source` | string | website, referral, event, etc. |
| `assignedTo` | string | User ID |
| `search` | string | Search by name, email, company |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "lead-uuid",
        "firstName": "Alice",
        "lastName": "Johnson",
        "email": "alice@prospect.com",
        "phone": "+1-555-0199",
        "company": "Prospect Inc",
        "source": "website",
        "status": "qualified",
        "assignedTo": { "id": "user-uuid", "name": "Sales Rep" },
        "estimatedValue": 50000,
        "createdAt": "2024-01-10T08:00:00Z",
        "lastContactedAt": "2024-01-14T15:30:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 45 }
  }
}
```

#### Create Lead
```http
POST /api/v1/crm/leads
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: CRM:lead:create
```

**Request:**
```json
{
  "firstName": "Bob",
  "lastName": "Williams",
  "email": "bob@company.com",
  "phone": "+1-555-0200",
  "company": "Tech Corp",
  "source": "referral",
  "assignedTo": "user-uuid",
  "estimatedValue": 75000,
  "notes": "Interested in enterprise package"
}
```

#### Convert Lead to Deal
```http
POST /api/v1/crm/leads/{id}/convert
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: CRM:lead:edit
```

**Request:**
```json
{
  "dealName": "Tech Corp Enterprise License",
  "dealValue": 75000,
  "expectedCloseDate": "2024-03-15",
  "createContact": true,
  "createOrganization": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leadId": "lead-uuid",
    "dealId": "deal-uuid",
    "contactId": "contact-uuid",
    "organizationId": "org-uuid",
    "status": "converted"
  }
}
```

### Deals

#### List Deals
```http
GET /api/v1/crm/deals
Authorization: Bearer {access_token}
Permission Required: CRM:deal:view
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `stage` | string | prospecting, qualification, proposal, negotiation, closed-won, closed-lost |
| `assignedTo` | string | User ID |
| `organizationId` | string | Organization ID |
| `minValue` | number | Minimum deal value |
| `maxValue` | number | Maximum deal value |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "deal-uuid",
        "name": "Tech Corp Enterprise License",
        "value": 75000,
        "currency": "USD",
        "stage": "proposal",
        "probability": 60,
        "expectedCloseDate": "2024-03-15",
        "organization": {
          "id": "org-uuid",
          "name": "Tech Corp",
          "industry": "Technology"
        },
        "contacts": [
          { "id": "contact-uuid", "name": "Bob Williams", "email": "bob@company.com" }
        ],
        "assignedTo": { "id": "user-uuid", "name": "Sales Rep" },
        "activities": [
          { "type": "call", "date": "2024-01-14", "notes": "Discussed requirements" }
        ],
        "createdAt": "2024-01-10T10:00:00Z",
        "updatedAt": "2024-01-14T15:30:00Z"
      }
    ]
  }
}
```

#### Update Deal Stage
```http
PUT /api/v1/crm/deals/{id}/stage
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: CRM:deal:edit
```

**Request:**
```json
{
  "stage": "negotiation",
  "probability": 80,
  "notes": "Client requested discount"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "deal-uuid",
    "previousStage": "proposal",
    "currentStage": "negotiation",
    "probability": 80,
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Mark Deal as Won
```http
POST /api/v1/crm/deals/{id}/won
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: CRM:deal:edit
```

**Request:**
```json
{
  "actualCloseDate": "2024-01-15",
  "finalValue": 70000,
  "notes": "10% discount applied"
}
```

#### Mark Deal as Lost
```http
POST /api/v1/crm/deals/{id}/lost
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: CRM:deal:edit
```

**Request:**
```json
{
  "reason": "budget_constraints",
  "competitor": "CompetitorX",
  "notes": "Client cited budget constraints",
  "lessonLearned": "Should have qualified budget earlier"
}
```

### Pipeline

#### Get Pipeline View
```http
GET /api/v1/crm/pipeline
Authorization: Bearer {access_token}
Permission Required: CRM:deal:view
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stages": [
      {
        "id": "prospecting",
        "name": "Prospecting",
        "order": 1,
        "dealCount": 12,
        "totalValue": 150000,
        "deals": [
          { "id": "deal-1", "name": "Deal A", "value": 25000 }
        ]
      },
      {
        "id": "proposal",
        "name": "Proposal",
        "order": 3,
        "dealCount": 5,
        "totalValue": 200000,
        "deals": []
      }
    ],
    "summary": {
      "totalDeals": 25,
      "totalValue": 750000,
      "weightedValue": 450000
    }
  }
}
```

### Organizations

#### List Organizations
```http
GET /api/v1/crm/organizations
Authorization: Bearer {access_token}
Permission Required: CRM:deal:view
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "org-uuid",
        "name": "Tech Corp",
        "industry": "Technology",
        "size": "50-200",
        "website": "https://techcorp.com",
        "address": {
          "street": "100 Innovation Dr",
          "city": "San Francisco",
          "country": "USA"
        },
        "contacts": [
          { "id": "contact-uuid", "name": "Bob Williams", "title": "CTO" }
        ],
        "deals": [
          { "id": "deal-uuid", "name": "Enterprise License", "value": 75000, "stage": "proposal" }
        ],
        "totalDealValue": 150000,
        "createdAt": "2024-01-10T08:00:00Z"
      }
    ]
  }
}
```

---

## Projects Module API

### Projects

#### List Projects
```http
GET /api/v1/projects
Authorization: Bearer {access_token}
Permission Required: PROJECTS:project:view
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | planning, active, on-hold, completed, cancelled |
| `managerId` | string | Project manager user ID |
| `sourceDealId` | string | Filter by source CRM deal |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "proj-uuid",
        "projectId": "PRJ-001",
        "name": "Tech Corp Implementation",
        "description": "Enterprise software implementation",
        "status": "active",
        "sourceDealId": "deal-uuid",
        "manager": { "id": "user-uuid", "name": "Project Manager" },
        "startDate": "2024-01-15",
        "endDate": "2024-06-15",
        "budget": 75000,
        "progress": 25,
        "taskStats": { "total": 20, "completed": 5, "inProgress": 10 },
        "team": [
          { "id": "emp-uuid", "name": "John Doe", "role": "Developer" }
        ],
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

#### Create Project
```http
POST /api/v1/projects
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: PROJECTS:project:create
```

**Request:**
```json
{
  "name": "Tech Corp Implementation",
  "description": "Enterprise software implementation",
  "managerId": "user-uuid",
  "startDate": "2024-01-15",
  "endDate": "2024-06-15",
  "budget": 75000,
  "team": ["emp-uuid-1", "emp-uuid-2"],
  "sourceDealId": "deal-uuid"
}
```

#### Update Project Status
```http
PUT /api/v1/projects/{id}/status
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: PROJECTS:project:edit
```

**Request:**
```json
{
  "status": "completed",
  "actualEndDate": "2024-06-10",
  "finalBudget": 72000,
  "lessonsLearned": "Good communication with client"
}
```

### Tasks

#### List Project Tasks
```http
GET /api/v1/projects/{projectId}/tasks
Authorization: Bearer {access_token}
Permission Required: PROJECTS:project:view
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task-uuid",
      "title": "Setup development environment",
      "description": "Configure servers and databases",
      "status": "done",
      "priority": "high",
      "assignee": { "id": "emp-uuid", "name": "John Doe" },
      "dueDate": "2024-01-20",
      "estimatedHours": 8,
      "actualHours": 6,
      "completedAt": "2024-01-18T16:00:00Z",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### Create Task
```http
POST /api/v1/projects/{projectId}/tasks
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: PROJECTS:project:edit
```

**Request:**
```json
{
  "title": "Implement authentication",
  "description": "Setup Keycloak integration",
  "status": "todo",
  "priority": "high",
  "assigneeId": "emp-uuid",
  "dueDate": "2024-02-01",
  "estimatedHours": 16
}
```

#### Update Task Status
```http
PUT /api/v1/tasks/{id}/status
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: PROJECTS:project:edit
```

**Request:**
```json
{
  "status": "done",
  "actualHours": 14,
  "notes": "Completed with minor issues"
}
```

### Time Tracking

#### Log Time
```http
POST /api/v1/tasks/{taskId}/time
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: PROJECTS:project:edit
```

**Request:**
```json
{
  "date": "2024-01-15",
  "hours": 8,
  "description": "Implemented user authentication",
  "billable": true
}
```

#### Get Time Report
```http
GET /api/v1/projects/{projectId}/time-report
Authorization: Bearer {access_token}
Permission Required: PROJECTS:project:view
```

**Query Parameters:**
- `startDate`: Start of reporting period
- `endDate`: End of reporting period

**Response:**
```json
{
  "success": true,
  "data": {
    "totalHours": 120,
    "billableHours": 100,
    "nonBillableHours": 20,
    "byEmployee": [
      { "employeeId": "emp-uuid", "name": "John Doe", "hours": 60 }
    ],
    "byTask": [
      { "taskId": "task-uuid", "title": "Setup environment", "hours": 20 }
    ]
  }
}
```

---

## Finance Module API

### Accounts (Chart of Accounts)

#### List Accounts
```http
GET /api/v1/finance/accounts
Authorization: Bearer {access_token}
Permission Required: FINANCE:account:view
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "acc-uuid",
      "code": "1000",
      "name": "Cash and Bank",
      "type": "asset",
      "category": "current_asset",
      "balance": 150000.00,
      "parentId": null,
      "isActive": true
    },
    {
      "id": "acc-uuid-2",
      "code": "4000",
      "name": "Sales Revenue",
      "type": "revenue",
      "category": "operating_revenue",
      "balance": 500000.00,
      "parentId": null,
      "isActive": true
    }
  ]
}
```

### Transactions

#### List Transactions
```http
GET /api/v1/finance/transactions
Authorization: Bearer {access_token}
Permission Required: FINANCE:transaction:view
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `accountId` | string | Filter by account |
| `startDate` | date | Start date |
| `endDate` | date | End date |
| `reference` | string | Search by reference |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "txn-uuid",
        "date": "2024-01-15",
        "description": "Invoice payment - Tech Corp",
        "reference": "INV-001",
        "debitAccount": { "id": "acc-1000", "name": "Cash", "code": "1000" },
        "creditAccount": { "id": "acc-1200", "name": "Accounts Receivable", "code": "1200" },
        "amount": 70000.00,
        "currency": "USD",
        "sourceModule": "FINANCE",
        "sourceId": "inv-uuid",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### Create Journal Entry
```http
POST /api/v1/finance/transactions
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: FINANCE:transaction:create
```

**Request:**
```json
{
  "date": "2024-01-15",
  "description": "Office supplies purchase",
  "reference": "PO-001",
  "entries": [
    { "accountId": "acc-5100", "type": "debit", "amount": 500.00 },
    { "accountId": "acc-1000", "type": "credit", "amount": 500.00 }
  ],
  "attachments": ["doc-uuid"]
}
```

### Invoices

#### List Invoices
```http
GET /api/v1/finance/invoices
Authorization: Bearer {access_token}
Permission Required: FINANCE:invoice:view
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | draft, sent, paid, overdue, cancelled |
| `customerId` | string | Organization ID |
| `startDate` | date | Issue date from |
| `endDate` | date | Issue date to |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "inv-uuid",
        "invoiceNumber": "INV-001",
        "customer": {
          "id": "org-uuid",
          "name": "Tech Corp",
          "address": { ... }
        },
        "issueDate": "2024-01-15",
        "dueDate": "2024-02-15",
        "status": "sent",
        "lineItems": [
          {
            "description": "Enterprise License",
            "quantity": 1,
            "unitPrice": 70000.00,
            "amount": 70000.00
          }
        ],
        "subtotal": 70000.00,
        "taxRate": 0,
        "taxAmount": 0,
        "total": 70000.00,
        "amountPaid": 0,
        "amountDue": 70000.00,
        "sourceDealId": "deal-uuid",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

#### Create Invoice
```http
POST /api/v1/finance/invoices
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: FINANCE:invoice:create
```

**Request:**
```json
{
  "customerId": "org-uuid",
  "issueDate": "2024-01-15",
  "dueDate": "2024-02-15",
  "lineItems": [
    {
      "description": "Enterprise License",
      "quantity": 1,
      "unitPrice": 70000.00
    }
  ],
  "taxRate": 0,
  "notes": "Payment terms: Net 30",
  "sourceDealId": "deal-uuid"
}
```

#### Record Payment
```http
POST /api/v1/finance/invoices/{id}/payments
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: FINANCE:invoice:edit
```

**Request:**
```json
{
  "amount": 70000.00,
  "paymentDate": "2024-01-20",
  "paymentMethod": "bank_transfer",
  "reference": "WIRE-12345",
  "notes": "Full payment received"
}
```

### Payroll

#### Process Payroll
```http
POST /api/v1/finance/payroll
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: FINANCE:payroll:process
```

**Request:**
```json
{
  "periodStart": "2024-01-01",
  "periodEnd": "2024-01-31",
  "payDate": "2024-02-05",
  "employees": ["emp-uuid-1", "emp-uuid-2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payroll-uuid",
    "periodStart": "2024-01-01",
    "periodEnd": "2024-01-31",
    "payDate": "2024-02-05",
    "status": "processing",
    "summary": {
      "employeeCount": 2,
      "grossTotal": 16000.00,
      "deductionsTotal": 3200.00,
      "netTotal": 12800.00
    },
    "employees": [
      {
        "employeeId": "emp-uuid",
        "name": "John Doe",
        "grossSalary": 8000.00,
        "deductions": 1600.00,
        "netSalary": 6400.00
      }
    ]
  }
}
```

### Reports

#### Profit & Loss Report
```http
GET /api/v1/finance/reports/pnl
Authorization: Bearer {access_token}
Permission Required: FINANCE:report:view
```

**Query Parameters:**
- `startDate`: Report period start
- `endDate`: Report period end

**Response:**
```json
{
  "success": true,
  "data": {
    "period": { "start": "2024-01-01", "end": "2024-01-31" },
    "revenue": {
      "total": 500000.00,
      "breakdown": [
        { "account": "Sales Revenue", "amount": 500000.00 }
      ]
    },
    "expenses": {
      "total": 350000.00,
      "breakdown": [
        { "account": "Salaries", "amount": 300000.00 },
        { "account": "Office Expenses", "amount": 50000.00 }
      ]
    },
    "netIncome": 150000.00
  }
}
```

---

## Brain Module API

### Policies

#### List Policies
```http
GET /api/v1/brain/policies
Authorization: Bearer {access_token}
Permission Required: BRAIN:policy:view
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `status` | string | draft, active, archived |
| `search` | string | Search by title or content |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "policy-uuid",
        "title": "Remote Work Policy",
        "category": "HR",
        "version": "2.0",
        "content": "...",
        "status": "active",
        "effectiveDate": "2024-01-01",
        "reviewDate": "2024-12-31",
        "owner": { "id": "user-uuid", "name": "HR Manager" },
        "attachments": [
          { "id": "doc-uuid", "name": "Remote_Work_Guide.pdf" }
        ],
        "createdAt": "2023-12-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### Create Policy
```http
POST /api/v1/brain/policies
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: BRAIN:policy:create
```

**Request:**
```json
{
  "title": "Data Security Policy",
  "category": "IT",
  "content": "...",
  "effectiveDate": "2024-02-01",
  "ownerId": "user-uuid",
  "attachments": ["doc-upload-uuid"]
}
```

#### Search Knowledge Base
```http
GET /api/v1/brain/search
Authorization: Bearer {access_token}
Permission Required: BRAIN:policy:view
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query (required) |
| `type` | string | policies, decisions, lessons, all |
| `category` | string | Filter by category |

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "policy-uuid",
        "type": "policy",
        "title": "Remote Work Policy",
        "excerpt": "...employees may work remotely up to 3 days per week...",
        "relevance": 0.95
      }
    ]
  }
}
```

### Decisions

#### Log Decision
```http
POST /api/v1/brain/decisions
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: BRAIN:decision:create
```

**Request:**
```json
{
  "title": "Adopt NestJS Framework",
  "description": "Decision to use NestJS for backend development",
  "context": "Evaluated Express, Fastify, and NestJS",
  "decision": "Choose NestJS",
  "rationale": "Best TypeScript support and modular architecture",
  "consequences": ["Learning curve for team", "Better long-term maintainability"],
  "decisionMakerId": "user-uuid",
  "stakeholders": ["user-uuid-1", "user-uuid-2"],
  "relatedTo": {
    "module": "TECHNOLOGY",
    "resourceId": "tech-decision-001"
  }
}
```

### Document Management

#### Upload Document for RAG
```http
POST /api/v1/brain/documents
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
Permission Required: BRAIN:document:upload
```

**Request:**
```
file: <binary>
metadata: {
  "title": "Employee Handbook",
  "department": "HR",
  "classification": "internal"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc-uuid",
    "title": "Employee Handbook",
    "status": "processing",
    "chunks": 0,
    "estimatedProcessingTime": "2 minutes"
  }
}
```

#### Get Document Processing Status
```http
GET /api/v1/brain/documents/{id}/status
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc-uuid",
    "status": "completed",
    "chunks": 45,
    "indexed": true,
    "vectorCount": 45,
    "completedAt": "2024-01-15T10:32:00Z"
  }
}
```

---

## Compliance Module API

### Risk Register

#### List Risks
```http
GET /api/v1/compliance/risks
Authorization: Bearer {access_token}
Permission Required: COMPLIANCE:risk:view
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | strategic, operational, financial, compliance, safety |
| `status` | string | identified, assessed, mitigating, accepted, closed |
| `ownerId` | string | Risk owner user ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "risk-uuid",
        "riskId": "RISK-001",
        "description": "Key employee departure",
        "category": "operational",
        "probability": "medium",
        "impact": "high",
        "riskScore": 6,
        "owner": { "id": "user-uuid", "name": "HR Manager" },
        "mitigationPlan": "Cross-training program",
        "status": "mitigating",
        "reviewDate": "2024-03-15",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

#### Create Risk
```http
POST /api/v1/compliance/risks
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: COMPLIANCE:risk:create
```

**Request:**
```json
{
  "description": "Data breach due to phishing",
  "category": "compliance",
  "probability": "low",
  "impact": "critical",
  "ownerId": "user-uuid",
  "mitigationPlan": "Security training, email filtering",
  "reviewDate": "2024-03-15"
}
```

### CAPA (Corrective/Preventive Actions)

#### List CAPAs
```http
GET /api/v1/compliance/capas
Authorization: Bearer {access_token}
Permission Required: COMPLIANCE:capa:view
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | corrective, preventive |
| `status` | string | open, in-progress, implemented, verified, closed |
| `source` | string | audit, incident, complaint, etc. |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "capa-uuid",
        "capaId": "CAPA-001",
        "type": "corrective",
        "source": "audit",
        "description": "Missing backup verification",
        "rootCause": "No procedure for backup testing",
        "correctiveAction": "Implement weekly backup restore tests",
        "preventiveAction": "Add backup testing to onboarding checklist",
        "responsible": { "id": "user-uuid", "name": "IT Manager" },
        "dueDate": "2024-02-15",
        "status": "in-progress",
        "effectiveness": null,
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

#### Update CAPA Status
```http
PUT /api/v1/compliance/capas/{id}/status
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: COMPLIANCE:capa:edit
```

**Request:**
```json
{
  "status": "implemented",
  "completionDate": "2024-02-10",
  "notes": "Backup testing procedure implemented"
}
```

### Management Reviews

#### List Reviews
```http
GET /api/v1/compliance/reviews
Authorization: Bearer {access_token}
Permission Required: COMPLIANCE:review:view
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "review-uuid",
        "reviewDate": "2024-01-15",
        "attendees": [
          { "id": "user-uuid", "name": "CEO" },
          { "id": "user-uuid-2", "name": "COO" }
        ],
        "agenda": ["Q4 Performance", "ISO Audit Results", "Strategic Planning"],
        "inputs": {
          "auditResults": "No major findings",
          "customerFeedback": "Satisfaction at 85%",
          "processPerformance": "On target for all KPIs"
        },
        "decisions": ["Expand engineering team", "Implement new CRM module"],
        "actionItems": [
          { "item": "Hire 3 developers", "owner": "HR Manager", "dueDate": "2024-03-01" }
        ],
        "minutes": "Detailed meeting minutes...",
        "createdAt": "2024-01-15T14:00:00Z"
      }
    ]
  }
}
```

### Compliance Evidence

#### Export Evidence
```http
POST /api/v1/compliance/evidence
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: COMPLIANCE:evidence:export
```

**Request:**
```json
{
  "standard": "ISO9001", // or "ISO14001", "ISO45001", "ALL"
  "startDate": "2023-01-01",
  "endDate": "2023-12-31",
  "format": "pdf",
  "sections": ["policies", "audit_logs", "capa", "reviews"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://api.blih.company.com/api/v1/downloads/evidence-uuid.pdf",
    "expiresAt": "2024-01-16T10:30:00Z",
    "fileSize": 5242880
  }
}
```

---

## RAG Service API

### Document Ingestion

#### Ingest Document
```http
POST /api/v1/rag/ingest
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
Permission Required: BRAIN:document:upload
```

**Request:**
```
file: <binary>
options: {
  "chunkSize": 1000,
  "chunkOverlap": 200,
  "department": "HR",
  "classification": "internal",
  "indexImmediately": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "doc-uuid",
    "filename": "Employee_Handbook.pdf",
    "status": "processing",
    "estimatedChunks": 45,
    "estimatedTime": "2 minutes",
    "webhookUrl": "https://api.blih.company.com/api/v1/rag/webhooks/ingest-complete"
  }
}
```

### Query

#### Search Documents
```http
POST /api/v1/rag/query
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: BRAIN:chatbot:use
```

**Request:**
```json
{
  "query": "What is the remote work policy?",
  "filters": {
    "department": "HR",
    "classification": ["public", "internal"]
  },
  "topK": 5,
  "includeMetadata": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "What is the remote work policy?",
    "results": [
      {
        "documentId": "doc-uuid",
        "chunkId": "chunk-1",
        "content": "Employees may work remotely up to 3 days per week...",
        "metadata": {
          "title": "Remote Work Policy",
          "department": "HR",
          "page": 5
        },
        "score": 0.95,
        "source": "vector_search"
      }
    ],
    "totalResults": 5,
    "processingTime": 150
  }
}
```

#### Chat with AI
```http
POST /api/v1/rag/chat
Authorization: Bearer {access_token}
Content-Type: application/json
Permission Required: BRAIN:chatbot:use
```

**Request:**
```json
{
  "message": "Explain the vacation policy",
  "conversationId": "conv-uuid", // optional, for continuing chat
  "context": {
    "employeeId": "emp-uuid" // for personalized responses
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversationId": "conv-uuid",
    "message": "According to the Employee Handbook...",
    "citations": [
      {
        "documentId": "doc-uuid",
        "title": "Employee Handbook",
        "excerpt": "Employees are entitled to 20 vacation days...",
        "page": 12
      }
    ],
    "processingTime": 2500,
    "model": "llama3:8b",
    "confidence": 0.92
  }
}
```

### Document Management

#### List Indexed Documents
```http
GET /api/v1/rag/documents
Authorization: Bearer {access_token}
Permission Required: BRAIN:document:view
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | processing, indexed, failed |
| `department` | string | Filter by department |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "doc-uuid",
        "title": "Employee Handbook",
        "filename": "Employee_Handbook.pdf",
        "status": "indexed",
        "chunks": 45,
        "department": "HR",
        "classification": "internal",
        "indexedAt": "2024-01-15T10:32:00Z",
        "lastQueriedAt": "2024-01-15T14:00:00Z",
        "queryCount": 15
      }
    ]
  }
}
```

#### Delete Document
```http
DELETE /api/v1/rag/documents/{id}
Authorization: Bearer {access_token}
Permission Required: BRAIN:document:delete
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc-uuid",
    "deleted": true,
    "vectorsRemoved": 45
  }
}
```

### System Status

#### Get RAG Service Status
```http
GET /api/v1/rag/status
Authorization: Bearer {access_token}
Permission Required: BRAIN:chatbot:use
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "models": {
      "llm": "llama3:8b",
      "embedding": "all-MiniLM-L6-v2"
    },
    "collections": {
      "brain_documents": {
        "vectors": 1250,
        "documents": 50
      }
    },
    "performance": {
      "averageQueryTime": 1200,
      "averageEmbeddingTime": 80
    }
  }
}
```

---

## Error Handling

### Response Format
All API responses follow a standard format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req-uuid"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALID001",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req-uuid"
  }
}
```

### HTTP Status Codes
| Status | Meaning | Usage |
|--------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal error |
| 504 | Gateway Timeout | RAG query timeout |

### Error Codes Reference

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH001` | Invalid credentials | 401 |
| `AUTH002` | Token expired | 401 |
| `AUTH003` | Insufficient permissions | 403 |
| `VALID001` | Validation failed | 400 |
| `NOTFOUND001` | Resource not found | 404 |
| `CONFLICT001` | Resource already exists | 409 |
| `RATE001` | Rate limit exceeded | 429 |
| `SERVER001` | Internal server error | 500 |
| `RAG001` | LLM timeout | 504 |
| `RAG002` | No relevant documents | 200 |
| `DB001` | Database connection error | 500 |
| `FILE001` | File upload error | 400 |

---

## Pagination & Filtering

### Pagination
All list endpoints support pagination:

**Query Parameters:**
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | number | 1 | - | Page number |
| `limit` | number | 20 | 100 | Items per page |

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Sorting
| Parameter | Type | Description |
|-----------|------|-------------|
| `sortBy` | string | Field to sort by |
| `sortOrder` | string | `asc` or `desc` |

Example: `GET /api/v1/hr/employees?sortBy=lastName&sortOrder=asc`

### Filtering
Common filter patterns:

**Date Range:**
```
GET /api/v1/audit-logs?startDate=2024-01-01&endDate=2024-01-31
```

**Status Filter:**
```
GET /api/v1/crm/deals?status=proposal&status=negotiation
```

**Search:**
```
GET /api/v1/hr/employees?search=john
```

**Multiple Values:**
```
GET /api/v1/crm/deals?stage=proposal,negotiation
```

### Field Selection
Use `fields` parameter to limit returned fields:
```
GET /api/v1/hr/employees?fields=id,firstName,lastName,email
```

### Cursor-Based Pagination (for large datasets)
For audit logs and time-series data:

**Request:**
```
GET /api/v1/audit-logs?cursor=eyJpZCI6Inh5eiJ9&limit=100
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "nextCursor": "eyJpZCI6ImFiYyJ9",
      "hasMore": true
    }
  }
}
```

---

*API Version: 1.0*  
*Last Updated: February 2026*
