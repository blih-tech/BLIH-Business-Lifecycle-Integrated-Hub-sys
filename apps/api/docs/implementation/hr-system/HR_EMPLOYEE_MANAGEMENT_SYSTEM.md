# HR Employee Management & Records System Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Business Logic & Workflows](#business-logic--workflows)
6. [Integration Points](#integration-points)
7. [Security & Permissions](#security--permissions)
8. [Implementation Guidelines](#implementation-guidelines)
9. [Testing Procedures](#testing-procedures)
10. [Deployment Instructions](#deployment-instructions)
11. [Troubleshooting Guide](#troubleshooting-guide)

---

## System Overview

The HR Employee Management & Records System maintains comprehensive employee data throughout their employment lifecycle. This system handles employee profiles, onboarding automation, document management, contract lifecycle, and employee status transitions while ensuring data integrity and compliance.

### Key Features

- **Employee Profile Management:** Comprehensive employee data with profile completion tracking
- **Automated Onboarding:** Dynamic checklist generation based on role and department
- **Document Management:** Secure document upload, verification, and expiry tracking
- **Contract Lifecycle:** Automated contract management with renewal notifications
- **Employee Lifecycle:** Status transitions from onboarding to offboarding

### Business Objectives

- Achieve 95%+ complete employee profiles
- Reduce onboarding time to 3 days
- Maintain 98%+ verified documents
- Ensure 100% on-time contract renewals

---

## Architecture

### System Components

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Employee Portal]
        B[HR Dashboard]
        C[Manager Interface]
        D[Admin Panel]
    end

    subgraph "API Layer"
        E[Employee API]
        F[Onboarding API]
        G[Document API]
        H[Contract API]
    end

    subgraph "Service Layer"
        I[Profile Service]
        J[Onboarding Service]
        K[Document Service]
        L[Contract Service]
        M[Lifecycle Service]
    end

    subgraph "Data Layer"
        N[PostgreSQL Database]
        O[File Storage]
        P[Cache Layer]
    end

    subgraph "External Services"
        Q[Keycloak Auth]
        R[Email Service]
        S[E-signature Service]
        T[Notification Service]
    end

    A --> E
    B --> E
    C --> E
    D --> E
    E --> I
    F --> J
    G --> K
    H --> L
    I --> N
    J --> N
    K --> N
    L --> N
    M --> N
    K --> O
    L --> S
    E --> Q
    J --> R
    L --> T
```

### Component Responsibilities

| Component          | Responsibility                               | Key Technologies            |
| ------------------ | -------------------------------------------- | --------------------------- |
| Profile Service    | Employee data management and validation      | NestJS, TypeScript          |
| Onboarding Service | Automated checklist generation and tracking  | Workflow Engine             |
| Document Service   | File upload, validation, and expiry tracking | AWS S3, File Processing     |
| Contract Service   | Contract lifecycle and renewal management    | PDF Generation, E-signature |
| Lifecycle Service  | Employee status transitions and workflows    | State Machine               |

---

## Database Schema

### Core Tables

#### EmployeeProfile

```sql
CREATE TABLE employee_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) UNIQUE,
    department_id UUID REFERENCES departments(id),
    manager_id UUID REFERENCES users(id),

    -- Personal Information
    date_of_birth DATE,
    gender VARCHAR(20),
    nationality VARCHAR(100),
    marital_status VARCHAR(50),
    avatar_url VARCHAR(500),

    -- Contact Information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    personal_phone VARCHAR(50),
    personal_email VARCHAR(255),

    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relation VARCHAR(100),

    -- Job Information
    job_title VARCHAR(255) NOT NULL,
    job_grade VARCHAR(50),
    work_location VARCHAR(255),
    work_type VARCHAR(50),
    shift_hours VARCHAR(100),

    -- System Information
    profile_completion FLOAT DEFAULT 0,
    last_login_at TIMESTAMP,
    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_employee_profiles_user_id ON employee_profiles(user_id);
CREATE INDEX idx_employee_profiles_department ON employee_profiles(department_id);
CREATE INDEX idx_employee_profiles_manager ON employee_profiles(manager_id);
CREATE INDEX idx_employee_profiles_completion ON employee_profiles(profile_completion);
```

#### EmployeeDocument

```sql
CREATE TABLE employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employee_profiles(id) ON DELETE CASCADE,

    document_type VARCHAR(50) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_hash VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    is_mandatory BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'PENDING',

    -- Metadata
    uploaded_by UUID REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_employee_documents_employee ON employee_documents(employee_id);
CREATE INDEX idx_employee_documents_type ON employee_documents(employee_id, document_type);
CREATE INDEX idx_employee_documents_expiry ON employee_documents(expiry_date);
CREATE INDEX idx_employee_documents_status ON employee_documents(status);
```

#### OnboardingChecklist

```sql
CREATE TABLE onboarding_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employee_profiles(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(50) NOT NULL,
    assigned_to UUID REFERENCES users(id),
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'PENDING',

    -- Task details
    task_type VARCHAR(50) NOT NULL,
    task_data JSONB,

    -- Completion tracking
    completed_by UUID REFERENCES users(id),
    notes TEXT,
    attachments TEXT[],

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_onboarding_employee ON onboarding_checklists(employee_id);
CREATE INDEX idx_onboarding_status ON onboarding_checklists(status);
CREATE INDEX idx_onboarding_assigned ON onboarding_checklists(assigned_to, due_date);
CREATE INDEX idx_onboarding_department ON onboarding_checklists(department, status);
```

#### EmploymentContract

```sql
CREATE TABLE employment_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employee_profiles(id) ON DELETE CASCADE,

    contract_type VARCHAR(50) NOT NULL,
    contract_number VARCHAR(100) UNIQUE,

    -- Contract terms
    start_date DATE NOT NULL,
    end_date DATE,
    employment_type VARCHAR(50) NOT NULL,
    probation_months INTEGER DEFAULT 3,

    -- Compensation
    base_salary DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'ETB',
    pay_frequency VARCHAR(50) DEFAULT 'MONTHLY',
    allowances JSONB,
    bonus_eligible BOOLEAN DEFAULT FALSE,
    bonus_rate DECIMAL(5,2),

    -- Work terms
    work_hours INTEGER DEFAULT 40,
    work_days VARCHAR(50) DEFAULT 'MON-FRI',
    work_location VARCHAR(255),
    work_type VARCHAR(50),

    -- Benefits
    benefits JSONB,
    leave_entitlement JSONB,

    -- Document management
    contract_url VARCHAR(500) NOT NULL,
    signed_url VARCHAR(500),
    signature_date DATE,

    -- Status
    status VARCHAR(50) DEFAULT 'DRAFT',
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contracts_employee ON employment_contracts(employee_id);
CREATE INDEX idx_contracts_status ON employment_contracts(status);
CREATE INDEX idx_contracts_end_date ON employment_contracts(end_date);
CREATE INDEX idx_contracts_type ON employment_contracts(contract_type);
```

### Entity Relationships

```mermaid
erDiagram
    EmployeeProfile ||--o{ EmployeeDocument : "has many"
    EmployeeProfile ||--o{ OnboardingChecklist : "has many"
    EmployeeProfile ||--o{ EmploymentContract : "has many"
    EmployeeProfile }o--|| Department : "belongs to"
    EmployeeProfile }o--|| User : "linked to"
    EmployeeProfile }o--|| User : "managed by"
    EmployeeDocument }o--|| User : "uploaded by"
    EmployeeDocument }o--|| User : "verified by"
    OnboardingChecklist }o--|| User : "assigned to"
    EmploymentContract }o--|| User : "created by"
    EmploymentContract }o--|| User : "approved by"
```

---

## API Endpoints

### Employee Profile Endpoints

#### GET /api/hr/employees

List employees with filtering and search.

**Query Parameters:**

- `departmentId`: Filter by department
- `status`: Filter by employment status
- `jobTitle`: Filter by job title
- `search`: Search by name or employee code
- `page`: Pagination page number
- `limit`: Items per page

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "employeeCode": "EMP001",
      "user": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@company.com"
      },
      "jobTitle": "Software Engineer",
      "department": {
        "id": "uuid",
        "name": "Engineering"
      },
      "profileCompletion": 85,
      "status": "ACTIVE",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### GET /api/hr/employees/:id

Get detailed employee profile.

#### PUT /api/hr/employees/:id

Update employee profile information.

**Request Body:**

```json
{
  "personalInfo": {
    "dateOfBirth": "1990-05-15",
    "gender": "MALE",
    "nationality": "Ethiopian",
    "maritalStatus": "SINGLE"
  },
  "contactInfo": {
    "addressLine1": "123 Main St",
    "city": "Addis Ababa",
    "country": "Ethiopia",
    "postalCode": "1000",
    "personalPhone": "+251911234567"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+251911234568",
    "relation": "Spouse"
  },
  "jobInfo": {
    "jobTitle": "Senior Software Engineer",
    "workLocation": "Addis Ababa Office",
    "workType": "HYBRID"
  }
}
```

#### POST /api/hr/employees/:id/avatar

Upload employee avatar photo.

#### GET /api/hr/employees/:id/completion

Get profile completion status with missing fields.

### Onboarding Endpoints

#### POST /api/hr/employees/:id/onboarding

Start onboarding process for new employee.

**Request Body:**

```json
{
  "hireDate": "2026-03-01",
  "employmentType": "FULL_TIME",
  "departmentId": "uuid",
  "jobTitle": "Software Engineer",
  "managerId": "uuid",
  "workLocation": "Addis Ababa Office"
}
```

**Response:**

```json
{
  "employeeId": "uuid",
  "checklistGenerated": true,
  "totalTasks": 15,
  "tasksByDepartment": {
    "HR": 5,
    "IT": 4,
    "ADMIN": 3,
    "FINANCE": 2,
    "TEAM": 1
  },
  "estimatedCompletion": "2026-03-04",
  "tasks": [
    {
      "id": "uuid",
      "title": "Create email account",
      "department": "IT",
      "assignedTo": "it-manager@company.com",
      "dueDate": "2026-02-29T09:00:00Z",
      "priority": "HIGH",
      "taskType": "ACCESS"
    }
  ]
}
```

#### GET /api/hr/employees/:id/onboarding/checklist

Get onboarding checklist status.

#### PUT /api/hr/employees/:id/onboarding/tasks/:taskId

Update onboarding task status.

**Request Body:**

```json
{
  "status": "COMPLETED",
  "notes": "Email account created successfully",
  "attachments": ["https://storage.example.com/email-setup.pdf"],
  "completedAt": "2026-02-28T10:30:00Z"
}
```

#### GET /api/hr/onboarding/dashboard

Get onboarding dashboard with statistics.

### Document Management Endpoints

#### POST /api/hr/employees/:id/documents

Upload employee document.

**Request Body (multipart/form-data):**

```
file: [binary file data]
documentType: "PASSPORT"
documentName: "John Doe Passport"
issueDate: "2020-01-15"
expiryDate: "2025-01-15"
isMandatory: true
```

**Response:**

```json
{
  "id": "uuid",
  "documentType": "PASSPORT",
  "documentName": "John Doe Passport",
  "fileUrl": "https://storage.example.com/documents/passport.pdf",
  "fileHash": "sha256:abc123...",
  "issueDate": "2020-01-15",
  "expiryDate": "2025-01-15",
  "isMandatory": true,
  "status": "PENDING_VERIFICATION",
  "uploadedAt": "2026-02-27T10:00:00Z"
}
```

#### GET /api/hr/employees/:id/documents

List employee documents.

#### PUT /api/hr/employees/:id/documents/:documentId/verify

Verify employee document.

**Request Body:**

```json
{
  "status": "VERIFIED",
  "notes": "Document verified and authentic",
  "verifiedAt": "2026-02-27T11:00:00Z"
}
```

#### GET /api/hr/documents/expiring

Get list of documents expiring soon.

### Contract Management Endpoints

#### POST /api/hr/employees/:id/contracts

Create new employment contract.

**Request Body:**

```json
{
  "contractType": "INITIAL",
  "startDate": "2026-03-01",
  "endDate": "2027-02-28",
  "employmentType": "FULL_TIME",
  "probationMonths": 3,
  "baseSalary": 60000,
  "currency": "ETB",
  "payFrequency": "MONTHLY",
  "allowances": {
    "housing": 2000,
    "transport": 500
  },
  "bonusEligible": true,
  "bonusRate": 10,
  "workHours": 40,
  "workDays": "MON-FRI",
  "workLocation": "Addis Ababa Office",
  "benefits": {
    "healthInsurance": true,
    "retirement": true
  },
  "leaveEntitlement": {
    "annual": 21,
    "sick": 10,
    "maternity": 90
  }
}
```

#### GET /api/hr/employees/:id/contracts

List employee contracts.

#### POST /api/hr/contracts/:id/sign

Initiate contract signing process.

#### POST /api/hr/contracts/:id/approve

Approve employment contract.

#### GET /api/hr/contracts/renewals

Get contracts due for renewal.

### Lifecycle Management Endpoints

#### PUT /api/hr/employees/:id/status

Update employee lifecycle status.

**Request Body:**

```json
{
  "status": "ACTIVE",
  "reason": "Probation completed successfully",
  "effectiveDate": "2026-06-01",
  "notes": "Employee confirmed in current role"
}
```

#### GET /api/hr/employees/:id/lifecycle

Get employee lifecycle history.

#### GET /api/hr/lifecycle/dashboard

Get lifecycle management dashboard.

---

## Business Logic & Workflows

### Profile Completion Calculation

```typescript
interface ProfileCompletion {
  total: number;
  sections: {
    personal: number;
    contact: number;
    job: number;
    emergency: number;
    documents: number;
  };
  missingFields: string[];
}

function calculateProfileCompletion(employee: EmployeeProfile): ProfileCompletion {
  const sections = {
    personal: this.checkPersonalSection(employee),
    contact: this.checkContactSection(employee),
    job: this.checkJobSection(employee),
    emergency: this.checkEmergencySection(employee),
    documents: this.checkDocumentsSection(employee)
  };

  const weights = {
    personal: 0.25,
    contact: 0.20,
    job: 0.25,
    emergency: 0.10,
    documents: 0.20
  };

  const total = Object.entries(sections).reduce((sum, [section, complete]) => {
    return sum + (complete ? weights[section] * 100 : 0);
  }, 0);

  const missingFields = this.identifyMissingFields(employee);

  return {
    total: Math.round(total),
    sections,
    missingFields
  };
}

private checkPersonalSection(employee: EmployeeProfile): boolean {
  return !!(
    employee.dateOfBirth &&
    employee.gender &&
    employee.nationality &&
    employee.maritalStatus
  );
}

private checkContactSection(employee: EmployeeProfile): boolean {
  return !!(
    employee.addressLine1 &&
    employee.city &&
    employee.country &&
    employee.postalCode &&
    employee.personalPhone
  );
}
```

### Onboarding Checklist Generation

```typescript
interface OnboardingTask {
  title: string;
  description?: string;
  department: string;
  assignedTo: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDays: number;
  taskType: 'DOCUMENT' | 'ACCESS' | 'EQUIPMENT' | 'TRAINING' | 'MEETING';
  dependencies?: string[];
}

function generateOnboardingChecklist(employee: EmployeeProfile): OnboardingTask[] {
  const tasks = [];

  // Universal tasks for all employees
  tasks.push(...this.getUniversalTasks());

  // Employment type specific tasks
  tasks.push(...this.getEmploymentTypeTasks(employee.employmentType));

  // Role specific tasks
  tasks.push(...this.getRoleSpecificTasks(employee.jobTitle));

  // Department specific tasks
  tasks.push(...this.getDepartmentTasks(employee.departmentId));

  return tasks.map(task => ({
    ...task,
    employeeId: employee.id,
    dueDate: this.calculateDueDate(employee.hireDate, task.dueDays),
    assignedTo: this.assignTaskToDepartment(task.department)
  }));
}

private getUniversalTasks(): OnboardingTask[] {
  return [
    {
      title: 'Create email account',
      department: 'IT',
      dueDays: -1, // Due before start date
      priority: 'HIGH',
      taskType: 'ACCESS'
    },
    {
      title: 'Prepare workstation',
      department: 'ADMIN',
      dueDays: -1,
      priority: 'HIGH',
      taskType: 'EQUIPMENT'
    },
    {
      title: 'Add to payroll system',
      department: 'HR',
      dueDays: 0,
      priority: 'HIGH',
      taskType: 'SYSTEM'
    },
    {
      title: 'Issue access card',
      department: 'ADMIN',
      dueDays: 0,
      priority: 'MEDIUM',
      taskType: 'EQUIPMENT'
    },
    {
      title: 'Sign employment contract',
      department: 'HR',
      dueDays: 1,
      priority: 'HIGH',
      taskType: 'DOCUMENT'
    },
    {
      title: 'Company orientation',
      department: 'HR',
      dueDays: 3,
      priority: 'MEDIUM',
      taskType: 'TRAINING'
    }
  ];
}

private getEmploymentTypeTasks(employmentType: string): OnboardingTask[] {
  const taskMap = {
    'FULL_TIME': [
      {
        title: 'Enroll in benefits program',
        department: 'HR',
        dueDays: 5,
        priority: 'MEDIUM',
        taskType: 'DOCUMENT'
      }
    ],
    'CONTRACT': [
      {
        title: 'Verify contract terms',
        department: 'HR',
        dueDays: 1,
        priority: 'HIGH',
        taskType: 'DOCUMENT'
      }
    ],
    'INTERN': [
      {
        title: 'Assign mentor',
        department: 'TEAM',
        dueDays: 2,
        priority: 'MEDIUM',
        taskType: 'MEETING'
      }
    ]
  };

  return taskMap[employmentType] || [];
}
```

### Document Expiry Tracking

```typescript
@Injectable()
export class DocumentExpiryService {
  @Cron('0 9 * * *') // Daily at 9 AM
  async checkDocumentExpiries(): Promise<void> {
    const expiringSoon = await this.findExpiringDocuments(30); // Next 30 days

    for (const document of expiringSoon) {
      const daysUntilExpiry = this.differenceInDays(
        document.expiryDate,
        new Date(),
      );

      if (daysUntilExpiry === 30) {
        await this.sendExpiryNotification(document, '30_DAYS');
      } else if (daysUntilExpiry === 7) {
        await this.sendExpiryNotification(document, '7_DAYS');
      } else if (daysUntilExpiry <= 0) {
        await this.handleExpiredDocument(document);
      }
    }
  }

  private async sendExpiryNotification(
    document: EmployeeDocument,
    timeframe: string,
  ): Promise<void> {
    const employee = await this.employeeService.findById(document.employeeId);

    await this.notificationService.send({
      recipientId: document.employeeId,
      type: 'DOCUMENT_EXPIRING',
      title: `Document Expiring Soon: ${document.documentName}`,
      body: `Your ${document.documentType} document will expire in ${timeframe}. Please update it to avoid any issues.`,
      priority: timeframe === '7_DAYS' ? 'HIGH' : 'MEDIUM',
      data: {
        documentId: document.id,
        documentType: document.documentType,
        expiryDate: document.expiryDate,
      },
    });

    // Notify HR if mandatory document
    if (document.isMandatory) {
      await this.notificationService.send({
        recipientId: this.getHRManagerId(),
        type: 'MANDATORY_DOCUMENT_EXPIRING',
        title: `Mandatory Document Expiring: ${employee.employeeCode}`,
        body: `${employee.firstName} ${employee.lastName}'s ${document.documentType} expires in ${timeframe}`,
        priority: 'HIGH',
      });
    }
  }

  private async handleExpiredDocument(
    document: EmployeeDocument,
  ): Promise<void> {
    // Update document status
    document.status = 'EXPIRED';
    await document.save();

    // Notify employee and HR
    await this.notificationService.send({
      recipientId: document.employeeId,
      type: 'DOCUMENT_EXPIRED',
      title: `Document Expired: ${document.documentName}`,
      body: `Your ${document.documentType} document has expired. Please update it immediately.`,
      priority: 'HIGH',
    });

    // Check if this affects employment
    if (document.isMandatory && document.documentType === 'WORK_PERMIT') {
      await this.handleWorkPermitExpiry(document.employeeId);
    }
  }
}
```

### Contract Renewal Workflow

```typescript
@Injectable()
export class ContractRenewalService {
  @Cron('0 10 * * *') // Daily at 10 AM
  async checkContractRenewals(): Promise<void> {
    const renewalsDue = await this.findContractsExpiringIn(90); // 90 days notice

    for (const contract of renewalsDue) {
      const daysUntilExpiry = this.differenceInDays(
        contract.endDate,
        new Date(),
      );

      if (daysUntilExpiry === 90) {
        await this.initiateRenewalProcess(contract);
      } else if (daysUntilExpiry === 30) {
        await this.sendRenewalReminder(contract);
      } else if (daysUntilExpiry === 7) {
        await this.escalateRenewalUrgency(contract);
      }
    }
  }

  private async initiateRenewalProcess(
    contract: EmploymentContract,
  ): Promise<void> {
    // Create renewal task for HR
    await this.taskService.create({
      title: `Contract Renewal: ${contract.employee.employeeCode}`,
      assignedTo: this.getHRManagerId(),
      dueDate: this.addDays(contract.endDate, -30),
      priority: 'HIGH',
      taskData: {
        contractId: contract.id,
        employeeId: contract.employeeId,
        action: 'RENEWAL',
      },
    });

    // Notify manager
    await this.notificationService.send({
      recipientId: contract.employee.managerId,
      type: 'CONTRACT_RENEWAL_DUE',
      title: `Contract renewal needed for ${contract.employee.employeeCode}`,
      body: `${contract.employee.firstName} ${contract.employee.lastName}'s contract expires on ${contract.endDate}. Please provide feedback for renewal.`,
      priority: 'MEDIUM',
    });

    // Create performance review if needed
    const recentReview = await this.getRecentPerformanceReview(
      contract.employeeId,
    );
    if (
      !recentReview ||
      this.differenceInDays(new Date(), recentReview.createdAt) > 90
    ) {
      await this.initiatePerformanceReview(
        contract.employeeId,
        'CONTRACT_RENEWAL',
      );
    }
  }

  async processContractRenewal(
    contractId: string,
    renewalData: ContractRenewalData,
  ): Promise<EmploymentContract> {
    const existingContract = await this.findById(contractId);
    const employee = existingContract.employee;

    // Validate renewal authority
    await this.validateRenewalAuthority(
      renewalData.approvedBy,
      existingContract,
    );

    // Create new contract
    const newContract = await this.create({
      employeeId: existingContract.employeeId,
      contractType: 'RENEWAL',
      contractNumber: this.generateContractNumber(),
      startDate: existingContract.endDate,
      endDate: renewalData.endDate,
      employmentType: existingContract.employmentType,
      baseSalary: renewalData.newSalary || existingContract.baseSalary,
      currency: existingContract.currency,
      payFrequency: existingContract.payFrequency,
      allowances: renewalData.allowances || existingContract.allowances,
      bonusEligible:
        renewalData.bonusEligible ?? existingContract.bonusEligible,
      bonusRate: renewalData.bonusRate || existingContract.bonusRate,
      workHours: existingContract.workHours,
      workDays: existingContract.workDays,
      workLocation: renewalData.workLocation || existingContract.workLocation,
      benefits: renewalData.benefits || existingContract.benefits,
      leaveEntitlement:
        renewalData.leaveEntitlement || existingContract.leaveEntitlement,
      status: 'DRAFT',
      createdBy: renewalData.approvedBy,
    });

    // Update old contract status
    await this.update(contractId, {
      status: 'EXPIRED',
      isActive: false,
    });

    // Initiate signing process
    await this.initiateContractSigning(newContract);

    return newContract;
  }
}
```

### Employee Lifecycle Management

```typescript
@Injectable()
export class EmployeeLifecycleService {
  async updateEmployeeStatus(
    employeeId: string,
    newStatus: LifecycleStatus,
    context: StatusUpdateContext,
  ): Promise<void> {
    const employee = await this.employeeService.findById(employeeId);
    const currentStatus = employee.lifecycle?.status;

    // Validate transition
    if (!this.isValidTransition(currentStatus, newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }

    // Handle specific transitions
    switch (newStatus) {
      case 'ONBOARDING':
        await this.handleOnboardingStart(employeeId, context);
        break;
      case 'ACTIVE':
        await this.handleActivation(employeeId, context);
        break;
      case 'SUSPENDED':
        await this.handleSuspension(employeeId, context);
        break;
      case 'TERMINATED':
        await this.handleTermination(employeeId, context);
        break;
      case 'RESIGNED':
        await this.handleResignation(employeeId, context);
        break;
    }

    // Update status
    await this.lifecycleRepository.update({
      userId: employeeId,
      status: newStatus,
      [`${newStatus.toLowerCase()}At`]: new Date(),
      ...context,
    });

    // Audit log
    await this.auditService.log({
      action: 'EMPLOYEE_STATUS_CHANGE',
      resource: 'Employee',
      resourceId: employeeId,
      before: { status: currentStatus },
      after: { status: newStatus },
      metadata: context,
    });

    // Send notifications
    await this.sendStatusChangeNotifications(employee, newStatus, context);
  }

  private async handleOnboardingStart(
    employeeId: string,
    context: StatusUpdateContext,
  ): Promise<void> {
    // Generate onboarding checklist
    await this.onboardingService.generateChecklist(employeeId);

    // Send welcome notifications
    await this.notificationService.send({
      recipientId: employeeId,
      type: 'WELCOME',
      title: 'Welcome to the Company!',
      body: 'Your onboarding process has begun. Check your dashboard for tasks.',
      priority: 'HIGH',
    });

    // Notify IT and Admin departments
    await this.notifyDepartments('ONBOARDING_START', employeeId);
  }

  private async handleActivation(
    employeeId: string,
    context: StatusUpdateContext,
  ): Promise<void> {
    // Complete onboarding tasks
    await this.onboardingService.completeOnboarding(employeeId);

    // Update system access
    await this.accessService.grantFullAccess(employeeId);

    // Add to active payroll
    await this.payrollService.activateEmployee(employeeId);

    // Schedule performance review
    await this.performanceService.scheduleInitialReview(employeeId);
  }

  private async handleTermination(
    employeeId: string,
    context: StatusUpdateContext,
  ): Promise<void> {
    // Initiate offboarding process
    await this.offboardingService.initiateOffboarding(employeeId);

    // Revoke system access (schedule for end date)
    await this.accessService.scheduleAccessRevocation(
      employeeId,
      context.effectiveDate,
    );

    // Process final payroll
    await this.payrollService.processFinalPayroll(employeeId);

    // Archive employee data
    await this.archiveEmployeeData(employeeId);
  }

  private isValidTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions = {
      DRAFT: ['ONBOARDING'],
      ONBOARDING: ['ACTIVE', 'SUSPENDED', 'TERMINATED'],
      ACTIVE: ['SUSPENDED', 'ON_LEAVE', 'RESIGNED', 'TERMINATED', 'RETIRED'],
      SUSPENDED: ['ACTIVE', 'TERMINATED'],
      ON_LEAVE: ['ACTIVE', 'RESIGNED', 'TERMINATED'],
      RESIGNED: ['TERMINATED'],
      TERMINATED: [],
      RETIRED: [],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
```

---

## Integration Points

### Internal System Integrations

#### Keycloak User Synchronization

```typescript
@Injectable()
export class EmployeeKeycloakService {
  async syncEmployeeToKeycloak(employee: EmployeeProfile): Promise<void> {
    const keycloakAdmin = await this.getKeycloakAdminClient();

    // Update user attributes
    await keycloakAdmin.users.update({
      id: employee.userId,
      realm: 'blih-hr',
      attributes: {
        employee_code: [employee.employeeCode],
        job_title: [employee.jobTitle],
        department: [employee.department.name],
        manager: [employee.manager?.email || ''],
        employee_status: [employee.lifecycle?.status || 'DRAFT'],
      },
    });

    // Assign role-based groups
    await this.assignRoleGroups(employee, keycloakAdmin);

    // Update department groups
    await this.updateDepartmentGroups(employee, keycloakAdmin);
  }

  private async assignRoleGroups(
    employee: EmployeeProfile,
    keycloakAdmin: any,
  ): Promise<void> {
    const groups = [];

    // Add to employee base group
    groups.push({ name: 'employees' });

    // Add to management group if applicable
    if (employee.subordinates?.length > 0) {
      groups.push({ name: 'managers' });
    }

    // Add to department group
    groups.push({ name: `dept-${employee.department.name.toLowerCase()}` });

    // Add to job level group
    if (employee.jobGrade) {
      groups.push({ name: `grade-${employee.jobGrade.toLowerCase()}` });
    }

    await keycloakAdmin.users.addToGroups({
      id: employee.userId,
      realm: 'blih-hr',
      groups,
    });
  }
}
```

#### Finance System Integration

```typescript
@Injectable()
export class EmployeeFinanceService {
  async createEmployeeInFinance(
    employee: EmployeeProfile,
    contract: EmploymentContract,
  ): Promise<void> {
    await this.financeService.createEmployee({
      employeeId: employee.id,
      employeeCode: employee.employeeCode,
      firstName: employee.user.firstName,
      lastName: employee.user.lastName,
      email: employee.user.email,
      departmentId: employee.departmentId,
      jobTitle: employee.jobTitle,
      startDate: contract.startDate,
      salary: contract.baseSalary,
      currency: contract.currency,
      payFrequency: contract.payFrequency,
      allowances: contract.allowances,
      bonusEligible: contract.bonusEligible,
      bonusRate: contract.bonusRate,
      bankAccount: employee.bankAccount,
    });
  }

  async updateSalaryInFinance(
    employeeId: string,
    newSalary: number,
    effectiveDate: Date,
  ): Promise<void> {
    await this.financeService.updateEmployeeSalary({
      employeeId,
      newSalary,
      effectiveDate,
      reason: 'Contract renewal',
    });
  }

  async processTerminationInFinance(
    employeeId: string,
    terminationDate: Date,
  ): Promise<void> {
    await this.financeService.processEmployeeTermination({
      employeeId,
      terminationDate,
      finalPayrollDate: this.calculateFinalPayrollDate(terminationDate),
      severancePackage: await this.calculateSeverance(employeeId),
    });
  }
}
```

### External System Integrations

#### E-signature Service Integration

```typescript
@Injectable()
export class ContractSigningService {
  async initiateContractSigning(contract: EmploymentContract): Promise<string> {
    const signingService = new DocuSignService({
      clientId: process.env.DOCUSIGN_CLIENT_ID,
      clientSecret: process.env.DOCUSIGN_CLIENT_SECRET,
      basePath: process.env.DOCUSIGN_BASE_URL,
    });

    // Create envelope
    const envelopeDefinition = {
      emailSubject: `Employment Contract - ${contract.employee.firstName} ${contract.employee.lastName}`,
      documents: [
        {
          documentBase64: await this.getContractPDF(contract),
          name: `Employment_Contract_${contract.contractNumber}.pdf`,
          fileExtension: 'pdf',
          documentId: '1',
        },
      ],
      recipients: {
        signers: [
          {
            email: contract.employee.user.email,
            name: `${contract.employee.firstName} ${contract.employee.lastName}`,
            recipientId: '1',
            routingOrder: '1',
            tabs: {
              signHereTabs: [
                {
                  documentId: '1',
                  pageNumber: '1',
                  xPosition: '100',
                  yPosition: '200',
                },
              ],
            },
          },
        ],
      },
      status: 'sent',
    };

    const envelope = await signingService.envelopes.createEnvelope({
      accountId: process.env.DOCUSIGN_ACCOUNT_ID,
      envelopeDefinition,
    });

    // Update contract with signing details
    await this.contractService.update(contract.id, {
      signingEnvelopeId: envelope.envelopeId,
      signingStatus: 'PENDING',
    });

    return envelope.envelopeId;
  }

  async handleSigningCallback(
    envelopeId: string,
    status: string,
  ): Promise<void> {
    const contract = await this.contractService.findByEnvelopeId(envelopeId);

    if (status === 'completed') {
      // Get signed document
      const signedDoc = await this.getSignedDocument(envelopeId);

      // Update contract
      await this.contractService.update(contract.id, {
        status: 'SIGNED',
        signedUrl: signedDoc.url,
        signatureDate: new Date(),
        signingStatus: 'COMPLETED',
      });

      // Activate employee if this is initial contract
      if (contract.contractType === 'INITIAL') {
        await this.lifecycleService.updateEmployeeStatus(
          contract.employeeId,
          'ACTIVE',
          { reason: 'Contract signed' },
        );
      }
    }
  }
}
```

#### File Storage Integration

```typescript
@Injectable()
export class DocumentStorageService {
  private s3Client: S3;
  private bucketName = process.env.AWS_S3_BUCKET;

  constructor() {
    this.s3Client = new S3({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadDocument(
    file: Buffer,
    filename: string,
    metadata: DocumentMetadata,
  ): Promise<DocumentUploadResult> {
    const key = this.generateDocumentKey(
      metadata.employeeId,
      metadata.documentType,
      filename,
    );

    // Calculate file hash
    const hash = crypto.createHash('sha256').update(file).digest('hex');

    // Check for duplicates
    const existing = await this.findDocumentByHash(hash);
    if (existing) {
      throw new ConflictException('Document already exists');
    }

    // Upload to S3
    const uploadResult = await this.s3Client
      .upload({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: this.getContentType(filename),
        Metadata: {
          employeeId: metadata.employeeId,
          documentType: metadata.documentType,
          originalName: filename,
          uploadedBy: metadata.uploadedBy,
          uploadDate: new Date().toISOString(),
        },
      })
      .promise();

    // Generate presigned URL for immediate access
    const url = this.s3Client.getSignedUrl('getObject', {
      Bucket: this.bucketName,
      Key: key,
      Expires: 3600, // 1 hour
    });

    return {
      url: uploadResult.Location,
      key,
      hash,
      size: file.length,
      presignedUrl: url,
    };
  }

  private generateDocumentKey(
    employeeId: string,
    documentType: string,
    filename: string,
  ): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `documents/${employeeId}/${documentType}/${timestamp}_${sanitizedName}`;
  }

  async verifyDocumentIntegrity(documentId: string): Promise<IntegrityResult> {
    const document = await this.documentService.findById(documentId);

    // Get file from S3
    const object = await this.s3Client
      .getObject({
        Bucket: this.bucketName,
        Key: document.fileUrl.split('/').pop(),
      })
      .promise();

    // Calculate hash
    const currentHash = crypto
      .createHash('sha256')
      .update(object.Body as Buffer)
      .digest('hex');

    return {
      isValid: currentHash === document.fileHash,
      currentHash,
      storedHash: document.fileHash,
      verifiedAt: new Date(),
    };
  }
}
```

---

## Security & Permissions

### Permission Matrix

| Permission                      | HR Manager | Manager   | Employee | Admin |
| ------------------------------- | ---------- | --------- | -------- | ----- |
| `hr:employee:profile:view`      | ✅         | ✅ (team) | ✅ (own) | ✅    |
| `hr:employee:profile:update`    | ✅         | ✅ (team) | ✅ (own) | ✅    |
| `hr:employee:profile:create`    | ✅         | ❌        | ❌       | ✅    |
| `hr:employee:documents:view`    | ✅         | ✅ (team) | ✅ (own) | ✅    |
| `hr:employee:documents:upload`  | ✅         | ✅ (team) | ✅ (own) | ✅    |
| `hr:employee:documents:verify`  | ✅         | ❌        | ❌       | ✅    |
| `hr:employee:contract:view`     | ✅         | ✅ (team) | ✅ (own) | ✅    |
| `hr:employee:contract:create`   | ✅         | ❌        | ❌       | ✅    |
| `hr:employee:contract:approve`  | ✅         | ❌        | ❌       | ✅    |
| `hr:employee:onboarding:manage` | ✅         | ✅ (team) | ❌       | ✅    |
| `hr:employee:lifecycle:update`  | ✅         | ❌        | ❌       | ✅    |

### Data Protection Measures

#### Personal Data Encryption

```typescript
@Injectable()
export class EmployeeDataProtection {
  private encryptionKey = process.env.EMPLOYEE_DATA_KEY;

  async encryptSensitiveFields(
    employee: EmployeeProfile,
  ): Promise<EmployeeProfile> {
    const sensitiveFields = [
      'personalPhone',
      'personalEmail',
      'addressLine1',
      'city',
      'postalCode',
    ];
    const encrypted = { ...employee };

    for (const field of sensitiveFields) {
      if (employee[field]) {
        encrypted[field] = await this.encrypt(employee[field]);
      }
    }

    return encrypted;
  }

  async decryptSensitiveFields(
    encrypted: EmployeeProfile,
  ): Promise<EmployeeProfile> {
    const sensitiveFields = [
      'personalPhone',
      'personalEmail',
      'addressLine1',
      'city',
      'postalCode',
    ];
    const decrypted = { ...encrypted };

    for (const field of sensitiveFields) {
      if (encrypted[field]) {
        decrypted[field] = await this.decrypt(encrypted[field]);
      }
    }

    return decrypted;
  }

  private async encrypt(text: string): Promise<string> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    cipher.setAutoPadding(true);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  private async decrypt(encryptedText: string): Promise<string> {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    decipher.setAutoPadding(true);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

#### Access Control

```typescript
@Injectable()
export class EmployeeAccessControl {
  async canViewProfile(
    requesterId: string,
    targetEmployeeId: string,
  ): Promise<boolean> {
    // Can always view own profile
    if (requesterId === targetEmployeeId) {
      return true;
    }

    const requester = await this.userService.findById(requesterId);
    const targetEmployee =
      await this.employeeService.findById(targetEmployeeId);

    // HR managers can view all profiles
    if (this.hasRole(requester, 'HR_MANAGER')) {
      return true;
    }

    // Managers can view their team profiles
    if (this.hasRole(requester, 'MANAGER')) {
      return await this.isTeamMember(requesterId, targetEmployeeId);
    }

    return false;
  }

  async canUpdateProfile(
    requesterId: string,
    targetEmployeeId: string,
  ): Promise<boolean> {
    // Can always update own profile (restricted fields)
    if (requesterId === targetEmployeeId) {
      return true;
    }

    const requester = await this.userService.findById(requesterId);

    // HR managers can update all profiles
    if (this.hasRole(requester, 'HR_MANAGER')) {
      return true;
    }

    // Managers can update team profiles (limited fields)
    if (this.hasRole(requester, 'MANAGER')) {
      return await this.isTeamMember(requesterId, targetEmployeeId);
    }

    return false;
  }

  private async isTeamMember(
    managerId: string,
    employeeId: string,
  ): Promise<boolean> {
    const teamMembers = await this.employeeService.findTeamMembers(managerId);
    return teamMembers.some((member) => member.id === employeeId);
  }
}
```

---

## Implementation Guidelines

### Development Environment Setup

#### Prerequisites

```bash
# Node.js 18+ required
node --version

# PostgreSQL 14+ required
psql --version

# Redis for caching
redis-server --version

# AWS CLI for S3 operations
aws --version

# Environment setup
cp .env.example .env
# Configure environment variables
```

#### Database Setup

```bash
# Create database
createdb blih_hr_employee

# Run migrations
npm run migration:run

# Seed data
npm run seed:employee
```

### Code Organization Patterns

#### Service Layer Structure

```typescript
@Injectable()
export class EmployeeProfileService {
  constructor(
    @InjectRepository(EmployeeProfile)
    private employeeRepository: Repository<EmployeeProfile>,
    private documentService: EmployeeDocumentService,
    private notificationService: NotificationService,
    private auditService: AuditService,
    private encryptionService: EmployeeDataProtection,
  ) {}

  async createProfile(
    createDto: CreateEmployeeProfileDto,
    userId: string,
  ): Promise<EmployeeProfile> {
    // Generate employee code
    const employeeCode = await this.generateEmployeeCode();

    // Create profile
    const profile = this.employeeRepository.create({
      ...createDto,
      userId,
      employeeCode,
      profileCompletion: 0,
    });

    // Save profile
    const savedProfile = await this.employeeRepository.save(profile);

    // Generate onboarding checklist if new hire
    if (createDto.isNewHire) {
      await this.onboardingService.generateChecklist(savedProfile.id);
    }

    // Audit log
    await this.auditService.logAction('CREATE', savedProfile.id, userId);

    // Send notifications
    await this.notificationService.sendProfileCreationNotification(
      savedProfile,
    );

    return savedProfile;
  }

  async updateProfile(
    id: string,
    updateDto: UpdateEmployeeProfileDto,
    userId: string,
  ): Promise<EmployeeProfile> {
    const existing = await this.findById(id);

    // Validate permissions
    await this.accessControl.canUpdateProfile(userId, id);

    // Filter updateable fields based on user role
    const filteredDto = await this.filterUpdateableFields(updateDto, userId);

    // Update profile
    const updated = await this.employeeRepository.save({
      ...existing,
      ...filteredDto,
      updatedAt: new Date(),
    });

    // Recalculate completion
    updated.profileCompletion = this.calculateProfileCompletion(updated);
    await this.employeeRepository.save(updated);

    // Audit log
    await this.auditService.logAction('UPDATE', id, userId, {
      before: existing,
      after: updated,
    });

    return updated;
  }
}
```

#### DTO Validation Patterns

```typescript
export class CreateEmployeeProfileDto {
  @IsUUID()
  userId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  jobTitle: string;

  @IsUUID()
  departmentId: string;

  @IsUUID()
  @IsOptional()
  managerId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  workLocation?: string;

  @IsEnum(WorkType)
  @IsOptional()
  workType?: WorkType;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  shiftHours?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  jobGrade?: string;

  @IsBoolean()
  @IsOptional()
  isNewHire?: boolean = false;
}

export class UpdateEmployeeProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  jobTitle?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  workLocation?: string;

  @IsEnum(WorkType)
  @IsOptional()
  workType?: WorkType;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  shiftHours?: string;

  @ValidateNested()
  @Type(() => PersonalInfoDto)
  @IsOptional()
  personalInfo?: PersonalInfoDto;

  @ValidateNested()
  @Type(() => ContactInfoDto)
  @IsOptional()
  contactInfo?: ContactInfoDto;

  @ValidateNested()
  @Type(() => EmergencyContactDto)
  @IsOptional()
  emergencyContact?: EmergencyContactDto;
}
```

---

## Testing Procedures

### Unit Testing Example

```typescript
describe('EmployeeProfileService', () => {
  let service: EmployeeProfileService;
  let repository: Repository<EmployeeProfile>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EmployeeProfileService,
        {
          provide: getRepositoryToken(EmployeeProfile),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EmployeeProfileService>(EmployeeProfileService);
    repository = module.get<Repository<EmployeeProfile>>(
      getRepositoryToken(EmployeeProfile),
    );
  });

  describe('createProfile', () => {
    it('should create employee profile successfully', async () => {
      const createDto = {
        userId: 'user-uuid',
        jobTitle: 'Software Engineer',
        departmentId: 'dept-uuid',
        workLocation: 'Addis Ababa',
      };

      const expectedProfile = {
        id: 'profile-uuid',
        employeeCode: 'EMP001',
        ...createDto,
        profileCompletion: 0,
      };

      jest.spyOn(repository, 'save').mockResolvedValue(expectedProfile);

      const result = await service.createProfile(createDto, 'admin-uuid');

      expect(result).toEqual(expectedProfile);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(createDto),
      );
    });

    it('should generate unique employee code', async () => {
      const createDto = {
        userId: 'user-uuid',
        jobTitle: 'Software Engineer',
        departmentId: 'dept-uuid',
      };

      jest.spyOn(service, 'generateEmployeeCode').mockResolvedValue('EMP001');

      await service.createProfile(createDto, 'admin-uuid');

      expect(service.generateEmployeeCode).toHaveBeenCalled();
    });
  });

  describe('calculateProfileCompletion', () => {
    it('should calculate 100% for complete profile', () => {
      const employee = {
        dateOfBirth: new Date(),
        gender: 'MALE',
        nationality: 'Ethiopian',
        maritalStatus: 'SINGLE',
        addressLine1: '123 Main St',
        city: 'Addis Ababa',
        country: 'Ethiopia',
        postalCode: '1000',
        personalPhone: '+251911234567',
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '+251911234568',
        emergencyContactRelation: 'Spouse',
      };

      const result = service.calculateProfileCompletion(employee);

      expect(result.total).toBe(100);
    });

    it('should calculate 0% for empty profile', () => {
      const employee = {};

      const result = service.calculateProfileCompletion(employee);

      expect(result.total).toBe(0);
      expect(result.missingFields).toContain('dateOfBirth');
      expect(result.missingFields).toContain('gender');
    });
  });
});
```

### Integration Testing Example

```typescript
describe('EmployeeController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/api/hr/employees (POST)', () => {
    it('should create new employee profile', () => {
      return request(app.getHttpServer())
        .post('/api/hr/employees')
        .set('Authorization', 'Bearer hr-manager-token')
        .send({
          userId: 'new-user-uuid',
          jobTitle: 'Software Engineer',
          departmentId: 'engineering-dept-uuid',
          workLocation: 'Addis Ababa Office',
          isNewHire: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.employeeCode).toMatch(/^EMP\d{3}$/);
          expect(res.body.profileCompletion).toBe(0);
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/hr/employees')
        .set('Authorization', 'Bearer hr-manager-token')
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('jobTitle');
          expect(res.body.message).toContain('departmentId');
        });
    });
  });

  describe('/api/hr/employees/:id/documents (POST)', () => {
    it('should upload employee document', () => {
      const documentBuffer = Buffer.from('test document content');

      return request(app.getHttpServer())
        .post('/api/hr/employees/employee-uuid/documents')
        .set('Authorization', 'Bearer employee-token')
        .attach('file', documentBuffer, 'passport.pdf')
        .field('documentType', 'PASSPORT')
        .field('documentName', 'John Doe Passport')
        .field('issueDate', '2020-01-15')
        .field('expiryDate', '2025-01-15')
        .field('isMandatory', 'true')
        .expect(201)
        .expect((res) => {
          expect(res.body.documentType).toBe('PASSPORT');
          expect(res.body.status).toBe('PENDING_VERIFICATION');
          expect(res.body.fileUrl).toBeDefined();
        });
    });
  });
});
```

---

## Deployment Instructions

### Environment Configuration

#### Production Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/blih_hr_employee
DATABASE_SSL=true

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Authentication
KEYCLOAK_URL=https://keycloak.example.com
KEYCLOAK_REALM=blih-hr
KEYCLOAK_CLIENT_ID=employee-service

# File Storage
AWS_S3_BUCKET=blih-hr-documents
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# E-signature Service
DOCUSIGN_CLIENT_ID=your-docusign-client-id
DOCUSIGN_CLIENT_SECRET=your-docusign-client-secret
DOCUSIGN_BASE_URL=https://demo.docusign.net
DOCUSIGN_ACCOUNT_ID=your-docusign-account-id

# Email Service
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=hr@example.com
SMTP_PASS=smtp-password

# Security
EMPLOYEE_DATA_KEY=your-encryption-key
JWT_SECRET=your-jwt-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### Docker Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "dist/main.js"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  employee-api:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/blih_hr_employee
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=blih_hr_employee
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - employee-api
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Profile Completion Calculation Issues

**Problem:** Profile completion percentage incorrect

```
Expected: 75%, Actual: 25%
```

**Diagnosis:**

```typescript
// Debug profile completion calculation
function debugProfileCompletion(employee: EmployeeProfile) {
  console.log('Employee data:', {
    hasPersonalInfo: !!employee.dateOfBirth,
    hasContactInfo: !!employee.addressLine1,
    hasJobInfo: !!employee.jobTitle,
    hasEmergencyInfo: !!employee.emergencyContactName,
    hasDocuments: employee.documents?.length || 0,
  });

  const completion = this.calculateProfileCompletion(employee);
  console.log('Completion breakdown:', completion);
}
```

**Solutions:**

1. Check field validation logic
2. Verify document counting logic
3. Update weight distribution if needed

#### Document Upload Issues

**Problem:** File upload fails with S3 error

```
Error: Access Denied: S3 bucket access denied
```

**Diagnosis:**

```bash
# Check AWS credentials
aws sts get-caller-identity

# Test S3 access
aws s3 ls s3://blih-hr-documents

# Check bucket permissions
aws s3api get-bucket-policy --bucket blih-hr-documents
```

**Solutions:**

1. Verify AWS credentials and permissions
2. Check bucket policy and CORS configuration
3. Ensure IAM role has necessary permissions

#### Onboarding Task Generation Issues

**Problem:** Onboarding checklist not generating correctly

```
Expected: 15 tasks, Actual: 8 tasks
```

**Diagnosis:**

```typescript
// Debug task generation
function debugOnboardingGeneration(employee: EmployeeProfile) {
  const universalTasks = this.getUniversalTasks();
  const typeTasks = this.getEmploymentTypeTasks(employee.employmentType);
  const roleTasks = this.getRoleSpecificTasks(employee.jobTitle);
  const deptTasks = this.getDepartmentTasks(employee.departmentId);

  console.log('Task breakdown:', {
    universal: universalTasks.length,
    typeSpecific: typeTasks.length,
    roleSpecific: roleTasks.length,
    departmentSpecific: deptTasks.length,
    total:
      universalTasks.length +
      typeTasks.length +
      roleTasks.length +
      deptTasks.length,
  });
}
```

**Solutions:**

1. Check role mapping configuration
2. Verify department task definitions
3. Update employment type task mappings

#### Contract Signing Issues

**Problem:** DocuSign integration failing

```
Error: Invalid user authentication token
```

**Diagnosis:**

```typescript
// Test DocuSign connection
async function testDocuSignConnection() {
  try {
    const docusign = new DocuSignService(config);
    const userInfo = await docusign.getUserInfo();
    console.log('DocuSign connection successful:', userInfo);
  } catch (error) {
    console.error('DocuSign connection failed:', error.message);
  }
}
```

**Solutions:**

1. Refresh DocuSign access token
2. Verify account ID and permissions
3. Check webhook configuration

### Performance Optimization

#### Database Query Optimization

```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_employee_profiles_completion
ON employee_profiles(profile_completion DESC) WHERE profile_completion < 100;

CREATE INDEX CONCURRENTLY idx_documents_employee_type_status
ON employee_documents(employee_id, document_type, status);

-- Analyze slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE query LIKE '%employee_profiles%'
ORDER BY mean_time DESC;
```

#### Caching Strategy

```typescript
@Injectable()
export class EmployeeCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getEmployeeProfile(employeeId: string): Promise<EmployeeProfile> {
    const cacheKey = `employee-profile:${employeeId}`;

    // Try cache first
    let profile = await this.cacheManager.get<EmployeeProfile>(cacheKey);

    if (!profile) {
      // Load from database
      profile = await this.employeeRepository.findOne({
        where: { id: employeeId },
        relations: ['user', 'department', 'documents'],
      });

      // Cache for 15 minutes
      await this.cacheManager.set(cacheKey, profile, 900);
    }

    return profile;
  }

  async invalidateEmployeeCache(employeeId: string): Promise<void> {
    const patterns = [
      `employee-profile:${employeeId}`,
      `employee-completion:${employeeId}`,
      `employee-documents:${employeeId}`,
    ];

    await Promise.all(
      patterns.map((pattern) => this.cacheManager.del(pattern)),
    );
  }
}
```

This comprehensive documentation provides complete technical guidance for implementing and maintaining the HR Employee Management & Records System.
