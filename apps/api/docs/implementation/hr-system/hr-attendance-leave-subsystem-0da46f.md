# HR Attendance & Leave Management Subsystem Implementation Plan

**Purpose:** Comprehensive attendance tracking and leave management system with multiple clock-in methods, automated overtime calculation, and leave balance management.  
**Timeline:** 4 weeks development + 1 week testing  
**Priority:** High - Daily operations critical

---

## Overview

The Attendance & Leave Management subsystem handles employee presence tracking, leave requests and approvals, overtime calculation, and attendance analytics. This includes 6 core forms covering clock-in/out, leave requests, timesheets, and attendance corrections.

---

## Implementation Structure

### File Organization

```
src/domains/hr/attendance/
├── attendance.module.ts
├── attendance.controller.ts
├── attendance.service.ts
├── dto/
│   ├── clock-in.dto.ts
│   ├── clock-out.dto.ts
│   ├── leave-request.dto.ts
│   ├── timesheet.dto.ts
│   ├── attendance-correction.dto.ts
│   └── overtime-request.dto.ts
├── entities/
│   ├── attendance-log.entity.ts
│   ├── leave-request.entity.ts
│   ├── leave-balance.entity.ts
│   ├── timesheet.entity.ts
│   ├── overtime-request.entity.ts
│   └── attendance-device.entity.ts
├── use-cases/
│   ├── clock-in-out.usecase.ts
│   ├── process-leave-request.usecase.ts
│   ├── calculate-overtime.usecase.ts
│   ├── manage-timesheet.usecase.ts
│   └── attendance-analytics.usecase.ts
└── services/
    ├── location-validator.service.ts
    ├── device-manager.service.ts
    ├── leave-calculator.service.ts
    └── overtime-calculator.service.ts
```

---

## Database Schema Extensions

### New Models Required

```prisma
model AttendanceLog {
  id            String    @id @default(uuid()) @db.Uuid
  userId        String    @db.Uuid
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Clock-in/out data
  clockIn       DateTime?
  clockOut      DateTime?
  breakStart    DateTime?
  breakEnd      DateTime?
  totalHours    Float?
  overtime      Float     @default(0)

  // Validation data
  method        String    // WIFI/GEO/QR/WEBAUTHN/MANUAL
  location      Json?     // GPS coordinates, IP address
  deviceFingerprint String?
  ipAddress     String?
  userAgent     String?

  // Status and flags
  status        String    @default(ACTIVE) // ACTIVE/CORRECTED/FLAGGED
  flagged       Boolean   @default(false)
  flagReason    String?
  approvedBy    String?   @db.Uuid
  approvedAt    DateTime?

  // Notes and corrections
  notes         String?
  correctionReason String?
  originalLogId String?   @db.Uuid // For correction history

  // Date tracking
  date          DateTime  @default(now())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([userId, date])
  @@index([status, flagged])
  @@index([clockIn])
}

model LeaveRequest {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @db.Uuid
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Leave details
  leaveType   String    // ANNUAL/SICK/MATERNITY/PATERNITY/BEREAVEMENT/STUDY/UNPAID
  startDate   DateTime
  endDate     DateTime
  daysCount   Float
  halfDay     Boolean   @default(false)
  halfDayType String?   // FIRST_HALF/SECOND_HALF

  // Request details
  reason      String?
  contactInfo String?    // Emergency contact during leave
  handover    Json?      // Handover plan and delegate

  // Approval workflow
  status      String    @default(PENDING) // PENDING/APPROVED/REJECTED/CANCELLED
  approvedBy  String?   @db.Uuid
  approver    User?     @relation("LeaveApprover", fields: [approvedBy], references: [id])
  approvedAt  DateTime?
  rejectionReason String?

  // Balance impact
  balanceBefore Float?
  balanceAfter  Float?

  // Metadata
  requestedAt DateTime  @default(now())
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId, status])
  @@index([approvedBy, status])
  @@index([startDate, endDate])
}

model LeaveBalance {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @db.Uuid
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Balance details
  leaveType   String
  year        Int
  entitled    Float    // Total entitled for year
  accrued     Float    // Amount accrued so far
  used        Float    @default(0) // Used this year
  pending     Float    @default(0) // Approved but not taken
  available   Float    // Calculated: accrued - used - pending

  // Accrual settings
  accrualRate Float     // Monthly accrual rate
  maxCarryOver Float?   // Maximum days that can be carried over

  // Metadata
  lastUpdated DateTime  @default(now())
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([userId, leaveType, year])
  @@index([year])
}

model Timesheet {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @db.Uuid
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Timesheet period
  weekStart   DateTime
  weekEnd     DateTime
  status      String    @default(DRAFT) // DRAFT/SUBMITTED/APPROVED/REJECTED

  // Time breakdown
  regularHours Float     @default(0)
  overtimeHours Float    @default(0)
  weekendHours Float    @default(0)
  holidayHours Float    @default(0)
  totalHours  Float     @default(0)

  // Project breakdown
  projectTime Json      // Array of {projectId, hours, task}

  // Approval workflow
  submittedBy String    @db.Uuid
  submittedAt DateTime?
  approvedBy  String?   @db.Uuid
  approver    User?     @relation("TimesheetApprover", fields: [approvedBy], references: [id])
  approvedAt  DateTime?
  rejectionReason String?

  // Metadata
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([userId, weekStart])
  @@index([status, weekStart])
}

model OvertimeRequest {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @db.Uuid
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Overtime details
  date        DateTime
  startTime   DateTime
  endTime     DateTime
  hours       Float
  reason      String

  // Project details
  projectId   String?   @db.Uuid
  task        String?

  // Approval workflow
  status      String    @default(PENDING) // PENDING/APPROVED/REJECTED
  approvedBy  String?   @db.Uuid
  approver    User?     @relation("OTApprover", fields: [approvedBy], references: [id])
  approvedAt  DateTime?
  rejectionReason String?

  // Budget tracking
  budgetImpact Float?
  departmentBudget String?

  // Metadata
  requestedAt DateTime  @default(now())
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId, date, status])
}

model AttendanceDevice {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @db.Uuid
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Device details
  deviceFingerprint String @unique
  deviceName   String
  deviceType   String    // MOBILE/DESKTOP/TABLET
  os           String?
  browser      String?

  // Registration and status
  status       String    @default(PENDING) // PENDING/APPROVED/REVOKED
  registeredAt DateTime  @default(now())
  approvedBy   String?   @db.Uuid
  approvedAt   DateTime?
  revokedAt    DateTime?

  // Usage tracking
  lastLoginAt  DateTime?
  loginCount   Int       @default(0)

  // Metadata
  ipAddress    String?
  location     Json?

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([userId, status])
}
```

---

## Core Implementation Components

### 1. Clock-in/Out System

**Features:**

- Multiple validation methods (WiFi, GPS, QR, WebAuthn)
- Real-time location validation
- Device registration and management
- Automated overtime calculation

**Key Endpoints:**

```typescript
POST /hr/attendance/clock-in          // Clock in with validation
POST /hr/attendance/clock-out         // Clock out
GET  /hr/attendance/today-status      // Get today's attendance status
POST /hr/attendance/register-device   // Register new device
GET  /hr/attendance/devices           // List registered devices
```

**Clock-in Validation Logic:**

```typescript
async clockIn(userId: string, dto: ClockInDto): Promise<AttendanceLog> {
  // 1. Validate time window
  const timeWindow = this.getTimeWindow('morning_check_in');
  if (!this.isWithinTimeWindow(new Date(), timeWindow)) {
    throw new BadRequestException('Outside allowed clock-in time');
  }

  // 2. Check for existing clock-in today
  const existingLog = await this.findTodayLog(userId);
  if (existingLog?.clockIn) {
    throw new BadRequestException('Already clocked in today');
  }

  // 3. Validate location/device
  const validationResult = await this.validateClockIn(userId, dto);
  if (!validationResult.valid) {
    return await this.createFlaggedLog(userId, dto, validationResult.reason);
  }

  // 4. Create attendance log
  const attendanceLog = await this.createAttendanceLog({
    userId,
    clockIn: new Date(),
    method: dto.method,
    location: dto.location,
    deviceFingerprint: dto.deviceFingerprint,
    ipAddress: dto.ipAddress,
    userAgent: dto.userAgent
  });

  // 5. Send notifications
  await this.sendClockInNotification(userId, attendanceLog);

  // 6. Handle timer integration
  await this.startWorkTimer(userId);

  return attendanceLog;
}

async validateClockIn(userId: string, dto: ClockInDto): Promise<ValidationResult> {
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
```

**Location Validation:**

```typescript
async validateGeoLocation(location: GeoLocation): Promise<ValidationResult> {
  // Check GPS accuracy
  if (location.accuracy > 100) {
    return { valid: false, reason: 'GPS_ACCURITY_POOR' };
  }

  // Check distance from office
  const officeLocation = await this.getOfficeLocation();
  const distance = this.calculateDistance(location, officeLocation);

  if (distance > this.config.geoRadius) {
    return {
      valid: false,
      reason: 'OUTSIDE_GEOFENCE',
      distance,
      maxDistance: this.config.geoRadius
    };
  }

  return { valid: true };
}

async validateWiFiConnection(ipAddress: string): Promise<ValidationResult> {
  const isOfficeNetwork = this.config.officeIpRanges.some(range =>
    this.isIpInRange(ipAddress, range)
  );

  if (!isOfficeNetwork) {
    return { valid: false, reason: 'NOT_ON_OFFICE_WIFI' };
  }

  return { valid: true };
}
```

### 2. Leave Management System

**Features:**

- Automated balance calculation
- Multi-level approval workflow
- Leave policy enforcement
- Calendar integration

**Leave Balance Calculation:**

```typescript
async calculateLeaveBalance(userId: string, leaveType: string, asOfDate: Date): Promise<LeaveBalance> {
  const user = await this.userService.findById(userId);
  const year = asOfDate.getFullYear();

  // Get or create balance record
  let balance = await this.leaveBalanceRepository.findOne({
    where: { userId, leaveType, year }
  });

  if (!balance) {
    balance = await this.createInitialBalance(userId, leaveType, year);
  }

  // Calculate accrued amount
  const monthsEmployed = this.differenceInMonths(asOfDate, user.hiredAt);
  const accruedRate = this.getAccrualRate(user.employmentType, leaveType);
  const accruedToDate = Math.min(monthsEmployed * accruedRate, balance.entitled);

  // Calculate used leave
  const usedLeave = await this.leaveRequestRepository.sum('daysCount', {
    where: {
      userId,
      leaveType,
      status: 'APPROVED',
      startDate: { gte: new Date(year, 0, 1) },
      endDate: { lt: new Date(year + 1, 0, 1) }
    }
  });

  // Calculate pending leave
  const pendingLeave = await this.leaveRequestRepository.sum('daysCount', {
    where: {
      userId,
      leaveType,
      status: 'APPROVED',
      startDate: { gt: asOfDate }
    }
  });

  // Update balance
  balance.accrued = accruedToDate;
  balance.used = usedLeave || 0;
  balance.pending = pendingLeave || 0;
  balance.available = accruedToDate - balance.used - balance.pending;

  await balance.save();
  return balance;
}
```

**Leave Request Validation:**

```typescript
async validateLeaveRequest(userId: string, dto: LeaveRequestDto): Promise<ValidationResult> {
  const errors = [];

  // 1. Check balance
  const balance = await this.calculateLeaveBalance(userId, dto.leaveType, new Date());
  if (dto.daysCount > balance.available) {
    errors.push({
      field: 'daysCount',
      message: `Insufficient balance. Available: ${balance.available}, Requested: ${dto.daysCount}`,
      code: 'INSUFFICIENT_BALANCE'
    });
  }

  // 2. Check notice period
  const minNoticeDays = this.getMinNoticePeriod(dto.leaveType);
  const daysUntilStart = this.differenceInBusinessDays(dto.startDate, new Date());
  if (daysUntilStart < minNoticeDays) {
    errors.push({
      field: 'startDate',
      message: `Minimum ${minNoticeDays} business days notice required`,
      code: 'INSUFFICIENT_NOTICE'
    });
  }

  // 3. Check overlapping leaves
  const overlapping = await this.findOverlappingLeaves(userId, dto.startDate, dto.endDate);
  if (overlapping.length > 0) {
    errors.push({
      field: 'dates',
      message: 'Overlapping leave request exists',
      code: 'OVERLAPPING_LEAVE'
    });
  }

  // 4. Check blackout dates
  const blackoutDates = await this.getBlackoutDates(userId);
  if (this.datesOverlap(dto.startDate, dto.endDate, blackoutDates)) {
    errors.push({
      field: 'dates',
      message: 'Request conflicts with blackout period',
      code: 'BLACKOUT_PERIOD',
      requiresCEOOverride: true
    });
  }

  // 5. Check handover for long leaves
  if (dto.daysCount >= 5 && !dto.handover?.delegateId) {
    errors.push({
      field: 'handover',
      message: 'Leave > 5 days requires handover delegate',
      code: 'HANDOVER_REQUIRED'
    });
  }

  return { valid: errors.length === 0, errors };
}
```

### 3. Overtime Calculation System

**Features:**

- Complex overtime rules
- Budget validation
- Automatic calculation
- Approval workflow

**Overtime Calculation Logic:**

```typescript
async calculateOvertime(userId: string, date: Date, hoursWorked: number): Promise<OvertimeCalculation> {
  const user = await this.userService.findById(userId);
  const shift = await this.getEmployeeShift(userId, date);
  const regularHours = shift.durationHours;

  let overtimeHours = 0;
  let overtimeType = null;
  let rateMultiplier = 1.0;

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
      requiresApproval: 'CEO'
    };
  }

  const hourlyRate = await this.getHourlyRate(userId);

  return {
    overtimeHours: Math.round(overtimeHours * 100) / 100,
    rateMultiplier,
    overtimeType,
    payoutAmount: Math.round(overtimeHours * hourlyRate * rateMultiplier * 100) / 100,
    hourlyRate
  };
}
```

### 4. Timesheet Management

**Features:**

- Weekly timesheet submission
- Project time allocation
- Automated calculation
- Approval workflow

**Timesheet Processing:**

```typescript
async processTimesheet(userId: string, weekStart: Date): Promise<Timesheet> {
  // Get attendance logs for the week
  const weekEnd = addDays(weekStart, 6);
  const attendanceLogs = await this.getAttendanceLogs(userId, weekStart, weekEnd);

  // Calculate totals
  const totals = this.calculateWeeklyTotals(attendanceLogs);

  // Create or update timesheet
  let timesheet = await this.timesheetRepository.findOne({
    where: { userId, weekStart }
  });

  if (!timesheet) {
    timesheet = await this.timesheetRepository.create({
      userId,
      weekStart,
      weekEnd,
      ...totals,
      status: 'DRAFT'
    });
  } else {
    Object.assign(timesheet, totals);
    await timesheet.save();
  }

  return timesheet;
}

calculateWeeklyTotals(attendanceLogs: AttendanceLog[]): TimesheetTotals {
  return attendanceLogs.reduce((totals, log) => {
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
  }, {
    regularHours: 0,
    overtimeHours: 0,
    weekendHours: 0,
    holidayHours: 0,
    totalHours: 0
  });
}
```

---

## Implementation Phases

### Week 1: Foundation & Clock-in System

- Database schema creation
- Basic attendance logging
- Device registration system
- Time window validation

### Week 2: Location & Device Validation

- WiFi validation implementation
- GPS location validation
- QR code validation
- WebAuthn integration

### Week 3: Leave Management System

- Leave balance calculation
- Leave request workflow
- Approval system
- Calendar integration

### Week 4: Overtime & Timesheet System

- Overtime calculation rules
- Timesheet processing
- Budget validation
- Analytics and reporting

### Week 5: Testing & Integration

- End-to-end workflow testing
- Performance optimization
- Security validation
- Mobile app integration testing

---

## Integration Points

### Internal Systems

- **Notifications:** Real-time attendance alerts
- **Finance:** Overtime cost tracking
- **HR:** Leave balance updates
- **Audit:** Complete attendance logging

### External Systems

- **Calendar:** Leave calendar integration
- **Mobile App:** Push notifications
- **Email:** Attendance reports
- **Maps:** Location validation

---

## Security & Permissions

### Required Permissions

```typescript
const ATTENDANCE_PERMISSIONS = {
  'hr:attendance:own': ['EMPLOYEE'],
  'hr:attendance:team': ['MANAGER'],
  'hr:attendance:all': ['HR_MANAGER'],
  'hr:attendance:correct': ['HR_MANAGER', 'MANAGER'],
  'hr:leave:request': ['EMPLOYEE'],
  'hr:leave:approve': ['MANAGER', 'HR_MANAGER'],
  'hr:leave:admin': ['HR_MANAGER'],
  'hr:overtime:request': ['EMPLOYEE', 'MANAGER'],
  'hr:overtime:approve': ['MANAGER', 'HR_MANAGER', 'FINANCE_MANAGER'],
  'hr:timesheet:submit': ['EMPLOYEE'],
  'hr:timesheet:approve': ['MANAGER', 'HR_MANAGER'],
};
```

### Security Measures

- Location spoofing detection
- Device fingerprinting
- IP validation
- Audit trail for all corrections
- Rate limiting for clock-in attempts

---

## Success Metrics

### Operational Metrics

- **Attendance Accuracy:** 99%+ accurate records
- **Leave Processing:** 95%+ processed within 24 hours
- **Overtime Calculation:** 100% accurate calculations
- **Timesheet Submission:** 90%+ on-time submission

### Technical Metrics

- **Clock-in Response Time:** < 500ms
- **System Availability:** 99.9%
- **Mobile App Performance:** < 2s load time
- **Location Validation:** < 1s processing

---

## Testing Strategy

### Unit Tests

- Overtime calculation accuracy
- Leave balance algorithms
- Validation logic
- Time window calculations

### Integration Tests

- Location validation services
- Device registration
- Calendar integration
- Notification systems

### E2E Tests

- Complete attendance workflow
- Leave request lifecycle
- Overtime approval process
- Timesheet submission and approval

This subsystem handles daily critical operations and must be highly reliable, secure, and performant with excellent mobile experience for field employees.
