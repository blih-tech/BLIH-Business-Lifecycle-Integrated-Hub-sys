# HR Employee Management & Records Subsystem Implementation Plan

**Purpose:** Comprehensive employee management system covering profiles, onboarding, contract management, and employee lifecycle administration.  
**Timeline:** 4 weeks development + 1 week testing  
**Priority:** High - Core HR functionality

---

## Overview

The Employee Management & Records subsystem maintains comprehensive employee data throughout their employment lifecycle. This includes 7 core forms for onboarding, profile management, document handling, and lifecycle status management.

---

## Implementation Structure

### File Organization

```
src/domains/hr/employee/
├── employee.module.ts
├── employee.controller.ts
├── employee.service.ts
├── dto/
│   ├── employee-profile.dto.ts
│   ├── onboarding-checklist.dto.ts
│   ├── contract-upload.dto.ts
│   ├── document-update.dto.ts
│   └── lifecycle-update.dto.ts
├── entities/
│   ├── employee-profile.entity.ts
│   ├── onboarding-checklist.entity.ts
│   ├── employee-document.entity.ts
│   └── employment-contract.entity.ts
├── use-cases/
│   ├── create-employee-profile.usecase.ts
│   ├── onboard-employee.usecase.ts
│   ├── update-contract.usecase.ts
│   ├── manage-documents.usecase.ts
│   └── update-lifecycle.usecase.ts
└── services/
    ├── onboarding-automation.service.ts
    ├── document-validator.service.ts
    └── lifecycle-manager.service.ts
```

---

## Database Schema Extensions

### New Models Required

```prisma
model EmployeeProfile {
  id                    String   @id @default(uuid()) @db.Uuid
  userId                String   @unique @db.Uuid
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  employeeCode          String   @unique
  departmentId          String   @db.Uuid
  department            Department @relation(fields: [departmentId], references: [id])
  managerId             String?  @db.Uuid
  manager               User?    @relation("EmployeeManager", fields: [managerId], references: [id])

  // Personal Information
  dateOfBirth           DateTime?
  gender                String?
  nationality           String?
  maritalStatus         String?
  avatarUrl             String?

  // Contact Information
  addressLine1          String?
  addressLine2          String?
  city                  String?
  state                 String?
  country               String?
  postalCode            String?
  personalPhone         String?
  personalEmail         String?

  // Emergency Contact
  emergencyContactName  String?
  emergencyContactPhone String?
  emergencyContactRelation String?

  // Job Information
  jobTitle              String
  jobGrade              String?
  workLocation          String?
  workType              String?  // OFFICE/HYBRID/REMOTE
  shiftHours            String?

  // System Information
  profileCompletion     Float    @default(0) // 0-100 percentage
  lastLoginAt           DateTime?
  notes                 String?

  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // Relations
  documents             EmployeeDocument[]
  onboardingChecklists  OnboardingChecklist[]
  contracts             EmploymentContract[]
  subordinates          User[]   @relation("EmployeeManager")
}

model EmployeeDocument {
  id          String   @id @default(uuid()) @db.Uuid
  employeeId  String   @db.Uuid
  employee    EmployeeProfile @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  documentType String   // ID/PASSPORT/CONTRACT/CERTIFICATE/MEDICAL/OTHER
  documentName String
  fileUrl     String
  fileHash    String?  // For integrity verification
  issueDate   DateTime?
  expiryDate  DateTime?
  isMandatory Boolean  @default(false)
  status      String   @default(PENDING) // PENDING/VERIFIED/EXPIRED/REJECTED

  // Metadata
  uploadedBy  String   @db.Uuid
  verifiedBy  String?  @db.Uuid
  verifiedAt  DateTime?
  notes       String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([employeeId, documentType])
  @@index([expiryDate])
}

model OnboardingChecklist {
  id          String   @id @default(uuid()) @db.Uuid
  employeeId  String   @db.Uuid
  employee    EmployeeProfile @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  title       String
  description String?
  department  String   // HR/IT/ADMIN/FINANCE/TEAM
  assignedTo  String   @db.Uuid // User responsible
  priority    String   @default(MEDIUM) // LOW/MEDIUM/HIGH
  dueDate     DateTime?
  completedAt DateTime?
  status      String   @default(PENDING) // PENDING/IN_PROGRESS/COMPLETED/OVERDUE

  // Task details
  taskType    String   // DOCUMENT/ACCESS/EQUIPMENT/TRAINING/MEETING
  taskData    Json?    // Specific task parameters

  // Completion tracking
  completedBy String?  @db.Uuid
  notes       String?
  attachments String[] // Array of file URLs

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([employeeId, status])
  @@index([assignedTo, dueDate])
}

model EmploymentContract {
  id          String   @id @default(uuid()) @db.Uuid
  employeeId  String   @db.Uuid
  employee    EmployeeProfile @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  contractType String  // INITIAL/RENEWAL/AMENDMENT/TERMINATION
  contractNumber String @unique

  // Contract terms
  startDate   DateTime
  endDate     DateTime?
  employmentType EmploymentType
  probationMonths Int? @default(3)

  // Compensation
  baseSalary  Decimal  @db.Decimal(15, 2)
  currency    String   @default(ETB)
  payFrequency PayFrequency @default(MONTHLY)
  allowances  Json?    // Housing, transport, etc.
  bonusEligible Boolean @default(false)
  bonusRate   Decimal? @db.Decimal(5, 2)

  // Work terms
  workHours   Int      @default(40) // Weekly hours
  workDays    String   @default(MON-FRI)
  workLocation String?
  workType    String?  // OFFICE/HYBRID/REMOTE

  // Benefits
  benefits    Json?    // Health insurance, retirement, etc.
  leaveEntitlement Json? // Annual, sick, maternity leave

  // Document management
  contractUrl String
  signedUrl   String?  // Signed contract
  signatureDate DateTime?

  // Status
  status      String   @default(DRAFT) // DRAFT/SIGNED/ACTIVE/EXPIRED/TERMINATED
  isActive    Boolean  @default(true)

  // Metadata
  createdBy   String   @db.Uuid
  approvedBy  String?  @db.Uuid
  approvedAt  DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([employeeId, status])
  @@index([endDate])
}
```

---

## Core Implementation Components

### 1. Employee Profile Management

**Features:**

- Comprehensive employee data management
- Profile completion tracking
- Field-level access controls
- Bulk update capabilities

**Key Endpoints:**

```typescript
GET    /hr/employees                     // List employees with filters
GET    /hr/employees/:id                 // Get employee profile
PUT    /hr/employees/:id                 // Update employee profile
POST   /hr/employees/:id/avatar          // Upload avatar
GET    /hr/employees/:id/completion     // Profile completion status
POST   /hr/employees/bulk-update         // Bulk employee updates
```

**Profile Completion Logic:**

```typescript
calculateProfileCompletion(employee: EmployeeProfile): number {
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

  return Object.entries(sections).reduce((total, [section, complete]) => {
    return total + (complete ? weights[section] * 100 : 0);
  }, 0);
}
```

### 2. Onboarding Automation

**Features:**

- Automated checklist generation
- Task assignment based on role/department
- Progress tracking and notifications
- Deadline management

**Checklist Generation Logic:**

```typescript
generateOnboardingChecklist(employee: EmployeeProfile): OnboardingTask[] {
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
    dueDate: this.calculateDueDate(employee.hiredAt, task.dueDays),
    assignedTo: this.assignTaskToDepartment(task.department)
  }));
}

getUniversalTasks(): TaskTemplate[] {
  return [
    { title: 'Create email account', department: 'IT', dueDays: -1, taskType: 'ACCESS' },
    { title: 'Prepare workstation', department: 'ADMIN', dueDays: -1, taskType: 'EQUIPMENT' },
    { title: 'Add to payroll', department: 'HR', dueDays: 0, taskType: 'SYSTEM' },
    { title: 'Issue access card', department: 'ADMIN', dueDays: 0, taskType: 'EQUIPMENT' },
    { title: 'Sign employment contract', department: 'HR', dueDays: 1, taskType: 'DOCUMENT' },
    { title: 'Company orientation', department: 'HR', dueDays: 3, taskType: 'TRAINING' }
  ];
}
```

### 3. Document Management

**Features:**

- Secure document upload and storage
- Automated expiry tracking
- Document verification workflow
- File integrity validation

**Document Expiry Tracking:**

```typescript
@Cron('0 9 * * *') // Daily at 9 AM
async checkDocumentExpiries(): Promise<void> {
  const expiringSoon = await this.findExpiringDocuments(30); // Next 30 days

  for (const doc of expiringSoon) {
    const daysUntilExpiry = differenceInDays(doc.expiryDate, new Date());

    if (daysUntilExpiry === 30) {
      await this.sendExpiryNotification(doc, '30_DAYS');
    } else if (daysUntilExpiry === 7) {
      await this.sendExpiryNotification(doc, '7_DAYS');
    } else if (daysUntilExpiry <= 0) {
      await this.handleExpiredDocument(doc);
    }
  }
}

async handleExpiredDocument(document: EmployeeDocument): Promise<void> {
  // Update document status
  document.status = 'EXPIRED';
  await document.save();

  // Notify HR and employee
  await this.notificationService.send({
    recipientId: document.employeeId,
    type: 'DOCUMENT_EXPIRED',
    title: `Document Expired: ${document.documentName}`,
    priority: 'HIGH'
  });

  // Check if mandatory document affects employment
  if (document.isMandatory && document.documentType === 'WORK_PERMIT') {
    await this.handleWorkPermitExpiry(document.employeeId);
  }
}
```

### 4. Contract Management

**Features:**

- Contract lifecycle management
- Automated renewal notifications
- E-signature integration
- Terms tracking and compliance

**Contract Renewal Logic:**

```typescript
@Cron('0 10 * * *') // Daily at 10 AM
async checkContractRenewals(): Promise<void> {
  const renewalsDue = await this.findContractsExpiringIn(90); // 90 days notice

  for (const contract of renewalsDue) {
    const daysUntilExpiry = differenceInDays(contract.endDate, new Date());

    if (daysUntilExpiry === 90) {
      await this.initiateRenewalProcess(contract);
    } else if (daysUntilExpiry === 30) {
      await this.sendRenewalReminder(contract);
    } else if (daysUntilExpiry === 7) {
      await this.escalateRenewalUrgency(contract);
    }
  }
}

async initiateRenewalProcess(contract: EmploymentContract): Promise<void> {
  // Create renewal task for HR
  await this.taskService.create({
    title: `Contract Renewal: ${contract.employee.employeeCode}`,
    assignedTo: this.getHRManagerId(),
    dueDate: addDays(contract.endDate, -30),
    priority: 'HIGH',
    taskData: {
      contractId: contract.id,
      employeeId: contract.employeeId,
      action: 'RENEWAL'
    }
  });

  // Notify manager
  await this.notificationService.send({
    recipientId: contract.employee.managerId,
    type: 'CONTRACT_RENEWAL_DUE',
    title: `Contract renewal needed for ${contract.employee.employeeCode}`,
    priority: 'MEDIUM'
  });
}
```

### 5. Lifecycle Management

**Features:**

- Employee status transitions
- Probation tracking
- Suspension and termination workflows
- Offboarding coordination

**Status Transition Logic:**

```typescript
async updateEmployeeStatus(employeeId: string, newStatus: LifecycleStatus, context: StatusUpdateContext): Promise<void> {
  const employee = await this.findById(employeeId);
  const currentStatus = employee.lifecycle?.status;

  // Validate transition
  if (!this.isValidTransition(currentStatus, newStatus)) {
    throw new BadRequestException(`Invalid status transition from ${currentStatus} to ${newStatus}`);
  }

  // Handle specific transitions
  switch (newStatus) {
    case 'ONBOARDING':
      await this.handleOnboardingStart(employeeId);
      break;
    case 'ACTIVE':
      await this.handleActivation(employeeId);
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
    ...context
  });

  // Audit log
  await this.auditService.log({
    action: 'EMPLOYEE_STATUS_CHANGE',
    resource: 'Employee',
    resourceId: employeeId,
    before: { status: currentStatus },
    after: { status: newStatus },
    metadata: context
  });
}
```

---

## Implementation Phases

### Week 1: Foundation & Profile Management

- Database schema creation
- Employee profile CRUD operations
- Profile completion tracking
- Basic validation and permissions

### Week 2: Onboarding System

- Checklist generation logic
- Task assignment and tracking
- Progress monitoring
- Notification integration

### Week 3: Document Management

- File upload and storage
- Document validation
- Expiry tracking system
- Verification workflows

### Week 4: Contract & Lifecycle Management

- Contract lifecycle tracking
- Renewal automation
- Status transition management
- Offboarding workflows

### Week 5: Testing & Integration

- End-to-end employee lifecycle testing
- Performance optimization
- Security validation
- Documentation completion

---

## Integration Points

### Internal Systems

- **Authentication:** Keycloak user management
- **Notifications:** Email and in-app alerts
- **Audit:** Complete action logging
- **Finance:** Payroll and budget integration

### External Systems

- **E-signature:** Contract signing
- **File Storage:** Secure document storage
- **Email:** Notification delivery
- **Calendar:** Onboarding scheduling

---

## Security & Permissions

### Required Permissions

```typescript
const EMPLOYEE_PERMISSIONS = {
  'hr:employee:profile:view': ['HR_MANAGER', 'MANAGER', 'EMPLOYEE_OWN'],
  'hr:employee:profile:update': ['HR_MANAGER', 'MANAGER'],
  'hr:employee:profile:create': ['HR_MANAGER'],
  'hr:employee:documents:view': ['HR_MANAGER', 'EMPLOYEE_OWN'],
  'hr:employee:documents:verify': ['HR_MANAGER'],
  'hr:employee:contract:view': ['HR_MANAGER', 'EMPLOYEE_OWN'],
  'hr:employee:contract:approve': ['HR_MANAGER', 'CEO'],
  'hr:employee:lifecycle:update': ['HR_MANAGER', 'CEO'],
  'hr:employee:onboarding:manage': [
    'HR_MANAGER',
    'IT_MANAGER',
    'ADMIN_MANAGER',
  ],
};
```

### Data Privacy

- Field-level encryption for sensitive data
- Access logging for profile views
- GDPR compliance for employee data
- Role-based data masking

---

## Success Metrics

### Operational Metrics

- **Profile Completion:** 95%+ complete profiles
- **Onboarding Time:** Reduce to 3 days
- **Document Compliance:** 98%+ verified documents
- **Contract Renewal:** 100% on-time renewals

### Technical Metrics

- **API Response Time:** < 200ms
- **File Upload Speed:** < 5 seconds
- **System Availability:** 99.9%
- **Data Accuracy:** 99.5%+ accuracy

---

## Testing Strategy

### Unit Tests

- Profile completion calculation
- Onboarding checklist generation
- Document expiry logic
- Status transition validation

### Integration Tests

- File upload and storage
- Database operations
- Third-party integrations

### E2E Tests

- Complete employee lifecycle
- Onboarding workflow
- Document management
- Contract renewal process

This subsystem forms the core of HR operations and must maintain high data quality and security standards while providing excellent user experience for employees and HR staff.
