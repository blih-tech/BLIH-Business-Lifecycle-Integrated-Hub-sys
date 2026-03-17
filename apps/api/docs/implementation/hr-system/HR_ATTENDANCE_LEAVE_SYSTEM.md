# HR Attendance & Leave Management System Documentation

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

The HR Attendance & Leave Management System handles employee presence tracking, leave requests and approvals, overtime calculation, and attendance analytics. This system supports multiple clock-in methods, automated overtime calculations with complex rules, and comprehensive leave balance management while ensuring compliance with labor regulations.

### Key Features

- **Multi-Method Clock-in/Out:** WiFi, GPS, QR code, and WebAuthn validation
- **Automated Overtime Calculation:** Complex rules with rate multipliers and caps
- **Leave Balance Management:** Automated accrual and balance tracking
- **Timesheet Processing:** Weekly timesheet generation and approval
- **Real-time Analytics:** Attendance patterns and leave utilization reports

### Business Objectives

- Achieve 99%+ accurate attendance records
- Process 95%+ leave requests within 24 hours
- Ensure 100% accurate overtime calculations
- Maintain 90%+ on-time timesheet submission

---

## Architecture

### System Components

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Employee Mobile App]
        B[Web Dashboard]
        C[Manager Portal]
        D[Admin Console]
    end

    subgraph "API Layer"
        E[Attendance API]
        F[Leave API]
        G[Overtime API]
        H[Timesheet API]
    end

    subgraph "Service Layer"
        I[ClockIn Service]
        J[Leave Service]
        K[Overtime Calculator]
        L[Timesheet Service]
        M[Analytics Service]
    end

    subgraph "Validation Layer"
        N[Location Validator]
        O[Device Manager]
        P[Policy Engine]
        Q[Time Calculator]
    end

    subgraph "Data Layer"
        R[PostgreSQL Database]
        S[Redis Cache]
        T[File Storage]
    end

    subgraph "External Services"
        U[Keycloak Auth]
        V[Email Service]
        W[Maps API]
        X[Calendar API]
    end

    A --> E
    B --> E
    C --> F
    D --> H
    E --> I
    F --> J
    G --> K
    H --> L
    I --> N
    I --> O
    J --> P
    K --> Q
    L --> M
    N --> R
    O --> R
    P --> R
    Q --> R
    I --> U
    J --> V
    N --> W
    H --> X
```

### Component Responsibilities

| Component           | Responsibility                       | Key Technologies      |
| ------------------- | ------------------------------------ | --------------------- |
| ClockIn Service     | Multi-method attendance validation   | Geolocation, WiFi, QR |
| Leave Service       | Leave balance and request processing | Workflow Engine       |
| Overtime Calculator | Complex overtime rule processing     | Business Rules Engine |
| Timesheet Service   | Weekly timesheet generation          | Data Aggregation      |
| Analytics Service   | Attendance patterns and reporting    | Data Visualization    |

---

## Database Schema

### Core Tables

#### AttendanceLog

```sql
CREATE TABLE attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Clock-in/out data
    clock_in TIMESTAMP,
    clock_out TIMESTAMP,
    break_start TIMESTAMP,
    break_end TIMESTAMP,
    total_hours FLOAT,
    overtime FLOAT DEFAULT 0,

    -- Validation data
    method VARCHAR(50) NOT NULL,
    location JSONB,
    device_fingerprint VARCHAR(255),
    ip_address INET,
    user_agent TEXT,

    -- Status and flags
    status VARCHAR(50) DEFAULT 'ACTIVE',
    flagged BOOLEAN DEFAULT FALSE,
    flag_reason VARCHAR(255),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,

    -- Notes and corrections
    notes TEXT,
    correction_reason TEXT,
    original_log_id UUID REFERENCES attendance_logs(id),

    -- Date tracking
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attendance_user_date ON attendance_logs(user_id, date);
CREATE INDEX idx_attendance_status_flagged ON attendance_logs(status, flagged);
CREATE INDEX idx_attendance_clock_in ON attendance_logs(clock_in);
CREATE INDEX idx_attendance_method ON attendance_logs(method);
```

#### LeaveRequest

```sql
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Leave details
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count FLOAT NOT NULL,
    half_day BOOLEAN DEFAULT FALSE,
    half_day_type VARCHAR(50),

    -- Request details
    reason TEXT,
    contact_info TEXT,
    handover JSONB,

    -- Approval workflow
    status VARCHAR(50) DEFAULT 'PENDING',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,

    -- Balance impact
    balance_before FLOAT,
    balance_after FLOAT,

    -- Metadata
    requested_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leave_requests_user ON leave_requests(user_id, status);
CREATE INDEX idx_leave_requests_approver ON leave_requests(approved_by, status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_requests_type ON leave_requests(leave_type, status);
```

#### LeaveBalance

```sql
CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Balance details
    leave_type VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    entitled FLOAT NOT NULL,
    accrued FLOAT DEFAULT 0,
    used FLOAT DEFAULT 0,
    pending FLOAT DEFAULT 0,
    available FLOAT GENERATED ALWAYS AS (accrued - used - pending) STORED,

    -- Accrual settings
    accrual_rate FLOAT,
    max_carry_over FLOAT,

    -- Metadata
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, leave_type, year)
);

CREATE INDEX idx_leave_balances_user ON leave_balances(user_id);
CREATE INDEX idx_leave_balances_year ON leave_balances(year);
CREATE INDEX idx_leave_balances_type ON leave_balances(leave_type);
```

#### Timesheet

```sql
CREATE TABLE timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Timesheet period
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',

    -- Time breakdown
    regular_hours FLOAT DEFAULT 0,
    overtime_hours FLOAT DEFAULT 0,
    weekend_hours FLOAT DEFAULT 0,
    holiday_hours FLOAT DEFAULT 0,
    total_hours FLOAT DEFAULT 0,

    -- Project breakdown
    project_time JSONB,

    -- Approval workflow
    submitted_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,

    -- Metadata
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, week_start)
);

CREATE INDEX idx_timesheets_user ON timesheets(user_id);
CREATE INDEX idx_timesheets_status_week ON timesheets(status, week_start);
CREATE INDEX idx_timesheets_approved ON timesheets(approved_by, status);
```

#### OvertimeRequest

```sql
CREATE TABLE overtime_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Overtime details
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    hours FLOAT NOT NULL,
    reason TEXT NOT NULL,

    -- Project details
    project_id UUID,
    task VARCHAR(255),

    -- Approval workflow
    status VARCHAR(50) DEFAULT 'PENDING',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,

    -- Budget tracking
    budget_impact FLOAT,
    department_budget VARCHAR(100),

    -- Metadata
    requested_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_overtime_user_date ON overtime_requests(user_id, date, status);
CREATE INDEX idx_overtime_approved ON overtime_requests(approved_by, status);
```

#### AttendanceDevice

```sql
CREATE TABLE attendance_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Device details
    device_fingerprint VARCHAR(255) UNIQUE,
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    os VARCHAR(100),
    browser VARCHAR(100),

    -- Registration and status
    status VARCHAR(50) DEFAULT 'PENDING',
    registered_at TIMESTAMP DEFAULT NOW(),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    revoked_at TIMESTAMP,

    -- Usage tracking
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,

    -- Metadata
    ip_address INET,
    location JSONB,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_devices_user ON attendance_devices(user_id);
CREATE INDEX idx_devices_status ON attendance_devices(status);
CREATE INDEX idx_devices_fingerprint ON attendance_devices(device_fingerprint);
```

### Entity Relationships

```mermaid
erDiagram
    AttendanceLog ||--o{ AttendanceDevice : "validated by"
    AttendanceLog }o--|| User : "belongs to"
    LeaveRequest }o--|| User : "requested by"
    LeaveRequest }o--|| User : "approved by"
    LeaveBalance }o--|| User : "belongs to"
    Timesheet }o--|| User : "submitted by"
    Timesheet }o--|| User : "approved by"
    OvertimeRequest }o--|| User : "requested by"
    OvertimeRequest }o--|| User : "approved by"
    AttendanceDevice }o--|| User : "registered by"
    AttendanceDevice }o--|| User : "approved by"
```

---

## API Endpoints

### Attendance Endpoints

#### POST /api/hr/attendance/clock-in

Clock in with validation.

**Request Body:**

```json
{
  "method": "GEO",
  "location": {
    "latitude": 9.145,
    "longitude": 40.4897,
    "accuracy": 10,
    "timestamp": "2026-02-27T08:30:00Z"
  },
  "deviceFingerprint": "device-unique-id",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "clockIn": "2026-02-27T08:30:00Z",
  "method": "GEO",
  "location": {
    "latitude": 9.145,
    "longitude": 40.4897,
    "verified": true,
    "distance": 50
  },
  "status": "ACTIVE",
  "totalHours": null,
  "message": "Successfully clocked in"
}
```

#### POST /api/hr/attendance/clock-out

Clock out for the day.

**Request Body:**

```json
{
  "method": "GEO",
  "location": {
    "latitude": 9.145,
    "longitude": 40.4897,
    "accuracy": 10
  },
  "notes": "Completed project milestone today"
}
```

#### GET /api/hr/attendance/today-status

Get today's attendance status.

**Response:**

```json
{
  "hasClockedIn": true,
  "hasClockedOut": false,
  "clockInTime": "2026-02-27T08:30:00Z",
  "totalHours": 7.5,
  "breakTime": 1.0,
  "canClockOut": true,
  "message": "You have 30 minutes remaining in work day"
}
```

#### POST /api/hr/attendance/register-device

Register new device for attendance validation.

#### GET /api/hr/attendance/devices

List registered devices.

#### GET /api/hr/attendance/history

Get attendance history with filtering.

**Query Parameters:**

- `startDate`: Start date filter
- `endDate`: End date filter
- `status`: Status filter
- `method`: Clock-in method filter

### Leave Endpoints

#### POST /api/hr/leave/requests

Submit leave request.

**Request Body:**

```json
{
  "leaveType": "ANNUAL",
  "startDate": "2026-03-15",
  "endDate": "2026-03-19",
  "halfDay": false,
  "reason": "Family vacation",
  "contactInfo": "+251911234567",
  "handover": {
    "delegateId": "uuid",
    "responsibilities": ["Project A", "Client meetings"],
    "emergencyContacts": ["Team lead", "Department head"]
  }
}
```

**Response:**

```json
{
  "id": "uuid",
  "leaveType": "ANNUAL",
  "startDate": "2026-03-15",
  "endDate": "2026-03-19",
  "daysCount": 5,
  "status": "PENDING",
  "balanceBefore": 15,
  "balanceAfter": 10,
  "requestedAt": "2026-02-27T10:00:00Z",
  "approvals": [
    {
      "approverId": "uuid",
      "approverName": "John Manager",
      "role": "MANAGER",
      "status": "PENDING"
    }
  ]
}
```

#### GET /api/hr/leave/requests

List leave requests with filtering.

#### PUT /api/hr/leave/requests/:id/approve

Approve leave request.

**Request Body:**

```json
{
  "action": "APPROVE",
  "notes": "Approved - project coverage arranged"
}
```

#### PUT /api/hr/leave/requests/:id/reject

Reject leave request.

#### GET /api/hr/leave/balance

Get leave balance information.

**Response:**

```json
{
  "balances": [
    {
      "leaveType": "ANNUAL",
      "year": 2026,
      "entitled": 21,
      "accrued": 5.25,
      "used": 3,
      "pending": 5,
      "available": 2.25
    },
    {
      "leaveType": "SICK",
      "year": 2026,
      "entitled": 10,
      "accrued": 2.5,
      "used": 0,
      "pending": 0,
      "available": 2.5
    }
  ],
  "summary": {
    "totalEntitled": 31,
    "totalAvailable": 4.75,
    "nextAccrualDate": "2026-03-01"
  }
}
```

#### GET /api/hr/leave/calendar

Get leave calendar for team/department.

### Overtime Endpoints

#### POST /api/hr/overtime/requests

Submit overtime request.

**Request Body:**

```json
{
  "date": "2026-02-27",
  "startTime": "18:00",
  "endTime": "22:00",
  "hours": 4,
  "reason": "Complete urgent project deliverable",
  "projectId": "uuid",
  "task": "Backend API development"
}
```

#### GET /api/hr/overtime/requests

List overtime requests.

#### PUT /api/hr/overtime/requests/:id/approve

Approve overtime request.

#### GET /api/hr/overtime/summary

Get overtime summary for period.

### Timesheet Endpoints

#### GET /api/hr/timesheets/current

Get current timesheet.

#### POST /api/hr/timesheets/submit

Submit timesheet for approval.

#### PUT /api/hr/timesheets/:id/approve

Approve timesheet.

#### GET /api/hr/timesheets/history

Get timesheet history.

---

## Business Logic & Workflows

### Clock-in Validation Logic

```typescript
interface ValidationResult {
  valid: boolean;
  reason?: string;
  distance?: number;
  maxDistance?: number;
  warning?: string;
}

@Injectable()
export class AttendanceValidationService {
  async validateClockIn(
    userId: string,
    dto: ClockInDto,
  ): Promise<ValidationResult> {
    // 1. Validate time window
    const timeValidation = await this.validateTimeWindow(dto.method);
    if (!timeValidation.valid) {
      return timeValidation;
    }

    // 2. Check for existing clock-in today
    const existingLog = await this.findTodayLog(userId);
    if (existingLog?.clockIn) {
      return { valid: false, reason: 'ALREADY_CLOCKED_IN' };
    }

    // 3. Validate based on method
    switch (dto.method) {
      case 'WIFI':
        return await this.validateWiFiConnection(dto.ipAddress);
      case 'GEO':
        return await this.validateGeoLocation(dto.location);
      case 'QR':
        return await this.validateQRCode(dto.qrToken);
      case 'WEBAUTHN':
        return await this.validateWebAuthn(dto.webauthnAssertion);
      default:
        return { valid: false, reason: 'INVALID_METHOD' };
    }
  }

  private async validateGeoLocation(
    location: GeoLocation,
  ): Promise<ValidationResult> {
    // Check GPS accuracy
    if (location.accuracy > 100) {
      return { valid: false, reason: 'GPS_ACCURACY_POOR' };
    }

    // Check distance from office
    const officeLocation = await this.getOfficeLocation();
    const distance = this.calculateDistance(location, officeLocation);

    if (distance > this.config.geoRadius) {
      return {
        valid: false,
        reason: 'OUTSIDE_GEOFENCE',
        distance,
        maxDistance: this.config.geoRadius,
      };
    }

    return { valid: true, distance };
  }

  private async validateWiFiConnection(
    ipAddress: string,
  ): Promise<ValidationResult> {
    const isOfficeNetwork = this.config.officeIpRanges.some((range) =>
      this.isIpInRange(ipAddress, range),
    );

    if (!isOfficeNetwork) {
      return { valid: false, reason: 'NOT_ON_OFFICE_WIFI' };
    }

    return { valid: true };
  }

  private async validateQRCode(qrToken: string): Promise<ValidationResult> {
    // Validate QR token
    const tokenData = await this.validateQRToken(qrToken);
    if (!tokenData || tokenData.expiresAt < new Date()) {
      return { valid: false, reason: 'INVALID_QR_TOKEN' };
    }

    // Check if QR was used today
    const usedToday = await this.checkQRUsedToday(qrToken);
    if (usedToday) {
      return { valid: false, reason: 'QR_TOKEN_USED' };
    }

    return { valid: true };
  }
}
```

### Overtime Calculation Logic

```typescript
interface OvertimeCalculation {
  overtimeHours: number;
  rateMultiplier: number;
  overtimeType: string;
  payoutAmount: number;
  hourlyRate: number;
  error?: string;
  maxAllowed?: number;
  requiresApproval?: string;
}

@Injectable()
export class OvertimeCalculationService {
  async calculateOvertime(
    userId: string,
    date: Date,
    hoursWorked: number,
  ): Promise<OvertimeCalculation> {
    const user = await this.userService.findById(userId);
    const shift = await this.getEmployeeShift(userId, date);
    const regularHours = shift.durationHours;

    let overtimeHours = 0;
    let rateMultiplier = 1.0;
    let overtimeType = null;

    if (hoursWorked > regularHours) {
      const extraHours = hoursWorked - regularHours;

      // Determine overtime type and rate
      if (this.isWeekday(date)) {
        if (extraHours <= 2) {
          overtimeHours = extraHours;
          rateMultiplier = 1.5;
          overtimeType = 'WEEKDAY_EARLY';
        } else {
          overtimeHours = extraHours;
          rateMultiplier = 2.0;
          overtimeType = 'WEEKDAY_LATE';
        }
      } else if (this.isWeekend(date)) {
        overtimeHours = extraHours;
        rateMultiplier = 2.0;
        overtimeType = 'WEEKEND';
      } else if (this.isHoliday(date)) {
        overtimeHours = extraHours;
        rateMultiplier = 2.5;
        overtimeType = 'HOLIDAY';
      }
    }

    // Check monthly cap
    const monthlyOT = await this.getMonthlyOvertime(userId, date);
    const MAX_MONTHLY_OT = 40; // hours

    if (monthlyOT + overtimeHours > MAX_MONTHLY_OT) {
      return {
        error: 'MONTHLY_OVERTIME_CAP_EXCEEDED',
        maxAllowed: MAX_MONTHLY_OT - monthlyOT,
        requested: overtimeHours,
        requiresApproval: 'CEO',
        overtimeHours: 0,
        rateMultiplier: 0,
        overtimeType: null,
        payoutAmount: 0,
        hourlyRate: 0,
      };
    }

    const hourlyRate = await this.getHourlyRate(userId);

    return {
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      rateMultiplier,
      overtimeType,
      payoutAmount:
        Math.round(overtimeHours * hourlyRate * rateMultiplier * 100) / 100,
      hourlyRate,
    };
  }

  private isWeekday(date: Date): boolean {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday to Friday
  }

  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  private isHoliday(date: Date): boolean {
    return this.holidayService.isHoliday(date);
  }
}
```

### Leave Balance Calculation

```typescript
@Injectable()
export class LeaveBalanceService {
  async calculateLeaveBalance(
    userId: string,
    leaveType: string,
    asOfDate: Date,
  ): Promise<LeaveBalance> {
    const user = await this.userService.findById(userId);
    const year = asOfDate.getFullYear();

    // Get or create balance record
    let balance = await this.leaveBalanceRepository.findOne({
      where: { userId, leaveType, year },
    });

    if (!balance) {
      balance = await this.createInitialBalance(userId, leaveType, year);
    }

    // Calculate accrued amount
    const monthsEmployed = this.differenceInMonths(asOfDate, user.hiredAt);
    const accrualRate = this.getAccrualRate(user.employmentType, leaveType);
    const accruedToDate = Math.min(
      monthsEmployed * accrualRate,
      balance.entitled,
    );

    // Calculate used leave
    const usedLeave = await this.leaveRequestRepository.sum('daysCount', {
      where: {
        userId,
        leaveType,
        status: 'APPROVED',
        startDate: { gte: new Date(year, 0, 1) },
        endDate: { lt: new Date(year + 1, 0, 1) },
      },
    });

    // Calculate pending leave
    const pendingLeave = await this.leaveRequestRepository.sum('daysCount', {
      where: {
        userId,
        leaveType,
        status: 'APPROVED',
        startDate: { gt: asOfDate },
      },
    });

    // Update balance
    balance.accrued = accruedToDate;
    balance.used = usedLeave || 0;
    balance.pending = pendingLeave || 0;
    balance.available = accruedToDate - balance.used - balance.pending;

    await balance.save();
    return balance;
  }

  private getAccrualRate(employmentType: string, leaveType: string): number {
    const accrualRates = {
      FULL_TIME: {
        ANNUAL: 1.75, // 21 days per year
        SICK: 0.83, // 10 days per year
        MATERNITY: 7.5, // 90 days per year
        PATERNITY: 0.75, // 9 days per year
      },
      PART_TIME: {
        ANNUAL: 0.875, // Proportional
        SICK: 0.415,
        MATERNITY: 3.75,
        PATERNITY: 0.375,
      },
      CONTRACT: {
        ANNUAL: 1.0,
        SICK: 0.5,
      },
    };

    return accrualRates[employmentType]?.[leaveType] || 0;
  }

  @Cron('0 0 1 * *') // First day of each month
  async processMonthlyAccrual(): Promise<void> {
    const activeEmployees = await this.userService.findActiveEmployees();

    for (const employee of activeEmployees) {
      const currentYear = new Date().getFullYear();
      const leaveTypes = ['ANNUAL', 'SICK'];

      for (const leaveType of leaveTypes) {
        await this.calculateLeaveBalance(employee.id, leaveType, new Date());
      }
    }
  }
}
```

### Leave Request Validation

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
  requiresCEOOverride?: boolean;
}

@Injectable()
export class LeaveValidationService {
  async validateLeaveRequest(
    userId: string,
    dto: LeaveRequestDto,
  ): Promise<ValidationResult> {
    const errors = [];

    // 1. Check balance
    const balance = await this.calculateLeaveBalance(
      userId,
      dto.leaveType,
      new Date(),
    );
    if (dto.daysCount > balance.available) {
      errors.push({
        field: 'daysCount',
        message: `Insufficient balance. Available: ${balance.available}, Requested: ${dto.daysCount}`,
        code: 'INSUFFICIENT_BALANCE',
      });
    }

    // 2. Check notice period
    const minNoticeDays = this.getMinNoticePeriod(dto.leaveType);
    const daysUntilStart = this.differenceInBusinessDays(
      dto.startDate,
      new Date(),
    );
    if (daysUntilStart < minNoticeDays) {
      errors.push({
        field: 'startDate',
        message: `Minimum ${minNoticeDays} business days notice required`,
        code: 'INSUFFICIENT_NOTICE',
      });
    }

    // 3. Check overlapping leaves
    const overlapping = await this.findOverlappingLeaves(
      userId,
      dto.startDate,
      dto.endDate,
    );
    if (overlapping.length > 0) {
      errors.push({
        field: 'dates',
        message: 'Overlapping leave request exists',
        code: 'OVERLAPPING_LEAVE',
      });
    }

    // 4. Check blackout dates
    const blackoutDates = await this.getBlackoutDates(userId);
    if (this.datesOverlap(dto.startDate, dto.endDate, blackoutDates)) {
      errors.push({
        field: 'dates',
        message: 'Request conflicts with blackout period',
        code: 'BLACKOUT_PERIOD',
        requiresCEOOverride: true,
      });
    }

    // 5. Check handover for long leaves
    if (dto.daysCount >= 5 && !dto.handover?.delegateId) {
      errors.push({
        field: 'handover',
        message: 'Leave > 5 days requires handover delegate',
        code: 'HANDOVER_REQUIRED',
      });
    }

    // 6. Check team coverage
    const teamCoverage = await this.checkTeamCoverage(
      userId,
      dto.startDate,
      dto.endDate,
    );
    if (!teamCoverage.sufficient) {
      errors.push({
        field: 'dates',
        message: `Insufficient team coverage. Only ${teamCoverage.availableStaff} staff available`,
        code: 'INSUFFICIENT_COVERAGE',
        requiresManagerOverride: true,
      });
    }

    return { valid: errors.length === 0, errors };
  }

  private async checkTeamCoverage(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CoverageResult> {
    const user = await this.userService.findById(userId);
    const teamMembers = await this.userService.findTeamMembers(user.managerId);

    // Exclude the requesting user
    const otherTeamMembers = teamMembers.filter(
      (member) => member.id !== userId,
    );

    // Check who else is on leave during this period
    const onLeave = [];
    for (const member of otherTeamMembers) {
      const leaves = await this.findOverlappingLeaves(
        member.id,
        startDate,
        endDate,
      );
      if (leaves.length > 0) {
        onLeave.push(member.id);
      }
    }

    const availableStaff = otherTeamMembers.length - onLeave.length;
    const minimumRequired = this.calculateMinimumStaff(user.departmentId);

    return {
      sufficient: availableStaff >= minimumRequired,
      availableStaff,
      minimumRequired,
      onLeave: onLeave.length,
    };
  }
}
```

### Timesheet Processing

```typescript
@Injectable()
export class TimesheetService {
  async processTimesheet(userId: string, weekStart: Date): Promise<Timesheet> {
    // Get attendance logs for the week
    const weekEnd = addDays(weekStart, 6);
    const attendanceLogs = await this.getAttendanceLogs(
      userId,
      weekStart,
      weekEnd,
    );

    // Calculate totals
    const totals = this.calculateWeeklyTotals(attendanceLogs);

    // Create or update timesheet
    let timesheet = await this.timesheetRepository.findOne({
      where: { userId, weekStart },
    });

    if (!timesheet) {
      timesheet = await this.timesheetRepository.create({
        userId,
        weekStart,
        weekEnd,
        ...totals,
        status: 'DRAFT',
      });
    } else {
      Object.assign(timesheet, totals);
      await timesheet.save();
    }

    return timesheet;
  }

  private calculateWeeklyTotals(
    attendanceLogs: AttendanceLog[],
  ): TimesheetTotals {
    return attendanceLogs.reduce(
      (totals, log) => {
        if (!log.totalHours) return totals;

        totals.totalHours += log.totalHours;
        totals.regularHours += Math.min(log.totalHours, 8); // Assuming 8h regular
        totals.overtimeHours += Math.max(0, log.totalHours - 8);

        if (this.isWeekend(log.date)) {
          totals.weekendHours += log.totalHours;
        }

        if (this.isHoliday(log.date)) {
          totals.holidayHours += log.totalHours;
        }

        return totals;
      },
      {
        regularHours: 0,
        overtimeHours: 0,
        weekendHours: 0,
        holidayHours: 0,
        totalHours: 0,
      },
    );
  }

  @Cron('0 1 * * 1') // Monday 1 AM
  async generateWeeklyTimesheets(): Promise<void> {
    const lastWeekStart = addWeeks(startOfWeek(new Date()), -1);
    const activeEmployees = await this.userService.findActiveEmployees();

    for (const employee of activeEmployees) {
      try {
        await this.processTimesheet(employee.id, lastWeekStart);
      } catch (error) {
        this.logger.error(
          `Failed to generate timesheet for ${employee.id}: ${error.message}`,
        );
      }
    }
  }
}
```

---

## Integration Points

### Internal System Integrations

#### Keycloak Integration for Device Management

```typescript
@Injectable()
export class AttendanceDeviceService {
  async registerDevice(
    userId: string,
    deviceData: DeviceRegistrationData,
  ): Promise<AttendanceDevice> {
    // Check device limit
    const existingDevices = await this.findUserDevices(userId);
    if (existingDevices.length >= this.config.maxDevicesPerUser) {
      throw new BadRequestException('Maximum device limit reached');
    }

    // Create device record
    const device = await this.deviceRepository.create({
      userId,
      deviceFingerprint: deviceData.fingerprint,
      deviceName: deviceData.name,
      deviceType: deviceData.type,
      os: deviceData.os,
      browser: deviceData.browser,
      status: 'PENDING',
      ipAddress: deviceData.ipAddress,
      location: deviceData.location,
    });

    // Update Keycloak user attributes
    await this.updateKeycloakDeviceAttributes(userId, device);

    // Send approval notification to IT
    await this.notificationService.send({
      recipientId: this.getITManagerId(),
      type: 'DEVICE_REGISTRATION',
      title: 'New Device Registration',
      body: `${deviceData.name} device registered by ${userId}`,
      priority: 'MEDIUM',
      data: { deviceId: device.id },
    });

    return device;
  }

  private async updateKeycloakDeviceAttributes(
    userId: string,
    device: AttendanceDevice,
  ): Promise<void> {
    const keycloakAdmin = await this.getKeycloakAdminClient();

    // Get current attributes
    const user = await keycloakAdmin.users.findOne({ id: userId });
    const currentDevices = user.attributes?.registered_devices || [];

    // Add new device
    currentDevices.push(`${device.deviceType}:${device.deviceFingerprint}`);

    // Update attributes
    await keycloakAdmin.users.update({
      id: userId,
      realm: 'blih-hr',
      attributes: {
        ...user.attributes,
        registered_devices: currentDevices,
      },
    });
  }
}
```

#### Finance System Integration for Overtime

```typescript
@Injectable()
export class OvertimeFinanceService {
  async processOvertimePayment(
    overtimeRequest: OvertimeRequest,
  ): Promise<void> {
    const calculation = await this.calculateOvertimePayout(overtimeRequest);

    await this.financeService.createOvertimePayment({
      employeeId: overtimeRequest.userId,
      overtimeRequestId: overtimeRequest.id,
      date: overtimeRequest.date,
      hours: overtimeRequest.hours,
      rate: calculation.hourlyRate,
      multiplier: calculation.rateMultiplier,
      amount: calculation.payoutAmount,
      projectId: overtimeRequest.projectId,
      departmentBudget: overtimeRequest.departmentBudget,
    });

    // Update project budget if applicable
    if (overtimeRequest.projectId) {
      await this.financeService.updateProjectBudget({
        projectId: overtimeRequest.projectId,
        overtimeCost: calculation.payoutAmount,
      });
    }
  }

  async validateOvertimeBudget(
    userId: string,
    overtimeHours: number,
    date: Date,
  ): Promise<BudgetValidation> {
    const department = await this.getUserDepartment(userId);
    const monthlyBudget = await this.financeService.getDepartmentOvertimeBudget(
      department.id,
    );
    const currentUsage = await this.getCurrentMonthOvertimeUsage(
      department.id,
      date,
    );

    const projectedCost = await this.calculateOvertimeCost(
      userId,
      overtimeHours,
      date,
    );
    const remainingBudget = monthlyBudget - currentUsage;

    return {
      approved: projectedCost <= remainingBudget,
      remainingBudget,
      projectedCost,
      requiresApproval: projectedCost > remainingBudget * 0.8, // 80% threshold
    };
  }
}
```

### External System Integrations

#### Maps API Integration for Location Validation

```typescript
@Injectable()
export class LocationValidationService {
  constructor(@Inject('MAPS_API') private mapsApi: MapsApiService) {}

  async validateLocation(
    location: GeoLocation,
  ): Promise<LocationValidationResult> {
    // Reverse geocode to get address
    const address = await this.mapsApi.reverseGeocode({
      latitude: location.latitude,
      longitude: location.longitude,
    });

    // Check if address matches office location
    const officeAddress = await this.getOfficeAddress();
    const isOfficeLocation = this.compareAddresses(address, officeAddress);

    // Calculate distance to office
    const distance = await this.mapsApi.calculateDistance({
      origin: location,
      destination: officeAddress.coordinates,
    });

    return {
      isValid: isOfficeLocation && distance <= this.config.maxDistance,
      address,
      distance,
      isOfficeLocation,
      confidence: this.calculateConfidence(location, address),
    };
  }

  async getOfficeGeofence(): Promise<GeofencePolygon> {
    const officeLocation = await this.getOfficeLocation();

    // Create geofence polygon around office
    const radius = this.config.geoRadius; // meters
    const polygon = this.createCirclePolygon(
      officeLocation.latitude,
      officeLocation.longitude,
      radius,
    );

    return {
      type: 'Polygon',
      coordinates: [polygon],
      radius,
      center: officeLocation,
    };
  }
}
```

#### Calendar Integration for Leave Scheduling

```typescript
@Injectable()
export class LeaveCalendarService {
  constructor(
    @Inject('CALENDAR_API') private calendarApi: CalendarApiService,
  ) {}

  async createLeaveCalendarEvent(leaveRequest: LeaveRequest): Promise<string> {
    const employee = await this.userService.findById(leaveRequest.userId);

    const event = {
      summary: `Leave - ${employee.firstName} ${employee.lastName}`,
      description: this.formatLeaveDescription(leaveRequest),
      start: {
        date: leaveRequest.startDate.toISOString().split('T')[0],
        timeZone: 'Africa/Addis_Ababa',
      },
      end: {
        date: addDays(leaveRequest.endDate, 1).toISOString().split('T')[0], // +1 for inclusive
        timeZone: 'Africa/Addis_Ababa',
      },
      attendees: [
        { email: employee.email },
        ...(leaveRequest.handover?.delegateId
          ? [
              {
                email: await this.getUserEmail(
                  leaveRequest.handover.delegateId,
                ),
              },
            ]
          : []),
      ],
      extendedProperties: {
        private: {
          leaveRequestId: leaveRequest.id,
          leaveType: leaveRequest.leaveType,
          employeeId: leaveRequest.userId,
        },
      },
    };

    const calendarEvent = await this.calendarApi.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'all',
    });

    return calendarEvent.id;
  }

  async updateLeaveCalendarEvent(leaveRequest: LeaveRequest): Promise<void> {
    if (!leaveRequest.calendarEventId) return;

    const updateData = {
      summary: `Leave - ${this.getEmployeeName(leaveRequest.userId)} (${leaveRequest.status})`,
      description: this.formatLeaveDescription(leaveRequest),
      colorId: this.getStatusColor(leaveRequest.status),
    };

    await this.calendarApi.events.update({
      calendarId: 'primary',
      eventId: leaveRequest.calendarEventId,
      resource: updateData,
    });
  }
}
```

---

## Security & Permissions

### Permission Matrix

| Permission                    | Employee | Manager   | HR Manager  | Admin |
| ----------------------------- | -------- | --------- | ----------- | ----- |
| `hr:attendance:own`           | ✅       | ✅        | ✅          | ✅    |
| `hr:attendance:team`          | ❌       | ✅        | ✅          | ✅    |
| `hr:attendance:all`           | ❌       | ❌        | ✅          | ✅    |
| `hr:attendance:correct`       | ❌       | ✅ (team) | ✅          | ✅    |
| `hr:attendance:device:manage` | ✅       | ❌        | ✅          | ✅    |
| `hr:leave:request`            | ✅       | ✅        | ✅          | ✅    |
| `hr:leave:approve`            | ❌       | ✅ (team) | ✅          | ✅    |
| `hr:leave:admin`              | ❌       | ❌        | ✅          | ✅    |
| `hr:overtime:request`         | ✅       | ✅        | ✅          | ✅    |
| `hr:overtime:approve`         | ❌       | ✅        | ✅ (budget) | ✅    |
| `hr:timesheet:submit`         | ✅       | ✅        | ✅          | ✅    |
| `hr:timesheet:approve`        | ❌       | ✅ (team) | ✅          | ✅    |

### Security Measures

#### Location Spoofing Prevention

```typescript
@Injectable()
export class LocationSecurityService {
  async detectLocationSpoofing(
    userId: string,
    location: GeoLocation,
    deviceFingerprint: string,
  ): Promise<SpoofingDetectionResult> {
    const risks = [];

    // 1. Check for impossible movement speed
    const recentLocations = await this.getRecentLocations(userId, 24); // Last 24 hours
    for (const recent of recentLocations) {
      const distance = this.calculateDistance(location, recent.location);
      const timeDiff = this.differenceInHours(new Date(), recent.timestamp);
      const speed = distance / (timeDiff * 3600); // km/h

      if (speed > 1000) {
        // Impossible speed
        risks.push({
          type: 'IMPOSSIBLE_SPEED',
          severity: 'HIGH',
          details: `Speed: ${speed.toFixed(2)} km/h`,
        });
      }
    }

    // 2. Check for GPS spoofing indicators
    if (location.accuracy > 1000) {
      risks.push({
        type: 'POOR_GPS_ACCURACY',
        severity: 'MEDIUM',
        details: `Accuracy: ${location.accuracy}m`,
      });
    }

    // 3. Check for location consistency with device
    const deviceLocation = await this.getDeviceLastLocation(deviceFingerprint);
    if (deviceLocation) {
      const distance = this.calculateDistance(location, deviceLocation);
      if (distance > 50000) {
        // 50km difference
        risks.push({
          type: 'DEVICE_LOCATION_MISMATCH',
          severity: 'HIGH',
          details: `Distance: ${distance.toFixed(2)}km`,
        });
      }
    }

    // 4. Check for VPN/proxy usage
    const ipInfo = await this.getIPInfo(location.ipAddress);
    if (ipInfo.isVPN || ipInfo.isProxy) {
      risks.push({
        type: 'VPN_DETECTED',
        severity: 'MEDIUM',
        details: `IP: ${location.ipAddress}`,
      });
    }

    const overallRisk = this.calculateOverallRisk(risks);

    return {
      isSpoofing: overallRisk >= 0.7,
      riskLevel: overallRisk,
      risks,
      recommendation: this.getRecommendation(overallRisk),
    };
  }
}
```

#### Device Fingerprinting

```typescript
@Injectable()
export class DeviceFingerprintingService {
  generateFingerprint(request: Request): string {
    const components = {
      userAgent: request.headers['user-agent'],
      acceptLanguage: request.headers['accept-language'],
      acceptEncoding: request.headers['accept-encoding'],
      platform: request.headers['sec-ch-ua-platform'],
      mobile: request.headers['sec-ch-ua-mobile'],
      // Add more components as needed
    };

    // Create hash from components
    const fingerprint = crypto
      .createHash('sha256')
      .update(JSON.stringify(components))
      .digest('hex');

    return fingerprint;
  }

  async validateFingerprint(
    userId: string,
    fingerprint: string,
    ipAddress: string,
  ): Promise<ValidationResult> {
    const device = await this.deviceRepository.findOne({
      where: { deviceFingerprint: fingerprint },
    });

    if (!device) {
      return { valid: false, reason: 'DEVICE_NOT_REGISTERED' };
    }

    if (device.userId !== userId) {
      return { valid: false, reason: 'DEVICE_BELONGS_TO_OTHER_USER' };
    }

    if (device.status !== 'APPROVED') {
      return { valid: false, reason: 'DEVICE_NOT_APPROVED' };
    }

    if (device.revokedAt) {
      return { valid: false, reason: 'DEVICE_REVOKED' };
    }

    // Update device usage
    await this.deviceRepository.update(device.id, {
      lastLoginAt: new Date(),
      loginCount: device.loginCount + 1,
      ipAddress,
    });

    return { valid: true };
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

# PostGIS for location data
psql -d blih_hr_attendance -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Environment setup
cp .env.example .env
# Configure environment variables
```

#### Database Setup

```bash
# Create database with PostGIS extension
createdb blih_hr_attendance
psql -d blih_hr_attendance -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Run migrations
npm run migration:run

# Seed data
npm run seed:attendance
```

### Code Organization Patterns

#### Service Layer Structure

```typescript
@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceLog)
    private attendanceRepository: Repository<AttendanceLog>,
    private validationService: AttendanceValidationService,
    private deviceService: AttendanceDeviceService,
    private notificationService: NotificationService,
    private auditService: AuditService,
  ) {}

  async clockIn(userId: string, dto: ClockInDto): Promise<AttendanceLog> {
    // 1. Validate clock-in
    const validationResult = await this.validationService.validateClockIn(
      userId,
      dto,
    );
    if (!validationResult.valid) {
      return await this.createFlaggedLog(userId, dto, validationResult.reason);
    }

    // 2. Create attendance log
    const attendanceLog = await this.attendanceRepository.create({
      userId,
      clockIn: new Date(),
      method: dto.method,
      location: dto.location,
      deviceFingerprint: dto.deviceFingerprint,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      status: 'ACTIVE',
    });

    // 3. Save and return
    const savedLog = await this.attendanceRepository.save(attendanceLog);

    // 4. Send notifications
    await this.notificationService.sendClockInNotification(userId, savedLog);

    // 5. Start work timer
    await this.startWorkTimer(userId);

    // 6. Audit log
    await this.auditService.logAction('CLOCK_IN', savedLog.id, userId);

    return savedLog;
  }

  async clockOut(userId: string, dto: ClockOutDto): Promise<AttendanceLog> {
    // 1. Find today's log
    const todayLog = await this.findTodayLog(userId);
    if (!todayLog || !todayLog.clockIn) {
      throw new BadRequestException('No clock-in found for today');
    }

    // 2. Validate clock-out
    const validationResult = await this.validationService.validateClockOut(
      userId,
      dto,
    );
    if (!validationResult.valid) {
      throw new BadRequestException(validationResult.reason);
    }

    // 3. Calculate work hours
    const workHours = this.calculateWorkHours(todayLog.clockIn, new Date());
    const overtimeHours = await this.calculateOvertimeHours(
      userId,
      todayLog.date,
      workHours,
    );

    // 4. Update log
    todayLog.clockOut = new Date();
    todayLog.totalHours = workHours;
    todayLog.overtime = overtimeHours;
    todayLog.notes = dto.notes;

    const updatedLog = await this.attendanceRepository.save(todayLog);

    // 5. Stop work timer
    await this.stopWorkTimer(userId);

    // 6. Send notifications
    await this.notificationService.sendClockOutNotification(userId, updatedLog);

    // 7. Audit log
    await this.auditService.logAction('CLOCK_OUT', updatedLog.id, userId);

    return updatedLog;
  }
}
```

#### Validation Patterns

```typescript
export class ClockInDto {
  @IsString()
  @IsEnum(['WIFI', 'GEO', 'QR', 'WEBAUTHN'])
  method: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoLocationDto)
  location?: GeoLocationDto;

  @IsOptional()
  @IsString()
  qrToken?: string;

  @IsOptional()
  @IsString()
  webauthnAssertion?: string;

  @IsString()
  @Length(32, 255)
  deviceFingerprint: string;

  @IsIP()
  ipAddress: string;

  @IsString()
  @MaxLength(500)
  userAgent: string;
}

export class GeoLocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsNumber()
  @Min(0)
  accuracy: number;

  @IsDateString()
  timestamp: string;
}

export class LeaveRequestDto {
  @IsString()
  @IsEnum([
    'ANNUAL',
    'SICK',
    'MATERNITY',
    'PATERNITY',
    'BEREAVEMENT',
    'STUDY',
    'UNPAID',
  ])
  leaveType: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  @Min(0.5)
  @Max(365)
  daysCount: number;

  @IsBoolean()
  @IsOptional()
  halfDay?: boolean = false;

  @IsString()
  @IsEnum(['FIRST_HALF', 'SECOND_HALF'])
  @IsOptional()
  halfDayType?: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  reason?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  contactInfo?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => HandoverDto)
  handover?: HandoverDto;
}
```

---

## Testing Procedures

### Unit Testing Example

```typescript
describe('OvertimeCalculationService', () => {
  let service: OvertimeCalculationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OvertimeCalculationService],
    }).compile();

    service = module.get<OvertimeCalculationService>(
      OvertimeCalculationService,
    );
  });

  describe('calculateOvertime', () => {
    it('should calculate weekday overtime correctly', async () => {
      const date = new Date('2026-02-27'); // Friday
      const hoursWorked = 10; // 2 hours overtime

      const result = await service.calculateOvertime(
        'user-uuid',
        date,
        hoursWorked,
      );

      expect(result.overtimeHours).toBe(2);
      expect(result.rateMultiplier).toBe(1.5);
      expect(result.overtimeType).toBe('WEEKDAY_EARLY');
    });

    it('should calculate weekend overtime correctly', async () => {
      const date = new Date('2026-02-28'); // Saturday
      const hoursWorked = 8;

      const result = await service.calculateOvertime(
        'user-uuid',
        date,
        hoursWorked,
      );

      expect(result.overtimeHours).toBe(8);
      expect(result.rateMultiplier).toBe(2.0);
      expect(result.overtimeType).toBe('WEEKEND');
    });

    it('should enforce monthly overtime cap', async () => {
      // Mock monthly overtime already at cap
      jest.spyOn(service, 'getMonthlyOvertime').mockResolvedValue(39);

      const date = new Date('2026-02-27');
      const hoursWorked = 10;

      const result = await service.calculateOvertime(
        'user-uuid',
        date,
        hoursWorked,
      );

      expect(result.error).toBe('MONTHLY_OVERTIME_CAP_EXCEEDED');
      expect(result.maxAllowed).toBe(1);
      expect(result.requiresApproval).toBe('CEO');
    });
  });
});
```

### Integration Testing Example

```typescript
describe('AttendanceController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/api/hr/attendance/clock-in (POST)', () => {
    it('should clock in successfully with valid location', () => {
      return request(app.getHttpServer())
        .post('/api/hr/attendance/clock-in')
        .set('Authorization', 'Bearer employee-token')
        .send({
          method: 'GEO',
          location: {
            latitude: 9.145,
            longitude: 40.4897,
            accuracy: 10,
            timestamp: '2026-02-27T08:30:00Z',
          },
          deviceFingerprint: 'device-123',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.clockIn).toBeDefined();
          expect(res.body.status).toBe('ACTIVE');
        });
    });

    it('should reject clock-in outside geofence', () => {
      return request(app.getHttpServer())
        .post('/api/hr/attendance/clock-in')
        .set('Authorization', 'Bearer employee-token')
        .send({
          method: 'GEO',
          location: {
            latitude: 9.0, // Far from office
            longitude: 40.0,
            accuracy: 10,
            timestamp: '2026-02-27T08:30:00Z',
          },
          deviceFingerprint: 'device-123',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('OUTSIDE_GEOFENCE');
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
DATABASE_URL=postgresql://user:password@localhost:5432/blih_hr_attendance
DATABASE_SSL=true

# PostGIS for location data
POSTGIS_VERSION=3.3

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Authentication
KEYCLOAK_URL=https://keycloak.example.com
KEYCLOAK_REALM=blih-hr
KEYCLOAK_CLIENT_ID=attendance-service

# Location Services
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
OFFICE_LATITUDE=9.1450
OFFICE_LONGITUDE=40.4897
GEOFENCE_RADIUS=100

# Calendar Integration
GOOGLE_CALENDAR_CLIENT_ID=your-calendar-client-id
GOOGLE_CALENDAR_CLIENT_SECRET=your-calendar-client-secret

# Email Service
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=hr@example.com
SMTP_PASS=smtp-password

# Security
DEVICE_ENCRYPTION_KEY=your-device-encryption-key
JWT_SECRET=your-jwt-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### Docker Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine

# Install PostGIS dependencies
RUN apk add --no-cache postgresql-client

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
  attendance-api:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/blih_hr_attendance
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgis/postgis:14-3.3
    environment:
      - POSTGRES_DB=blih_hr_attendance
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
      - attendance-api
    restart: unless-stopped

volumes:
  postgres_data:
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Location Validation Issues

**Problem:** GPS validation failing for valid locations

```
Expected: Valid location, Actual: Outside geofence
```

**Diagnosis:**

```typescript
// Debug location validation
async function debugLocationValidation(location: GeoLocation) {
  console.log('Input location:', location);

  const officeLocation = await getOfficeLocation();
  const distance = calculateDistance(location, officeLocation);

  console.log('Office location:', officeLocation);
  console.log('Calculated distance:', distance);
  console.log('Geofence radius:', process.env.GEOFENCE_RADIUS);

  // Check coordinate precision
  console.log('Coordinate precision:', {
    latPrecision: location.latitude.toString().split('.')[1]?.length,
    lngPrecision: location.longitude.toString().split('.')[1]?.length,
  });
}
```

**Solutions:**

1. Check coordinate precision and rounding
2. Verify office location coordinates
3. Adjust geofence radius if too strict
4. Check for coordinate system mismatches

#### Overtime Calculation Issues

**Problem:** Incorrect overtime rate application

```
Expected: 1.5x rate, Actual: 2.0x rate
```

**Diagnosis:**

```sql
-- Check overtime calculation logs
SELECT * FROM audit_logs
WHERE action = 'OVERTIME_CALCULATED'
AND created_at >= '2026-02-27'
ORDER BY created_at DESC;

-- Check shift configurations
SELECT * FROM employee_shifts
WHERE user_id = 'problem-user-id';
```

**Solutions:**

1. Verify shift configuration
2. Check holiday calendar
3. Validate time zone handling
4. Review overtime rule priorities

#### Leave Balance Issues

**Problem:** Leave balance not updating correctly

```
Expected: 15 days, Actual: 12 days
```

**Diagnosis:**

```typescript
// Debug leave balance calculation
async function debugLeaveBalance(userId: string, leaveType: string) {
  const user = await userService.findById(userId);
  const balance = await leaveBalanceService.findOne(userId, leaveType, 2026);

  console.log('User info:', {
    hireDate: user.hiredAt,
    employmentType: user.employmentType,
    monthsEmployed: differenceInMonths(new Date(), user.hiredAt),
  });

  console.log('Current balance:', balance);

  // Check accrual rate
  const accrualRate = leaveBalanceService.getAccrualRate(
    user.employmentType,
    leaveType,
  );
  console.log('Accrual rate:', accrualRate);

  // Check used leave
  const usedLeave = await leaveRequestRepository.sum('daysCount', {
    where: {
      userId,
      leaveType,
      status: 'APPROVED',
      startDate: { gte: new Date(2026, 0, 1) },
    },
  });
  console.log('Used leave:', usedLeave);
}
```

**Solutions:**

1. Check hire date calculation
2. Verify accrual rate settings
3. Review leave approval status
4. Check for duplicate leave requests

### Performance Optimization

#### Database Optimization

```sql
-- Add indexes for location queries
CREATE INDEX CONCURRENTLY idx_attendance_location
ON attendance_logs USING GIST (ST_Point(location[0], location[1]));

-- Optimize date range queries
CREATE INDEX CONCURRENTLY idx_attendance_date_status
ON attendance_logs(date, status);

-- Partition attendance logs by year
CREATE TABLE attendance_logs_2026 PARTITION OF attendance_logs
FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

#### Caching Strategy

```typescript
@Injectable()
export class AttendanceCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getTodayAttendance(userId: string): Promise<AttendanceLog> {
    const cacheKey = `attendance:today:${userId}`;
    const today = new Date().toDateString();

    // Try cache first
    let attendance = await this.cacheManager.get<AttendanceLog>(cacheKey);

    if (!attendance || attendance.date.toDateString() !== today) {
      // Load from database
      attendance = await this.attendanceRepository.findOne({
        where: { userId, date: new Date() },
      });

      // Cache for 1 hour
      await this.cacheManager.set(cacheKey, attendance, 3600);
    }

    return attendance;
  }

  async invalidateAttendanceCache(userId: string): Promise<void> {
    const patterns = [
      `attendance:today:${userId}`,
      `attendance:week:${userId}`,
      `leave:balance:${userId}`,
    ];

    await Promise.all(
      patterns.map((pattern) => this.cacheManager.del(pattern)),
    );
  }
}
```

This comprehensive documentation provides complete technical guidance for implementing and maintaining the HR Attendance & Leave Management System.
