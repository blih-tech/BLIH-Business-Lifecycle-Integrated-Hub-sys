# BLIH System Database Documentation

## Overview

The BLIH System uses PostgreSQL as its primary database with Prisma as the ORM. The database schema is designed to support the system's modular architecture, clean separation of concerns, and future microservice extraction.

## Database Architecture

### Technology Stack

- **Database**: PostgreSQL 15+
- **ORM**: Prisma 7.4.1
- **Migration Tool**: Prisma Migrate
- **Connection Pooling**: PgBouncer (production)
- **Backup**: pg_dump + WAL-E (production)

### Schema Design Principles

1. **Domain Separation**: Each business domain has its own tables
2. **Audit Trail**: All critical tables include audit fields
3. **Soft Deletes**: Important data uses soft deletion
4. **Referential Integrity**: Foreign keys maintain data consistency
5. **Indexing Strategy**: Optimized for common query patterns

## Database Schema

### Core Tables

#### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keycloak_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  status user_status DEFAULT 'ACTIVE',
  department_id UUID REFERENCES departments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by VARCHAR(255),
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TYPE user_status AS ENUM ('ACTIVE', 'DISABLED', 'PENDING');

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_keycloak_id ON users(keycloak_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### Departments Table

```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES users(id),
  parent_id UUID REFERENCES departments(id),
  budget DECIMAL(15,2),
  employee_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

-- Indexes
CREATE INDEX idx_departments_manager_id ON departments(manager_id);
CREATE INDEX idx_departments_parent_id ON departments(parent_id);
CREATE INDEX idx_departments_is_active ON departments(is_active);
```

### RBAC Tables

#### Roles Table

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

-- Indexes
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_is_active ON roles(is_active);
```

#### Permissions Table

```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  resource VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_action ON permissions(action);
CREATE UNIQUE INDEX idx_permissions_resource_action ON permissions(resource, action);
```

#### Role Permissions Junction Table

```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Indexes
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
```

#### User Roles Junction Table

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, role_id)
);

-- Indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_expires_at ON user_roles(expires_at);
CREATE INDEX idx_user_roles_is_active ON user_roles(is_active);
```

### Audit Tables

#### Audit Logs Table

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  resource VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  resource_id VARCHAR(255),
  result audit_result NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  correlation_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE audit_result AS ENUM ('SUCCESS', 'FAILURE');

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_result ON audit_logs(result);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_correlation_id ON audit_logs(correlation_id);
CREATE INDEX idx_audit_logs_details_gin ON audit_logs USING gin(details);
```

### Notification Tables

#### Notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  channel notification_channel NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status notification_status DEFAULT 'PENDING',
  metadata JSONB,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE notification_channel AS ENUM ('EMAIL', 'WEBHOOK', 'IN_APP');
CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'FAILED');

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_channel ON notifications(channel);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_metadata_gin ON notifications USING gin(metadata);
```

#### Notification Templates Table

```sql
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  channel notification_channel NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  variables JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notification_templates_name ON notification_templates(name);
CREATE INDEX idx_notification_templates_channel ON notification_templates(channel);
CREATE INDEX idx_notification_templates_is_active ON notification_templates(is_active);
```

### System Configuration Tables

#### System Config Table

```sql
CREATE TABLE system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(255) NOT NULL,
  is_encrypted BOOLEAN DEFAULT FALSE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

-- Indexes
CREATE INDEX idx_system_config_key ON system_config(key);
CREATE INDEX idx_system_config_category ON system_config(category);
CREATE INDEX idx_system_config_value_gin ON system_config USING gin(value);
```

### Domain Tables

#### CRM Tables

```sql
-- Customers Table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type customer_type NOT NULL,
  industry VARCHAR(255),
  size company_size,
  website VARCHAR(500),
  phone VARCHAR(50),
  email VARCHAR(255),
  address JSONB,
  status customer_status DEFAULT 'ACTIVE',
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by VARCHAR(255),
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TYPE customer_type AS ENUM ('INDIVIDUAL', 'COMPANY');
CREATE TYPE company_size AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');
CREATE TYPE customer_status AS ENUM ('ACTIVE', 'INACTIVE', 'PROSPECT');

-- Opportunities Table
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  name VARCHAR(255) NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  stage opportunity_stage NOT NULL,
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

CREATE TYPE opportunity_stage AS ENUM ('LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');
```

#### Finance Tables

```sql
-- Accounts Table
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type account_type NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE account_type AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- Transactions Table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  type transaction_type NOT NULL,
  category transaction_category NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  status transaction_status DEFAULT 'PENDING',
  metadata JSONB,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE transaction_type AS ENUM ('DEBIT', 'CREDIT');
CREATE TYPE transaction_category AS ENUM ('SOFTWARE_LICENSES', 'HARDWARE', 'SALARIES', 'RENT', 'UTILITIES', 'OTHER');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');
```

#### HR Tables

```sql
-- Employees Table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  employee_number VARCHAR(50) UNIQUE NOT NULL,
  department_id UUID REFERENCES departments(id),
  position VARCHAR(255),
  employment_type employment_type NOT NULL,
  salary DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  pay_frequency pay_frequency DEFAULT 'MONTHLY',
  status employee_status DEFAULT 'ACTIVE',
  hire_date DATE NOT NULL,
  termination_date DATE,
  manager_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TEMPORARY');
CREATE TYPE pay_frequency AS ENUM ('MONTHLY', 'BIWEEKLY', 'WEEKLY', 'ANNUAL');
CREATE TYPE employee_status AS ENUM ('ACTIVE', 'ON_LEAVE', 'TERMINATED');

-- Performance Reviews Table
CREATE TABLE performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  review_type performance_review_type NOT NULL,
  period VARCHAR(50) NOT NULL,
  rating DECIMAL(3,2) CHECK (rating >= 1 AND rating <= 5),
  strengths TEXT[],
  areas_for_improvement TEXT[],
  goals JSONB,
  reviewer_id UUID REFERENCES users(id),
  review_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE performance_review_type AS ENUM ('ANNUAL', 'QUARTERLY', 'PROJECT', 'ADHOC');
```

#### Project Tables

```sql
-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status project_status DEFAULT 'PLANNING',
  priority project_priority DEFAULT 'MEDIUM',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'USD',
  manager_id UUID REFERENCES users(id),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by VARCHAR(255),
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TYPE project_status AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');
CREATE TYPE project_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status task_status DEFAULT 'TODO',
  priority task_priority DEFAULT 'MEDIUM',
  assignee_id UUID REFERENCES users(id),
  estimated_hours INTEGER,
  actual_hours INTEGER,
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Project Members Table
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role project_role NOT NULL,
  allocation INTEGER DEFAULT 100 CHECK (allocation >= 0 AND allocation <= 100),
  join_date DATE NOT NULL,
  leave_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(project_id, user_id)
);

CREATE TYPE project_role AS ENUM ('OWNER', 'MANAGER', 'DEVELOPER', 'DESIGNER', 'TESTER', 'OBSERVER');
```

## Prisma Schema

### Complete Schema Structure

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client"
  output   = "../src/platform/prisma/generated"
  moduleFormat = "cjs"
}

datasource db {
  provider = "postgresql"
}

// Enums
enum UserStatus {
  ACTIVE
  DISABLED
  PENDING
}

enum NotificationChannel {
  EMAIL
  WEBHOOK
  IN_APP
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
}

enum AuditResult {
  SUCCESS
  FAILURE
}

enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERN
  TEMPORARY
}

enum PayFrequency {
  MONTHLY
  BIWEEKLY
  WEEKLY
  ANNUAL
}

enum CustomerType {
  INDIVIDUAL
  COMPANY
}

enum CompanySize {
  SMALL
  MEDIUM
  LARGE
  ENTERPRISE
}

enum CustomerStatus {
  ACTIVE
  INACTIVE
  PROSPECT
}

enum OpportunityStage {
  LEAD
  QUALIFIED
  PROPOSAL
  NEGOTIATION
  CLOSED_WON
  CLOSED_LOST
}

enum AccountType {
  ASSET
  LIABILITY
  EQUITY
  REVENUE
  EXPENSE
}

enum TransactionType {
  DEBIT
  CREDIT
}

enum TransactionCategory {
  SOFTWARE_LICENSES
  HARDWARE
  SALARIES
  RENT
  UTILITIES
  OTHER
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  CANCELLED
}

enum EmployeeStatus {
  ACTIVE
  ON_LEAVE
  TERMINATED
}

enum PerformanceReviewType {
  ANNUAL
  QUARTERLY
  PROJECT
  ADHOC
}

enum ProjectStatus {
  PLANNING
  ACTIVE
  ON_HOLD
  COMPLETED
  CANCELLED
}

enum ProjectPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  COMPLETED
  CANCELLED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ProjectRole {
  OWNER
  MANAGER
  DEVELOPER
  DESIGNER
  TESTER
  OBSERVER
}

// Core Models
model User {
  id            String    @id @default(cuid())
  keycloakId    String    @unique @map("keycloak_id")
  username      String    @unique
  email         String    @unique
  firstName     String?   @map("first_name")
  lastName      String?   @map("last_name")
  phone         String?
  status        UserStatus @default(ACTIVE)
  departmentId  String?   @map("department_id")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  createdBy     String?   @map("created_by")
  updatedBy     String?   @map("updated_by")
  deletedAt     DateTime? @map("deleted_at")
  deletedBy     String?   @map("deleted_by")
  isDeleted     Boolean   @default(false) @map("is_deleted")

  // Relations
  department    Department? @relation("DepartmentUsers", fields: [departmentId], references: [id])
  userRoles     UserRole[]
  auditLogs     AuditLog[]
  notifications Notification[]
  employee      Employee?
  managedDepartments Department[] @relation("DepartmentManager")
  projectMemberships ProjectMember[] @relation("ProjectMemberUser")
  assignedTasks  Task[] @relation("TaskAssignee")
  managedProjects Project[] @relation("ProjectManager")
  opportunities  Opportunity[] @relation("OpportunityAssignee")
  performanceReviewsGiven PerformanceReview[] @relation("PerformanceReviewer")
  customers      Customer[] @relation("CustomerAssignee")

  @@map("users")
}

model Department {
  id            String    @id @default(cuid())
  name          String    @unique
  description   String?
  managerId     String?   @map("manager_id")
  parentId      String?   @map("parent_id")
  budget        Decimal?
  employeeCount Int       @default(0) @map("employee_count")
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  createdBy     String?   @map("created_by")
  updatedBy     String?   @map("updated_by")

  // Relations
  manager       User?      @relation("DepartmentManager", fields: [managerId], references: [id])
  parent        Department? @relation("DepartmentHierarchy", fields: [parentId], references: [id])
  children      Department[] @relation("DepartmentHierarchy")
  users         User[]     @relation("DepartmentUsers")
  employees     Employee[]

  @@map("departments")
}

// RBAC Models
model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  createdBy   String?  @map("created_by")
  updatedBy   String?  @map("updated_by")

  // Relations
  rolePermissions RolePermission[]
  userRoles       UserRole[]

  @@map("roles")
}

model Permission {
  id          String   @id @default(cuid())
  name        String   @unique
  resource    String
  action      String
  description String?
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  rolePermissions RolePermission[]

  @@unique([resource, action])
  @@map("permissions")
}

model RolePermission {
  id           String   @id @default(cuid())
  roleId       String   @map("role_id")
  permissionId String   @map("permission_id")
  createdAt    DateTime @default(now()) @map("created_at")

  // Relations
  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@unique([roleId, permissionId])
  @@map("role_permissions")
}

model UserRole {
  id         String    @id @default(cuid())
  userId     String    @map("user_id")
  roleId     String    @map("role_id")
  assignedBy String?   @map("assigned_by")
  assignedAt DateTime  @default(now()) @map("assigned_at")
  expiresAt  DateTime? @map("expires_at")
  isActive   Boolean   @default(true) @map("is_active")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role Role @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([userId, roleId])
  @@map("user_roles")
}

// Audit Models
model AuditLog {
  id           String     @id @default(cuid())
  userId       String?    @map("user_id")
  resource     String
  action       String
  resourceId   String?    @map("resource_id")
  result       AuditResult
  details      Json?
  ipAddress    String?    @map("ip_address")
  userAgent    String?    @map("user_agent")
  correlationId String    @map("correlation_id")
  timestamp    DateTime   @default(now())

  // Relations
  user User? @relation(fields: [userId], references: [id])

  @@map("audit_logs")
}

// Notification Models
model Notification {
  id        String            @id @default(cuid())
  userId    String            @map("user_id")
  channel   NotificationChannel
  subject   String
  content   String
  status    NotificationStatus @default(PENDING)
  metadata  Json?
  sentAt    DateTime?         @map("sent_at")
  createdAt DateTime          @default(now()) @map("created_at")
  updatedAt DateTime          @updatedAt @map("updated_at")

  // Relations
  user User @relation(fields: [userId], references: [id])

  @@map("notifications")
}

model NotificationTemplate {
  id          String            @id @default(cuid())
  name        String            @unique
  channel     NotificationChannel
  subject     String
  content     String
  variables   Json?
  isActive    Boolean           @default(true) @map("is_active")
  createdAt   DateTime          @default(now()) @map("created_at")
  updatedAt   DateTime          @updatedAt @map("updated_at")

  @@map("notification_templates")
}

// System Config Models
model SystemConfig {
  id          String   @id @default(cuid())
  key         String   @unique
  value       Json
  description String?
  category    String
  isEncrypted Boolean  @default(false) @map("is_encrypted")
  version     Int      @default(1)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  createdBy   String?  @map("created_by")
  updatedBy   String?  @map("updated_by")

  @@map("system_config")
}

// CRM Models
model Customer {
  id         String         @id @default(cuid())
  name       String
  type       CustomerType
  industry   String?
  size       CompanySize?
  website    String?
  phone      String?
  email      String?
  address    Json?
  status     CustomerStatus @default(ACTIVE)
  assignedTo String?        @map("assigned_to")
  createdAt  DateTime       @default(now()) @map("created_at")
  updatedAt  DateTime       @updatedAt @map("updated_at")
  createdBy  String?        @map("created_by")
  updatedBy  String?        @map("updated_by")
  deletedAt  DateTime?      @map("deleted_at")
  deletedBy  String?        @map("deleted_by")
  isDeleted  Boolean        @default(false) @map("is_deleted")

  // Relations
  assignee    User?          @relation("CustomerAssignee", fields: [assignedTo], references: [id])
  opportunities Opportunity[]

  @@map("customers")
}

model Opportunity {
  id               String           @id @default(cuid())
  customerId       String           @map("customer_id")
  name             String
  value            Decimal
  currency         String           @default("USD")
  stage            OpportunityStage
  probability      Int
  expectedCloseDate DateTime?        @map("expected_close_date")
  actualCloseDate   DateTime?        @map("actual_close_date")
  assignedTo       String?          @map("assigned_to")
  createdAt        DateTime         @default(now()) @map("created_at")
  updatedAt        DateTime         @updatedAt @map("updated_at")
  createdBy        String?          @map("created_by")
  updatedBy        String?          @map("updated_by")

  // Relations
  customer Customer @relation(fields: [customerId], references: [id])
  assignee User?    @relation("OpportunityAssignee", fields: [assignedTo], references: [id])

  @@map("opportunities")
}

// Finance Models
model Account {
  id          String      @id @default(cuid())
  name        String
  type        AccountType
  balance     Decimal     @default(0)
  currency    String      @default("USD")
  description String?
  isActive    Boolean     @default(true) @map("is_active")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  // Relations
  transactions Transaction[]

  @@map("accounts")
}

model Transaction {
  id          String             @id @default(cuid())
  accountId   String             @map("account_id")
  amount      Decimal
  currency    String             @default("USD")
  type        TransactionType
  category    TransactionCategory
  description String?
  date        DateTime
  status      TransactionStatus  @default(PENDING)
  metadata    Json?
  createdBy   String?            @map("created_by")
  createdAt   DateTime           @default(now()) @map("created_at")
  updatedAt   DateTime           @updatedAt @map("updated_at")

  // Relations
  account Account @relation(fields: [accountId], references: [id])

  @@map("transactions")
}

// HR Models
model Employee {
  id             String          @id @default(cuid())
  userId         String          @unique @map("user_id")
  employeeNumber String          @unique @map("employee_number")
  departmentId   String?         @map("department_id")
  position       String?
  employmentType EmploymentType  @map("employment_type")
  salary         Decimal?
  currency       String          @default("USD")
  payFrequency   PayFrequency    @default(MONTHLY) @map("pay_frequency")
  status         EmployeeStatus  @default(ACTIVE)
  hireDate       DateTime        @map("hire_date")
  terminationDate DateTime?       @map("termination_date")
  managerId      String?         @map("manager_id")
  createdAt      DateTime        @default(now()) @map("created_at")
  updatedAt      DateTime        @updatedAt @map("updated_at")

  // Relations
  user               User                @relation(fields: [userId], references: [id])
  department         Department?         @relation(fields: [departmentId], references: [id])
  manager            User?               @relation("EmployeeManager", fields: [managerId], references: [id])
  performanceReviews PerformanceReview[]
  managedEmployees   Employee[]          @relation("EmployeeManager")

  @@map("employees")
}

model PerformanceReview {
  id          String               @id @default(cuid())
  employeeId  String               @map("employee_id")
  reviewType  PerformanceReviewType @map("review_type")
  period      String
  rating      Decimal
  strengths   String[]
  areasForImprovement String[]      @map("areas_for_improvement")
  goals       Json?
  reviewerId  String               @map("reviewer_id")
  reviewDate  DateTime             @map("review_date")
  createdAt   DateTime             @default(now()) @map("created_at")
  updatedAt   DateTime             @updatedAt @map("updated_at")

  // Relations
  employee User @relation(fields: [employeeId], references: [id])
  reviewer User @relation("PerformanceReviewer", fields: [reviewerId], references: [id])

  @@map("performance_reviews")
}

// Project Models
model Project {
  id          String         @id @default(cuid())
  name        String
  description String?
  status      ProjectStatus  @default(PLANNING)
  priority    ProjectPriority @default(MEDIUM)
  startDate   DateTime?      @map("start_date")
  endDate     DateTime?      @map("end_date")
  budget      Decimal?
  currency    String         @default("USD")
  managerId   String?        @map("manager_id")
  progress    Int            @default(0)
  createdAt   DateTime       @default(now()) @map("created_at")
  updatedAt   DateTime       @updatedAt @map("updated_at")
  createdBy   String?        @map("created_by")
  updatedBy   String?        @map("updated_by")
  deletedAt   DateTime?      @map("deleted_at")
  deletedBy   String?        @map("deleted_by")
  isDeleted   Boolean        @default(false) @map("is_deleted")

  // Relations
  manager User? @relation("ProjectManager", fields: [managerId], references: [id])
  tasks   Task[]
  members ProjectMember[]

  @@map("projects")
}

model Task {
  id            String       @id @default(cuid())
  projectId     String       @map("project_id")
  name          String
  description   String?
  status        TaskStatus   @default(TODO)
  priority      TaskPriority @default(MEDIUM)
  assigneeId    String?      @map("assignee_id")
  estimatedHours Int?         @map("estimated_hours")
  actualHours   Int?         @map("actual_hours")
  startDate     DateTime?    @map("start_date")
  dueDate       DateTime?    @map("due_date")
  completedAt   DateTime?    @map("completed_at")
  tags          String[]
  createdAt     DateTime     @default(now()) @map("created_at")
  updatedAt     DateTime     @updatedAt @map("updated_at")

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee User? @relation("TaskAssignee", fields: [assigneeId], references: [id])

  @@map("tasks")
}

model ProjectMember {
  id         String      @id @default(cuid())
  projectId  String      @map("project_id")
  userId     String      @map("user_id")
  role       ProjectRole
  allocation Int         @default(100)
  joinDate   DateTime    @map("join_date")
  leaveDate  DateTime?   @map("leave_date")
  isActive   Boolean     @default(true) @map("is_active")

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation("ProjectMemberUser", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@map("project_members")
}
```

## Database Operations

### Migration Management

#### Creating Migrations

```bash
# Create a new migration
npx prisma migrate dev --name add-user-profiles

# Apply migration to database
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

#### Migration Best Practices

1. **Descriptive Names**: Use clear, descriptive migration names
2. **Backward Compatible**: Ensure migrations don't break existing code
3. **Test Migrations**: Test migrations on staging before production
4. **Rollback Strategy**: Always have a rollback plan

#### Example Migration

```sql
-- Migration: 20240101000001_add_user_profiles.sql

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  avatar_url VARCHAR(500),
  bio TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'en',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_timezone ON user_profiles(timezone);

-- Insert default profiles for existing users
INSERT INTO user_profiles (user_id, timezone, language)
SELECT id, timezone, language
FROM users
WHERE id NOT IN (SELECT user_id FROM user_profiles);
```

### Seeding Data

#### Seed Script Structure

```typescript
// src/platform/prisma/prisma.seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Seed roles
  await seedRoles();

  // Seed permissions
  await seedPermissions();

  // Seed role permissions
  await seedRolePermissions();

  // Seed departments
  await seedDepartments();

  // Seed system configuration
  await seedSystemConfig();

  console.log('Database seeding completed.');
}

async function seedRoles() {
  const roles = [
    { name: 'ADMIN', description: 'System administrator' },
    { name: 'MANAGER', description: 'Department manager' },
    { name: 'USER', description: 'Regular user' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
}

async function seedPermissions() {
  const permissions = [
    {
      name: 'users:read',
      resource: 'users',
      action: 'read',
      description: 'Read user information',
    },
    {
      name: 'users:create',
      resource: 'users',
      action: 'create',
      description: 'Create new users',
    },
    {
      name: 'users:update',
      resource: 'users',
      action: 'update',
      description: 'Update user information',
    },
    {
      name: 'users:delete',
      resource: 'users',
      action: 'delete',
      description: 'Delete users',
    },
    // Add more permissions...
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Query Optimization

#### Indexing Strategy

1. **Primary Keys**: UUID primary keys for all tables
2. **Foreign Keys**: Indexes on all foreign key columns
3. **Query Patterns**: Indexes based on common query patterns
4. **Composite Indexes**: Multi-column indexes for complex queries

#### Performance Monitoring

```sql
-- Slow query analysis
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Query Examples

```typescript
// Efficient user lookup with roles
async function findUserWithRoles(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

// Paginated audit logs with filtering
async function findAuditLogs(params: {
  userId?: string;
  resource?: string;
  action?: string;
  page: number;
  limit: number;
}) {
  const { userId, resource, action, page, limit } = params;
  const skip = (page - 1) * limit;

  const where = {
    ...(userId && { userId }),
    ...(resource && { resource }),
    ...(action && { action }),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { timestamp: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    items: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

## Backup and Recovery

### Backup Strategy

#### Daily Backups

```bash
#!/bin/bash
# backup-database.sh

DB_NAME="blih-system"
DB_USER="postgres"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME > "$BACKUP_DIR/backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Remove old backups (keep 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

#### Point-in-Time Recovery

```bash
# Restore from backup
gunzip -c /backups/backup_20240101_000000.sql.gz | psql -h localhost -U postgres -d blih-system

# Or use pg_restore for custom format
pg_restore -h localhost -U postgres -d blih-system /backups/backup_20240101_000000.dump
```

### High Availability

#### Replication Setup

```sql
-- Primary server configuration
-- postgresql.conf
wal_level = replica
max_wal_senders = 3
wal_keep_segments = 64
archive_mode = on
archive_command = 'cp %p /archive/%f'

-- pg_hba.conf
host replication replicator 10.0.0.0/8 md5
```

#### Connection Pooling

```ini
# pgbouncer.ini
[databases]
blih-system = host=localhost port=5432 dbname=blih-system

[pgbouncer]
listen_port = 6432
listen_addr = 127.0.0.1
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
logfile = /var/log/pgbouncer/pgbouncer.log
admin_users = postgres
stats_users = stats, postgres
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 5
max_db_connections = 50
max_user_connections = 50
server_reset_query = DISCARD ALL
ignore_startup_parameters = extra_float_digits
track_extra_parameters = search_path
```

## Security

### Data Encryption

#### Column-Level Encryption

```sql
-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive data
INSERT INTO system_config (key, value, is_encrypted)
VALUES (
  'api_secret',
  pgp_sym_encrypt('super-secret-key', 'encryption-key'),
  true
);

-- Decrypt data
SELECT pgp_sym_decrypt(value::bytea, 'encryption-key') as decrypted_value
FROM system_config
WHERE key = 'api_secret';
```

#### Row-Level Security

```sql
-- Enable RLS on sensitive tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own audit logs
CREATE POLICY user_audit_logs ON audit_logs
    FOR ALL
    TO authenticated_user
    USING (user_id = current_setting('app.current_user_id')::uuid);

-- Set user context in application
await prisma.$executeRaw`SET app.current_user_id = ${userId}`;
```

### Access Control

#### Database Users

```sql
-- Application user (limited privileges)
CREATE USER blih_app WITH PASSWORD 'secure_password';

-- Grant necessary permissions
GRANT CONNECT ON DATABASE blih_system TO blih_app;
GRANT USAGE ON SCHEMA public TO blih_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO blih_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO blih_app;

-- Read-only user for reporting
CREATE USER blih_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE blih_system TO blih_readonly;
GRANT USAGE ON SCHEMA public TO blih_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO blih_readonly;
```

## Monitoring and Maintenance

### Performance Monitoring

```sql
-- Database statistics view
CREATE OR REPLACE VIEW db_stats AS
SELECT
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_tuples,
  n_dead_tup as dead_tuples,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables;

-- Index usage statistics
CREATE OR REPLACE VIEW index_stats AS
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes;
```

### Maintenance Tasks

```sql
-- Vacuum and analyze
VACUUM ANALYZE users;

-- Reindex fragmented indexes
REINDEX INDEX CONCURRENTLY idx_users_email;

-- Update table statistics
ANALYZE users;

-- Clean up old audit logs
DELETE FROM audit_logs
WHERE timestamp < NOW() - INTERVAL '90 days';
```

### Automated Maintenance

```typescript
// Maintenance job
@Injectable()
export class DatabaseMaintenanceJob {
  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 2 * * *') // Daily at 2 AM
  async performMaintenance() {
    await this.vacuumAndAnalyze();
    await this.cleanupOldData();
    await this.updateStatistics();
  }

  private async vacuumAndAnalyze() {
    const tables = ['users', 'audit_logs', 'notifications'];

    for (const table of tables) {
      await this.prisma.$executeRaw`VACUUM ANALYZE ${table}`;
    }
  }

  private async cleanupOldData() {
    // Clean up old audit logs
    await this.prisma.$executeRaw`
      DELETE FROM audit_logs 
      WHERE timestamp < NOW() - INTERVAL '90 days'
    `;

    // Clean up old notifications
    await this.prisma.$executeRaw`
      DELETE FROM notifications 
      WHERE created_at < NOW() - INTERVAL '1 year' 
      AND status = 'SENT'
    `;
  }

  private async updateStatistics() {
    await this.prisma.$executeRaw`ANALYZE`;
  }
}
```

## Troubleshooting

### Common Issues

#### Connection Problems

```bash
# Check connection
psql -h localhost -U postgres -d blih-system -c "SELECT 1;"

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Check for blocking queries
SELECT blocked_locks.pid AS blocked_pid,
       blocked_activity.usename AS blocked_user,
       blocking_locks.pid AS blocking_pid,
       blocking_activity.usename AS blocking_user,
       blocked_activity.query AS blocked_statement,
       blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

#### Performance Issues

```sql
-- Find slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC;

-- Check table sizes
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size,
  pg_size_pretty(pg_relation_size(tablename::regclass)) as table_size,
  pg_size_pretty(pg_total_relation_size(tablename::regclass) - pg_relation_size(tablename::regclass)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

#### Lock Issues

```sql
-- Current locks
SELECT
  relation::regclass AS table,
  mode,
  pid,
  granted
FROM pg_locks
WHERE NOT granted;

-- Kill blocking process
SELECT pg_terminate_backend(pid);
```

This database documentation provides comprehensive information about the BLIH System's database architecture, schema design, operations, and maintenance procedures.
