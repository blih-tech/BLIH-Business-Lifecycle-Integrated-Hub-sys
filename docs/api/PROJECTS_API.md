# Projects API Documentation

**Module:** Project Management  
**Version:** 1.0  
**Last Updated:** February 2026  
**Base URL:** `/api/v1/projects`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Projects](#2-projects)
3. [Tasks](#3-tasks)
4. [Time Tracking](#4-time-tracking)
5. [Documents](#5-documents)

---

## 1. Authentication

**Required Permissions:**
- `PROJECTS:read` - View projects
- `PROJECTS:write` - Create/edit projects
- `PROJECTS:manage` - Full project management

---

## 2. Projects

### 2.1 List Projects

```http
GET /api/v1/projects
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | enum | `PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `CANCELLED` |
| `client_id` | string | Filter by client |
| `manager_id` | string | Filter by project manager |

**Response:**
```json
{
  "data": [
    {
      "id": "proj_abc123",
      "name": "Website Redesign",
      "code": "PROJ-2026-001",
      "client": {
        "id": "client_456",
        "name": "Acme Corp"
      },
      "status": "ACTIVE",
      "manager": {
        "id": "user_123",
        "name": "Jane Manager"
      },
      "start_date": "2026-01-15",
      "end_date": "2026-04-15",
      "budget": 50000.00,
      "currency": "USD",
      "progress": 45,
      "team_members": 5,
      "created_at": "2026-01-10T10:00:00Z"
    }
  ]
}
```

### 2.2 Create Project

```http
POST /api/v1/projects
```

**Request Body:**
```json
{
  "name": "Website Redesign",
  "code": "PROJ-2026-001",
  "client_id": "client_456",
  "manager_id": "user_123",
  "start_date": "2026-01-15",
  "end_date": "2026-04-15",
  "budget": 50000.00,
  "currency": "USD",
  "description": "Complete redesign of corporate website",
  "confidentiality_level": "CONFIDENTIAL",
  "nda_required": true
}
```

### 2.3 Add Team Member

```http
POST /api/v1/projects/:id/members
```

**Request Body:**
```json
{
  "user_id": "user_789",
  "role": "DEVELOPER",
  "billable_rate": 125.00,
  "allocation_percent": 50
}
```

---

## 3. Tasks

### 3.1 List Tasks

```http
GET /api/v1/projects/:projectId/tasks
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | enum | `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`, `BLOCKED` |
| `assigned_to` | string | Filter by assignee |
| `priority` | enum | `LOW`, `MEDIUM`, `HIGH`, `URGENT` |

**Response:**
```json
{
  "data": [
    {
      "id": "task_xyz789",
      "title": "Design homepage mockup",
      "description": "Create high-fidelity mockup for homepage",
      "project_id": "proj_abc123",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "assigned_to": {
        "id": "user_456",
        "name": "Bob Designer"
      },
      "estimated_hours": 16,
      "actual_hours": 8,
      "due_date": "2026-02-15",
      "created_at": "2026-02-01T10:00:00Z",
      "updated_at": "2026-02-10T14:00:00Z"
    }
  ]
}
```

### 3.2 Create Task

```http
POST /api/v1/projects/:projectId/tasks
```

**Request Body:**
```json
{
  "title": "Design homepage mockup",
  "description": "Create high-fidelity mockup for homepage",
  "assigned_to": "user_456",
  "priority": "HIGH",
  "estimated_hours": 16,
  "due_date": "2026-02-15",
  "dependencies": ["task_123"]  // Optional
}
```

### 3.3 Update Task Status

```http
PATCH /api/v1/projects/:projectId/tasks/:taskId
```

**Request Body:**
```json
{
  "status": "DONE",
  "actual_hours": 14,
  "completion_notes": "Mockup approved by client"
}
```

---

## 4. Time Tracking

### 4.1 List Time Entries

```http
GET /api/v1/projects/:projectId/time-entries
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `user_id` | string | Filter by user |
| `from_date` | date | Start date |
| `to_date` | date | End date |
| `billable` | boolean | Filter billable/ non-billable |

**Response:**
```json
{
  "data": [
    {
      "id": "time_123abc",
      "project_id": "proj_abc123",
      "task_id": "task_xyz789",
      "user": {
        "id": "user_456",
        "name": "Bob Designer"
      },
      "date": "2026-02-10",
      "start_time": "09:00",
      "end_time": "13:00",
      "hours": 4.0,
      "billable": true,
      "billable_rate": 125.00,
      "description": "Working on homepage mockup",
      "status": "SUBMITTED",
      "approved_by": null
    }
  ],
  "summary": {
    "total_hours": 120,
    "billable_hours": 100,
    "total_amount": 12500.00
  }
}
```

### 4.2 Create TimeEntry

```http
POST /api/v1/projects/:projectId/time-entries
```

**Request Body:**
```json
{
  "task_id": "task_xyz789",
  "date": "2026-02-10",
  "start_time": "09:00",
  "end_time": "13:00",
  "description": "Working on homepage mockup",
  "billable": true,
  "gps_coordinates": {  // Optional if GPS verification enabled
    "latitude": 9.005401,
    "longitude": 38.763611
  }
}
```

### 4.3 Approve Time Entries

```http
POST /api/v1/projects/:projectId/time-entries/approve
```

**Request Body:**
```json
{
  "entry_ids": ["time_123abc", "time_456def"],
  "notes": "Approved for billing"
}
```

---

## 5. Documents

### 5.1 List Documents

```http
GET /api/v1/projects/:projectId/documents
```

**Response:**
```json
{
  "data": [
    {
      "id": "doc_abc123",
      "filename": "Homepage_Mockup_v2.pdf",
      "size": 2048576,
      "content_type": "application/pdf",
      "confidentiality_level": "INTERNAL",
      "version": 2,
      "uploaded_by": {
        "id": "user_456",
        "name": "Bob Designer"
      },
      "uploaded_at": "2026-02-10T14:30:00Z",
      "download_url": "/api/v1/projects/proj_abc123/documents/doc_abc123/download"
    }
  ]
}
```

### 5.2 Upload Document

```http
POST /api/v1/projects/:projectId/documents
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Binary file data
- `confidentiality_level`: `PUBLIC` | `INTERNAL` | `CONFIDENTIAL` | `SECRET`
- `description`: Optional description

**Response:**
```json
{
  "id": "doc_abc123",
  "filename": "Homepage_Mockup_v2.pdf",
  "size": 2048576,
  "content_hash": "sha256:abc123...",
  "encrypted": true
}
```

### 5.3 Download Document

```http
GET /api/v1/projects/:projectId/documents/:documentId/download
```

**Response:** Binary file data

> **Security Note:** Download is audit-logged. Document is decrypted on-the-fly.

---

## Gantt Chart Data

### Get Project Timeline

```http
GET /api/v1/projects/:projectId/timeline
```

**Response:**
```json
{
  "project": {
    "start_date": "2026-01-15",
    "end_date": "2026-04-15"
  },
  "tasks": [
    {
      "id": "task_123",
      "title": "Design phase",
      "start_date": "2026-01-15",
      "end_date": "2026-02-15",
      "progress": 75,
      "dependencies": []
    },
    {
      "id": "task_456",
      "title": "Development phase",
      "start_date": "2026-02-01",
      "end_date": "2026-03-15",
      "progress": 30,
      "dependencies": ["task_123"]
    }
  ],
  "milestones": [
    {
      "name": "Design Approval",
      "date": "2026-02-15",
      "status": "COMPLETED"
    }
  ]
}
```

---

**Related Documentation:**
- [PROJECTS_SECURITY.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/security/PROJECTS_SECURITY.md) - Security controls
- [MODULE_PROJECTS.md](file:///home/michot/project/BLIH-Business-Lifecycle-Integrated-Hub-/docs/modules/MODULE_PROJECTS.md) - Features

**Last Updated:** February 2026
