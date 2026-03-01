# BLIH System Types Package Documentation

## Overview

The `@blih/types` package provides shared TypeScript type definitions used across the BLIH System monorepo. This package ensures type consistency between the backend API, frontend applications, and any other consumers of the system's data structures.

## Package Structure

```
packages/types/src/
├── shared/              # Common shared types
├── auth/                # Authentication and authorization types
├── users/               # User management types
├── rbac/                # Role-based access control types
├── audit/               # Audit logging types
├── notifications/       # Notification system types
└── system-config/       # System configuration types
```

## Installation and Usage

### Installation

```bash
npm install @blih/types
```

### Importing Types

```typescript
// Import specific types
import { AuthMeResponseDto } from '@blih/types/auth';
import { UserResponseDto } from '@blih/types/users';
import { ApiResponse } from '@blih/types/shared';

// Import all types
import * as BlihTypes from '@blih/types';
```

## Shared Types (`shared/`)

### Response Envelope

All API responses follow a consistent envelope format:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: ApiResponseError | null;
  meta: ApiResponseMeta;
}

export interface ApiResponseError {
  code: ErrorCode | string;
  details?: string;
  fieldErrors?: ApiResponseFieldError[];
}

export interface ApiResponseFieldError {
  field: string;
  message: string;
}

export interface ApiResponseMeta {
  timestamp: string;
  requestId: string;
  version: string;
  pagination?: ApiResponsePaginationMeta;
}

export interface ApiResponsePaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'METHOD_NOT_ALLOWED'
  | 'UNPROCESSABLE_ENTITY'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_SERVER_ERROR'
  | 'BAD_GATEWAY'
  | 'SERVICE_UNAVAILABLE'
  | 'GATEWAY_TIMEOUT';
```

### Pagination Types

```typescript
export interface PaginationInput {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

### Common Base Types

```typescript
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditableEntity extends BaseEntity {
  createdBy: string;
  updatedBy: string;
}

export interface SoftDeletableEntity extends AuditableEntity {
  deletedAt?: Date;
  deletedBy?: string;
  isDeleted: boolean;
}
```

## Authentication Types (`auth/`)

### Auth Me Response

```typescript
export interface AuthMeUserDto {
  id: string;
  keycloakId: string;
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: string;
  departmentId?: string | null;
}

export interface AuthMeAuthDto {
  sub: string;
  roles: string[];
  permissions: string[];
  scopes: string[];
  sessionId?: string;
  clientId?: string;
}

export interface AuthMeResponseDto extends AuthMeUserDto, AuthMeAuthDto {}
```

### Token Types

```typescript
export interface TokenPairDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface TokenRefreshDto {
  refreshToken: string;
}

export interface TokenValidationDto {
  valid: boolean;
  expired: boolean;
  payload?: Record<string, any>;
}
```

## User Types (`users/`)

### User Response Types

```typescript
export interface UserResponseDto {
  id: string;
  keycloakId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status: UserStatus;
  departmentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  PENDING = 'PENDING',
}
```

### User Profile Types

```typescript
export interface UserProfileDto {
  id: string;
  userId: string;
  avatar?: string;
  bio?: string;
  timezone: string;
  language: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  dateFormat: string;
  timeFormat: '12h' | '24h';
}
```

### User Management Types

```typescript
export interface CreateUserDto {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  departmentId?: string;
  roles?: string[];
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: UserStatus;
  departmentId?: string;
}

export interface ResetPasswordDto {
  userId: string;
  newPassword: string;
  confirmPassword: string;
  token?: string;
}
```

## RBAC Types (`rbac/`)

### Access Evaluation

```typescript
export interface AccessEvaluationRequest {
  userId: string;
  resource: string;
  action: string;
  context?: Record<string, any>;
}

export interface AccessEvaluationResponse {
  allowed: boolean;
  reason?: string;
  permissions: string[];
}
```

### Role Types

```typescript
export interface RoleResponseDto {
  id: string;
  name: string;
  description: string;
  permissions: PermissionResponseDto[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Permission Types

```typescript
export interface PermissionResponseDto {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  isActive: boolean;
}
```

### Action Types

```typescript
export interface ActionResponseDto {
  id: string;
  name: string;
  resource: string;
  description: string;
  isActive: boolean;
}
```

### Resource Types

```typescript
export interface ResourceResponseDto {
  id: string;
  name: string;
  type: string;
  description: string;
  isActive: boolean;
}
```

## Audit Types (`audit/`)

### Audit Log Types

```typescript
export interface AuditLogResponseDto {
  id: string;
  userId: string;
  resource: string;
  action: string;
  result: AuditResult;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  correlationId: string;
}

export enum AuditResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}
```

### Audit Statistics

```typescript
export interface AuditStatisticsDto {
  totalLogs: number;
  successCount: number;
  failureCount: number;
  topResources: ResourceUsageDto[];
  topActions: ActionUsageDto[];
  timeRange: {
    from: Date;
    to: Date;
  };
}

export interface ResourceUsageDto {
  resource: string;
  count: number;
  percentage: number;
}

export interface ActionUsageDto {
  action: string;
  count: number;
  percentage: number;
}
```

## Notification Types (`notifications/`)

### Notification Types

```typescript
export interface NotificationResponseDto {
  id: string;
  userId: string;
  channel: NotificationChannel;
  subject: string;
  content: string;
  status: NotificationStatus;
  metadata: Record<string, any>;
  sentAt?: Date;
  createdAt: Date;
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  WEBHOOK = 'WEBHOOK',
  IN_APP = 'IN_APP',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}
```

### Notification Templates

```typescript
export interface NotificationTemplateDto {
  id: string;
  name: string;
  channel: NotificationChannel;
  subject: string;
  content: string;
  variables: TemplateVariable[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  required: boolean;
  defaultValue?: any;
}
```

## System Config Types (`system-config/`)

### Configuration Types

```typescript
export interface SystemConfigDto {
  id: string;
  key: string;
  value: any;
  description: string;
  category: string;
  isEncrypted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemConfigCategory {
  name: string;
  description: string;
  configs: SystemConfigDto[];
}
```

### Policy Types

```typescript
export interface PolicyDto {
  id: string;
  name: string;
  type: PolicyType;
  rules: PolicyRule[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum PolicyType {
  SECURITY = 'SECURITY',
  PRIVACY = 'PRIVACY',
  COMPLIANCE = 'COMPLIANCE',
  GOVERNANCE = 'GOVERNANCE',
}

export interface PolicyRule {
  condition: string;
  action: string;
  priority: number;
}
```

## Usage Examples

### API Response Handling

```typescript
import { ApiResponse, UserResponseDto } from '@blih/types';

async function fetchUsers(): Promise<ApiResponse<UserResponseDto[]>> {
  const response = await fetch('/api/v1/users');
  return response.json();
}

// Usage
const usersResponse = await fetchUsers();
if (usersResponse.success) {
  console.log('Users:', usersResponse.data);
} else {
  console.error('Error:', usersResponse.error);
}
```

### Type-Safe API Client

```typescript
import { ApiResponse, CreateUserDto, UserResponseDto } from '@blih/types';

class BlihApiClient {
  async createUser(
    userData: CreateUserDto,
  ): Promise<ApiResponse<UserResponseDto>> {
    const response = await fetch('/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  }

  async evaluateAccess(
    request: AccessEvaluationRequest,
  ): Promise<AccessEvaluationResponse> {
    const response = await fetch('/api/v1/rbac/evaluate-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return response.json();
  }
}
```

### Frontend Component with Types

```typescript
import React from 'react';
import { UserResponseDto, UserStatus } from '@blih/types/users';

interface UserListProps {
  users: UserResponseDto[];
  onUserSelect: (user: UserResponseDto) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onUserSelect }) => {
  const getStatusColor = (status: UserStatus): string => {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'green';
      case UserStatus.DISABLED:
        return 'red';
      case UserStatus.PENDING:
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <div>
      {users.map(user => (
        <div key={user.id} onClick={() => onUserSelect(user)}>
          <span>{user.username}</span>
          <span style={{ color: getStatusColor(user.status) }}>
            {user.status}
          </span>
        </div>
      ))}
    </div>
  );
};
```

## Type Safety Benefits

### 1. Compile-Time Validation

TypeScript provides compile-time checking for API responses and request payloads:

```typescript
// This will cause a compile-time error if the interface doesn't match
const invalidUser: UserResponseDto = {
  id: '123',
  // Missing required fields will cause TypeScript errors
};
```

### 2. IDE Autocompletion

Modern IDEs provide intelligent autocompletion for all type definitions:

```typescript
const user: UserResponseDto = {
  id: '',
  keycloakId: '',
  username: '',
  email: '',
  // IDE will suggest all required properties
};
```

### 3. Refactoring Safety

When types change, TypeScript will identify all locations that need updates:

```typescript
// If UserResponseDto.email becomes optional, TypeScript will highlight
// all code that assumes it's required
```

## Versioning and Compatibility

### Semantic Versioning

The types package follows semantic versioning:

- **Major (X.0.0)**: Breaking changes to existing types
- **Minor (X.Y.0)**: New types added, backward compatible
- **Patch (X.Y.Z)**: Bug fixes, documentation updates

### Backward Compatibility

- New optional fields can be added without breaking changes
- Removing or renaming fields requires a major version bump
- Enum value additions are considered breaking changes

### Migration Guide

When upgrading to a new major version:

```typescript
// Before v2.0.0
interface OldUserDto {
  fullName: string;
}

// After v2.0.0
interface NewUserDto {
  firstName: string;
  lastName: string;
}

// Migration helper
function migrateUser(oldUser: OldUserDto): NewUserDto {
  const [firstName, lastName] = oldUser.fullName.split(' ');
  return { firstName, lastName };
}
```

## Best Practices

### 1. Import Specific Types

```typescript
// Good: Import only what you need
import { UserResponseDto } from '@blih/types/users';

// Avoid: Import everything
import * as Types from '@blih/types';
```

### 2. Use Type Guards

```typescript
function isUserResponse(obj: any): obj is UserResponseDto {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
}

// Usage
if (isUserResponse(data)) {
  // TypeScript knows data is UserResponseDto here
  console.log(data.username);
}
```

### 3. Extend Types Judiciously

```typescript
// Good: Create specific interfaces for your needs
interface ExtendedUser extends UserResponseDto {
  customField: string;
}

// Avoid: Modifying imported types directly
```

### 4. Use Generics When Appropriate

```typescript
function createApiResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    message: 'Success',
    data,
    error: null,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      version: '1.0.0',
    },
  };
}
```

## Development and Contributing

### Adding New Types

1. Create the type definition in the appropriate domain folder
2. Export from the domain's index.ts
3. Add to the main index.ts exports
4. Update documentation
5. Increment version according to semver rules

### Type Definition Guidelines

- Use descriptive names
- Provide JSDoc comments for complex types
- Use enums for fixed value sets
- Prefer interfaces over types for object shapes
- Use generic types where appropriate

### Testing Types

```typescript
// Type testing with TypeScript's type system
type TestUserResponse = Expect<Equal<UserResponseDto, ExpectedUserShape>>;

// Runtime type checking
function validateUserResponse(obj: any): obj is UserResponseDto {
  // Implementation for runtime validation
}
```

The `@blih/types` package serves as the single source of truth for all data structures in the BLIH System, ensuring type safety and consistency across the entire ecosystem.
