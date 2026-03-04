# BLIH System API Documentation

## Overview

The BLIH System API is a RESTful API built with NestJS that provides comprehensive backend services for the BLIH ecosystem. The API follows OpenAPI 3.0 specifications and includes interactive Swagger documentation.

## Base Configuration

- **Base URL**: `http://localhost:5000/api/v1`
- **Authentication**: Bearer Token (JWT from Keycloak)
- **Content-Type**: `application/json`
- **API Documentation**: Available at `/api/docs`

## Authentication & Authorization

### Authentication Flow

1. **Obtain Token**: Authenticate with Keycloak to receive JWT token
2. **Include Token**: Add token to Authorization header
3. **Access API**: Make authenticated requests to protected endpoints

```bash
# Example authenticated request
curl -X GET "http://localhost:5000/api/v1/auth/me" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Authorization Model

The API uses Role-Based Access Control (RBAC) with the following hierarchy:

- **Roles**: Collections of permissions (e.g., ADMIN, MANAGER, USER)
- **Permissions**: Granular access rights (e.g., users:read, actions:create)
- **Resources**: Protected entities (users, roles, actions, etc.)
- **Actions**: Operations on resources (create, read, update, delete)

## Response Format

All API responses follow a consistent envelope format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: ApiResponseError | null;
  meta: {
    timestamp: string;
    requestId: string;
    version: string;
    pagination?: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}
```

### Error Response Format

```typescript
interface ApiResponseError {
  code: ErrorCode | string;
  details?: string;
  fieldErrors?: {
    field: string;
    message: string;
  }[];
}
```

## Core API Endpoints

### Authentication Endpoints

#### Get Current User Profile

```http
GET /api/v1/auth/me
Authorization: Bearer {token}
```

**Response:**

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "user-uuid",
    "keycloakId": "keycloak-uuid",
    "username": "john.doe",
    "email": "john.doe@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "status": "ACTIVE",
    "departmentId": "dept-uuid",
    "roles": ["USER"],
    "permissions": ["users:read", "profile:update"],
    "scopes": ["openid", "email", "profile"],
    "sessionId": "session-uuid",
    "clientId": "blih-client"
  },
  "error": null,
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req-uuid",
    "version": "1.0.0"
  }
}
```

### User Management Endpoints

#### List Users

```http
GET /api/v1/users?page=1&limit=10&search=john&status=ACTIVE
Authorization: Bearer {token}
```

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search term for username, email, or name
- `status`: Filter by user status (ACTIVE, DISABLED, PENDING)
- `departmentId`: Filter by department

#### Create User

```http
POST /api/v1/users
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "username": "jane.doe",
  "email": "jane.doe@company.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1234567890",
  "departmentId": "dept-uuid",
  "roles": ["USER"]
}
```

#### Update User

```http
PUT /api/v1/users/{userId}
Authorization: Bearer {token}
Content-Type: application/json
```

#### Delete User

```http
DELETE /api/v1/users/{userId}
Authorization: Bearer {token}
```

### RBAC Endpoints

#### List Roles

```http
GET /api/v1/rbac/roles
Authorization: Bearer {token}
```

#### Create Role

```http
POST /api/v1/rbac/roles
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "PROJECT_MANAGER",
  "description": "Project manager role with project management permissions",
  "permissions": ["projects:read", "projects:create", "projects:update"]
}
```

#### List Permissions

```http
GET /api/v1/rbac/permissions
Authorization: Bearer {token}
```

#### Evaluate Access

```http
POST /api/v1/rbac/evaluate-access
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "userId": "user-uuid",
  "resource": "users",
  "action": "read"
}
```

### Audit Endpoints

#### List Audit Logs

```http
GET /api/v1/audit/logs?page=1&limit=10&userId=user-uuid&resource=users
Authorization: Bearer {token}
```

**Query Parameters:**

- `page`: Page number
- `limit`: Items per page
- `userId`: Filter by user ID
- `resource`: Filter by resource type
- `action`: Filter by action type
- `result`: Filter by result (SUCCESS, FAILURE)
- `fromDate`: Filter by date range (ISO 8601)
- `toDate`: Filter by date range (ISO 8601)

### Notification Endpoints

#### List Notifications

```http
GET /api/v1/notifications?page=1&limit=10&status=PENDING
Authorization: Bearer {token}
```

#### Send Notification

```http
POST /api/v1/notifications
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "userId": "user-uuid",
  "channel": "EMAIL",
  "subject": "Welcome to BLIH System",
  "content": "Your account has been successfully created.",
  "metadata": {
    "template": "welcome-email",
    "variables": {
      "username": "john.doe"
    }
  }
}
```

### System Configuration Endpoints

#### Get System Config

```http
GET /api/v1/system-config/{key}
Authorization: Bearer {token}
```

#### Update System Config

```http
PUT /api/v1/system-config/{key}
Authorization: Bearer {token}
Content-Type: application/json
```

## Domain-Specific Endpoints

### AI Module

#### Generate AI Response

```http
POST /api/v1/ai/generate
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "prompt": "Generate a summary of the project status",
  "context": {
    "projectId": "project-uuid",
    "userId": "user-uuid"
  },
  "options": {
    "maxTokens": 1000,
    "temperature": 0.7
  }
}
```

### CRM Module

#### List Customers

```http
GET /api/v1/crm/customers?page=1&limit=10&search=company
Authorization: Bearer {token}
```

#### Create Customer

```http
POST /api/v1/crm/customers
Authorization: Bearer {token}
Content-Type: application/json
```

### Finance Module

#### List Transactions

```http
GET /api/v1/finance/transactions?page=1&limit=10&fromDate=2024-01-01
Authorization: Bearer {token}
```

#### Create Transaction

```http
POST /api/v1/finance/transactions
Authorization: Bearer {token}
Content-Type: application/json
```

### HR Module

#### List Employees

```http
GET /api/v1/hr/employees?page=1&limit=10&departmentId=dept-uuid
Authorization: Bearer {token}
```

#### Create Employee

```http
POST /api/v1/hr/employees
Authorization: Bearer {token}
Content-Type: application/json
```

### Project Module

#### List Projects

```http
GET /api/v1/projects?page=1&limit=10&status=ACTIVE
Authorization: Bearer {token}
```

#### Create Project

```http
POST /api/v1/projects
Authorization: Bearer {token}
Content-Type: application/json
```

## Error Handling

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `422 Unprocessable Entity`: Validation failed
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Common Error Responses

#### Validation Error (422)

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": "Request validation failed",
    "fieldErrors": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req-uuid",
    "version": "1.0.0"
  }
}
```

#### Authorization Error (403)

```json
{
  "success": false,
  "message": "Access denied",
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "details": "Insufficient permissions to access this resource"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req-uuid",
    "version": "1.0.0"
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default Limit**: 100 requests per minute per user
- **Burst Limit**: 200 requests per minute per user
- **Headers**: Rate limit information included in response headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination with the following parameters:

- `page`: Page number (1-based, default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response includes pagination metadata:**

```json
{
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 150,
      "totalPages": 15,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

## Filtering and Sorting

### Common Filters

Most list endpoints support common filtering parameters:

- `search`: Text search across relevant fields
- `status`: Filter by status field
- `createdAt`: Filter by creation date
- `updatedAt`: Filter by update date

### Sorting

Use the `sortBy` and `sortOrder` parameters:

- `sortBy`: Field to sort by
- `sortOrder`: `asc` or `desc` (default: `desc`)

```http
GET /api/v1/users?sortBy=createdAt&sortOrder=desc
```

## Webhooks

The API supports webhooks for real-time notifications:

### Configure Webhook

```http
POST /api/v1/webhooks
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "url": "https://your-service.com/webhook",
  "events": ["user.created", "user.updated", "audit.logged"],
  "secret": "webhook-secret"
}
```

### Webhook Events

- `user.created`: New user created
- `user.updated`: User profile updated
- `user.deleted`: User deleted
- `audit.logged`: New audit log entry
- `notification.sent`: Notification sent
- `system.config.updated`: System configuration changed

## API Versioning

The API uses URL path versioning:

- Current version: `/api/v1/`
- Future versions: `/api/v2/`, `/api/v3/`

Version compatibility is maintained for at least one major version behind.

## Testing the API

### Using Swagger UI

1. Navigate to `http://localhost:5000/api/docs`
2. Click "Authorize" and enter your JWT token
3. Explore endpoints and test requests

### Using curl Examples

```bash
# Get current user
curl -X GET "http://localhost:5000/api/v1/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# List users with pagination
curl -X GET "http://localhost:5000/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Create new user
curl -X POST "http://localhost:5000/api/v1/users" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "new.user",
    "email": "new.user@company.com",
    "firstName": "New",
    "lastName": "User"
  }'
```

## SDK and Client Libraries

While the API can be consumed directly via HTTP requests, client SDKs are available for:

- **TypeScript/JavaScript**: `@blih/api-client`
- **Python**: `blih-python-client`
- **Java**: `blih-java-client`

These SDKs provide:

- Type-safe request/response interfaces
- Automatic authentication handling
- Error handling and retry logic
- Integration with popular frameworks

For more detailed API specifications, refer to the interactive Swagger documentation available at `/api/docs`.
