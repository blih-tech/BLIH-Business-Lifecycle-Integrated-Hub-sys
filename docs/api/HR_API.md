# BLIH HR Module - API Documentation

**Purpose:** REST/GraphQL API endpoints for HR module integration  
**Audience:** Frontend Developers, Integration Partners, System Architects  
**Version:** 1.0 | February 2026  
**Base URL:** `https://your-domain.com/api/v1/hr`

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [Common Response Formats](#2-common-response-formats)
3. [Error Handling](#3-error-handling)
4. [Rate Limiting](#4-rate-limiting)
5. [Employee Management](#5-employee-management)
6. [Attendance & Time Tracking](#6-attendance--time-tracking)
7. [Leave Management](#7-leave-management)
8. [Performance & OKRs](#8-performance--okrs)
9. [Recruitment](#9-recruitment)
10. [Onboarding](#10-onboarding)
11. [Training & Development](#11-training--development)
12. [Employee Relations](#12-employee-relations)
13. [Offboarding](#13-offboarding)
14. [Webhooks](#14-webhooks)

---

## 1. Authentication & Authorization

### 1.1 Authentication Pattern

HR API endpoints require authentication through the Core Platform's JWT system unless an endpoint is explicitly documented as public. Public recruitment job applications are the current exception:

```http
Authorization: Bearer <jwt_token>
```

**JWT Structure:**

```json
{
  "sub": "user-uuid",
  "email": "user@company.com",
  "roles": ["HR_MANAGER", "EMPLOYEE"],
  "permissions": ["HR:employee:view", "HR:employee:update"],
  "orgId": "org-uuid",
  "exp": 1640995200,
  "iat": 1640991600
}
```

### 1.2 Authorization Matrix

| Endpoint                 | Required Role         | Required Permissions |
| ------------------------ | --------------------- | -------------------- |
| GET /employees           | EMPLOYEE, MANAGER, HR | HR:employee:view     |
| POST /employees          | HR, ADMIN             | HR:employee:create   |
| PUT /employees/:id       | HR, ADMIN             | HR:employee:update   |
| DELETE /employees/:id    | ADMIN                 | HR:employee:delete   |
| POST /attendance/checkin | EMPLOYEE              | HR:attendance:create |
| GET /attendance/reports  | HR, MANAGER           | HR:attendance:view   |

### 1.3 Permission Format

Permissions follow Core Platform format: `MODULE:RESOURCE:ACTION`

Examples:

- `HR:employee:view` - View employee records
- `HR:leave:approve` - Approve leave requests
- `HR:performance:review` - Conduct performance reviews
- `HR:recruitment:hire` - Make hiring decisions

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
    "version": "1.0"
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

### 2.3 Bulk Operation Response

```json
{
  "success": true,
  "data": {
    "processed": 50,
    "successful": 48,
    "failed": 2,
    "errors": [
      {
        "index": 15,
        "error": "INVALID_EMAIL",
        "message": "Email format is invalid"
      },
      {
        "index": 32,
        "error": "DUPLICATE_EMPLOYEE_ID",
        "message": "Employee ID already exists"
      }
    ]
  }
}
```

---

## 3. Error Handling

### 3.1 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "salary",
        "message": "Salary must be greater than 0"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-02-15T10:30:00Z",
    "requestId": "req-uuid"
  }
}
```

### 3.2 Common Error Codes

| Code                      | HTTP Status | Description               |
| ------------------------- | ----------- | ------------------------- |
| `UNAUTHORIZED`            | 401         | Invalid or expired JWT    |
| `FORBIDDEN`               | 403         | Insufficient permissions  |
| `NOT_FOUND`               | 404         | Resource not found        |
| `VALIDATION_ERROR`        | 400         | Request validation failed |
| `DUPLICATE_RESOURCE`      | 409         | Resource already exists   |
| `BUSINESS_RULE_VIOLATION` | 422         | Business logic violation  |
| `RATE_LIMIT_EXCEEDED`     | 429         | Too many requests         |
| `INTERNAL_ERROR`          | 500         | Server error              |

---

## 4. Rate Limiting

### 4.1 Rate Limits by Endpoint

| Endpoint Category  | Limit        | Window   |
| ------------------ | ------------ | -------- |
| Authentication     | 5 requests   | 1 minute |
| Employee CRUD      | 100 requests | 1 minute |
| Attendance Actions | 60 requests  | 1 minute |
| Reports            | 20 requests  | 1 minute |
| Bulk Operations    | 10 requests  | 1 minute |

### 4.2 Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 5. Employee Management

### 5.1 Get Employees

```http
GET /api/v1/hr/employees
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20, max: 100) |
| search | string | Search by name, email, employee ID |
| department | string | Filter by department ID |
| status | string | Filter by status (ACTIVE, ON_LEAVE, etc.) |
| employmentType | string | Filter by employment type |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "emp-001",
      "employeeId": "EMP1001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "phone": "+251911234567",
      "department": {
        "id": "dept-001",
        "name": "Engineering"
      },
      "position": "Senior Developer",
      "employmentType": "FULL_TIME",
      "status": "ACTIVE",
      "joinDate": "2020-01-15",
      "manager": {
        "id": "emp-002",
        "name": "Jane Smith"
      },
      "compensation": {
        "baseSalary": 60000,
        "currency": "ETB"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### 5.2 Create Employee

```http
POST /api/v1/hr/employees
```

**Request Body:**

```json
{
  "employeeId": "EMP1002",
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice.johnson@company.com",
  "phone": "+251911234568",
  "departmentId": "dept-001",
  "position": "Developer",
  "employmentType": "FULL_TIME",
  "joinDate": "2026-02-15",
  "managerId": "emp-002",
  "compensation": {
    "baseSalary": 50000,
    "currency": "ETB",
    "bankAccount": {
      "bankName": "Commercial Bank of Ethiopia",
      "accountNumber": "1234567890"
    }
  },
  "workPreferences": {
    "remoteDays": 2,
    "flexibleHours": true
  }
}
```

### 5.3 Update Employee

```http
PUT /api/v1/hr/employees/:id
```

**Request Body:** Same as create, but only include fields to update

### 5.4 Get Employee Profile

```http
GET /api/v1/hr/employees/:id/profile
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
      "employmentType": "FULL_TIME",
      "status": "ACTIVE",
      "joinDate": "2020-01-15",
      "probationEndDate": "2020-04-15"
    },
    "compensation": {
      "baseSalary": 60000,
      "currency": "ETB",
      "payFrequency": "MONTHLY"
    },
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phone": "+251911234568"
    },
    "documents": [
      {
        "type": "ID_CARD",
        "number": "ETH123456",
        "expiryDate": "2028-01-15",
        "status": "VALID"
      }
    ]
  }
}
```

---

## 6. Attendance & Time Tracking

### 6.1 Check In/Out

```http
POST /api/v1/hr/attendance/checkin
POST /api/v1/hr/attendance/checkout
```

**Request Body:**

```json
{
  "eventType": "morning_check_in",
  "method": "wifi",
  "timestamp": "2026-02-15T08:45:00Z",
  "geo": {
    "lat": 9.145,
    "lon": 40.4897,
    "accuracy": 10
  },
  "deviceFingerprint": "fp-uuid",
  "deviceName": "iPhone 13",
  "os": "iOS",
  "browser": "Safari",
  "userAgent": "Mozilla/5.0...",
  "screenResolution": "390x844",
  "timezone": "Africa/Addis_Ababa"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "log": {
      "id": "log-uuid",
      "eventType": "morning_check_in",
      "method": "wifi",
      "timestamp": "2026-02-15T08:45:00Z",
      "status": "on_time"
    },
    "message": "Checked in successfully"
  }
}
```

### 6.2 Get Attendance History

```http
GET /api/v1/hr/attendance/history
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| employeeId | string | Employee ID (optional, defaults to current user) |
| startDate | date | Start date (ISO 8601) |
| endDate | date | End date (ISO 8601) |
| status | string | Filter by status (PRESENT, LATE, ABSENT) |

### 6.3 Get Attendance Configuration

```http
GET /api/v1/hr/attendance/config
```

**Response:**

```json
{
  "success": true,
  "data": {
    "attendanceWindows": [
      {
        "type": "morning_check_in",
        "start": "08:30",
        "end": "09:00",
        "label": "Morning Check-in"
      },
      {
        "type": "lunch_check_out",
        "start": "12:00",
        "end": "13:30",
        "label": "Lunch Break"
      }
    ],
    "graceMinutes": 15,
    "absentThresholdMinutes": 30,
    "enableGeo": true,
    "enableQr": true,
    "timezone": "Africa/Addis_Ababa",
    "ipCidrs": ["192.168.1.0/24", "10.0.0.0/8"]
  }
}
```

---

## 7. Leave Management

### 7.1 Get Leave Balance

```http
GET /api/v1/hr/leave/balance/:employeeId
```

**Response:**

```json
{
  "success": true,
  "data": {
    "ANNUAL": {
      "entitled": 20.0,
      "used": 5.0,
      "pending": 2.0,
      "available": 13.0,
      "nextAccrualDate": "2026-03-01"
    },
    "SICK": {
      "entitled": 10.0,
      "used": 1.0,
      "pending": 0.0,
      "available": 9.0,
      "nextAccrualDate": "2027-01-01"
    }
  }
}
```

### 7.2 Submit Leave Request

```http
POST /api/v1/hr/leave/request
```

**Request Body:**

```json
{
  "leaveType": "ANNUAL",
  "startDate": "2026-03-15",
  "endDate": "2026-03-20",
  "daysRequested": 5,
  "reason": "Family vacation",
  "handover": {
    "delegateId": "emp-003",
    "tasks": ["Project Alpha review", "Client meeting preparation"]
  }
}
```

### 7.3 Approve/Reject Leave

```http
POST /api/v1/hr/leave/:requestId/approve
POST /api/v1/hr/leave/:requestId/reject
```

**Request Body:**

```json
{
  "action": "approve",
  "comments": "Approved. Handover plan looks good.",
  "conditions": ["Complete Project Alpha before leave"]
}
```

---

## 8. Performance & OKRs

### 8.1 Get Performance Reviews

```http
GET /api/v1/hr/performance/reviews
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| employeeId | string | Employee ID |
| period | string | Review period (2024-Q1) |
| status | string | DRAFT, SUBMITTED, APPROVED |

### 8.2 Submit Performance Review

```http
POST /api/v1/hr/performance/reviews
```

**Request Body:**

```json
{
  "employeeId": "emp-001",
  "period": "2024-Q1",
  "selfAssessment": {
    "goalRatings": [
      {
        "goalId": "goal-001",
        "selfRating": 4,
        "evidence": ["Completed project ahead of schedule"]
      }
    ],
    "overallRating": 4,
    "achievements": [
      "Led successful product launch",
      "Mentored 2 junior developers"
    ],
    "developmentNeeds": ["Advanced project management training"]
  }
}
```

### 8.3 Get OKRs

```http
GET /api/v1/hr/okrs
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "okr-001",
      "title": "Q1 2026 Product Development",
      "objective": "Launch v2.0 with key features",
      "keyResults": [
        {
          "id": "kr-001",
          "title": "Complete UI redesign",
          "type": "MILESTONE",
          "currentValue": 3,
          "targetValue": 5,
          "progress": 60
        }
      ],
      "progress": 65,
      "status": "ON_TRACK"
    }
  ]
}
```

---

## 9. Recruitment

### 9.1 Get Job Postings

```http
GET /api/v1/hr/recruitment/jobs
```

### 9.2 Create Job Posting

```http
POST /api/v1/hr/recruitment/jobs
```

**Request Body:**

```json
{
  "title": "Senior Full Stack Developer",
  "department": "Engineering",
  "employmentType": "FULL_TIME",
  "location": "Addis Ababa, Ethiopia",
  "description": "We are looking for...",
  "requirements": ["5+ years experience", "React/Node.js proficiency"],
  "salaryRange": {
    "min": 60000,
    "max": 80000,
    "currency": "ETB"
  },
  "status": "DRAFT"
}
```

### 9.3 Submit Application

```http
POST /api/v1/hr/recruitment/jobs/:id/apply
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Applicant",
  "email": "john.applicant@email.com",
  "phone": "+251911234567",
  "resumeUrl": "https://cdn.company.com/applications/john_resume.pdf",
  "linkedinUrl": "https://linkedin.com/in/john-applicant",
  "coverLetter": "I am interested in this role and would like to be considered."
}
```

---

## 10. Onboarding

### 10.1 Get Onboarding Checklist

```http
GET /api/v1/hr/onboarding/checklist/:employeeId
```

### 10.2 Update Checklist Item

```http
PUT /api/v1/hr/onboarding/checklist/:itemId
```

**Request Body:**

```json
{
  "status": "COMPLETED",
  "notes": "Email account created successfully",
  "completedAt": "2026-02-15T10:30:00Z"
}
```

---

## 11. Training & Development

### 11.1 Get Training Catalog

```http
GET /api/v1/hr/training/catalog
```

### 11.2 Request Training

```http
POST /api/v1/hr/training/request
```

**Request Body:**

```json
{
  "trainingId": "train-001",
  "reason": "Improve React skills for current project",
  "estimatedCost": 5000,
  "currency": "ETB"
}
```

---

## 12. Employee Relations

### 12.1 Submit Recognition

```http
POST /api/v1/hr/relations/recognition
```

**Request Body:**

```json
{
  "recipientId": "emp-002",
  "type": "EXCELLENCE",
  "message": "Great work on the product launch!",
  "values": ["INNOVATION", "TEAMWORK"]
}
```

### 12.2 Report Incident

```http
POST /api/v1/hr/relations/incident
```

---

## 13. Offboarding

### 13.1 Initiate Resignation

```http
POST /api/v1/hr/offboarding/resign
```

**Request Body:**

```json
{
  "lastWorkingDay": "2026-03-31",
  "reason": "CAREER_GROWTH",
  "feedback": "Great experience, moving to new opportunity"
}
```

### 13.2 Get Offboarding Checklist

```http
GET /api/v1/hr/offboarding/checklist/:employeeId
```

---

## 14. Webhooks

### 14.1 Configure Webhook

```http
POST /api/v1/hr/webhooks
```

**Request Body:**

```json
{
  "url": "https://your-system.com/webhooks/hr",
  "events": ["employee.created", "leave.approved", "attendance.checkin"],
  "secret": "your-webhook-secret"
}
```

### 14.2 Webhook Event Payloads

**Employee Created:**

```json
{
  "event": "employee.created",
  "timestamp": "2026-02-15T10:30:00Z",
  "data": {
    "employeeId": "emp-001",
    "name": "John Doe",
    "email": "john.doe@company.com"
  }
}
```

---

## SDK Examples

### JavaScript/Node.js

```javascript
import { HRApi } from '@blih/hr-sdk';

const hrApi = new HRApi({
  baseURL: 'https://your-domain.com/api/v1/hr',
  token: 'your-jwt-token',
});

// Get employees
const employees = await hrApi.employees.list({
  department: 'engineering',
  status: 'ACTIVE',
});

// Check in attendance
await hrApi.attendance.checkin({
  eventType: 'morning_check_in',
  method: 'wifi',
  geo: { lat: 9.145, lon: 40.4897 },
});
```

### Python

```python
from blih_hr_sdk import HRApi

hr_api = HRApi(
    base_url='https://your-domain.com/api/v1/hr',
    token='your-jwt-token'
)

# Get leave balance
balance = hr_api.leave.get_balance(employee_id='emp-001')

# Submit leave request
request = hr_api.leave.submit_request(
    leave_type='ANNUAL',
    start_date='2026-03-15',
    end_date='2026-03-20',
    reason='Family vacation'
)
```

---

_API Version: 1.0_  
_Last Updated: February 2026_  
_For integration support: api-support@blih.com_
