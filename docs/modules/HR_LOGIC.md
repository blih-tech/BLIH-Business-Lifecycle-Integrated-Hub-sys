# BLIH HR Module - Backend Logic Documentation

**Purpose:** Backend developer guide for HR business logic, rules, and workflows  
**Audience:** Backend Developers, API Engineers, System Architects  
**Version:** 1.0 | February 2026

---

## Table of Contents
1. [Global Business Rules](#1-global-business-rules)
2. [Sub-System 1: Recruitment Logic](#2-sub-system-1-recruitment-logic)
3. [Sub-System 2: Onboarding Logic](#3-sub-system-2-onboarding-logic)
4. [Sub-System 3: Employee Records Logic](#4-sub-system-3-employee-records-logic)
5. [Sub-System 4: Attendance & Leave Logic](#5-sub-system-4-attendance--leave-logic)
6. [Sub-System 5: Performance & OKR Logic](#6-sub-system-5-performance--okr-logic)
7. [Sub-System 6: Training Logic](#7-sub-system-6-training-logic)
8. [Sub-System 7: Employee Relations Logic](#8-sub-system-7-employee-relations-logic)
9. [Sub-System 8: Offboarding Logic](#9-sub-system-8-offboarding-logic)
10. [Notification Engine](#10-notification-engine)
11. [Approval Workflow Engine](#11-approval-workflow-engine)

---

## 1. Global Business Rules

### 1.1 Employee Status Lifecycle

```
DRAFT → ONBOARDING → ACTIVE → [SUSPENDED/ON_LEAVE] → [RESIGNED/TERMINATED]
```

**State Transition Rules:**
- `DRAFT`: New record created, not yet verified
- `ONBOARDING`: Join date reached, checklist in progress
- `ACTIVE`: All onboarding tasks complete AND probation passed (if applicable)
- `SUSPENDED`: Manual only, requires CEO approval, duration max 30 days
- `ON_LEAVE`: Auto-set when approved leave covers today, reverts to ACTIVE when leave ends
- `RESIGNED`: Exit process initiated, can't be reversed
- `TERMINATED`: Disciplinary or contract end, immediate effect

**Validation:**
```javascript
// Status change validation
function canChangeStatus(currentStatus, newStatus, context) {
  const validTransitions = {
    'DRAFT': ['ONBOARDING', 'ACTIVE'],
    'ONBOARDING': ['ACTIVE', 'TERMINATED'],
    'ACTIVE': ['SUSPENDED', 'ON_LEAVE', 'RESIGNED', 'TERMINATED'],
    'SUSPENDED': ['ACTIVE', 'TERMINATED'],
    'ON_LEAVE': ['ACTIVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED'],
    'RESIGNED': [], // Terminal state
    'TERMINATED': [] // Terminal state
  };
  
  return validTransitions[currentStatus]?.includes(newStatus);
}
```

### 1.2 Employment Type Rules

| Type | Probation Period | Leave Accrual | Notice Period |
|------|------------------|---------------|---------------|
| FULL_TIME | 3-6 months (configurable) | 1.67 days/month | 30 days |
| PART_TIME | 1-3 months | Prorated (0.83 days/month) | 14 days |
| CONTRACT | None or per contract | Per contract terms | Per contract |
| INTERN | 1 month | None (except study leave) | 7 days |
| CONSULTANT | None | None | Per SOW |

### 1.3 Data Privacy & Access Control

**Field-Level Permissions:**
```javascript
const FieldAccess = {
  'personal_info.phone': ['EMPLOYEE', 'HR', 'MANAGER'],
  'personal_info.address': ['EMPLOYEE', 'HR'],
  'compensation.base_salary': ['EMPLOYEE', 'HR', 'FINANCE'],
  'compensation.bank_account': ['EMPLOYEE', 'HR'],
  'performance.reviews': ['EMPLOYEE', 'MANAGER', 'HR'],
  'disciplinary_records': ['HR', 'CEO'] // Employee excluded
};
```

**Audit Trail Requirements:**
- All status changes: WHO, WHEN, OLD_VALUE, NEW_VALUE, REASON
- Sensitive field changes: Additional approval required
- Bulk operations: Must log each record individually

---

## 2. Sub-System 1: Recruitment Logic

### 2.1 Job Posting Workflow

```
DRAFT → PENDING_APPROVAL → APPROVED → PUBLISHED → [FILLED/EXPIRED/CANCELLED]
```

**Business Rules:**
1. **Approval Chain:**
   - Regular roles: Hiring Manager → Department Head → HR → CEO
   - Senior roles (Lead+): Hiring Manager → Department Head → HR → CEO
   - Budget > ETB 100K/month: Additional Finance approval

2. **Auto-Publish Conditions:**
   - All approvals received
   - Valid salary range (min < max, both > 0)
   - Required skills specified (min 3)

3. **Expiry Logic:**
   - Default: 30 days from publish
   - Auto-extend if < 5 applications at day 25 (notify HR)
   - Auto-close at 90 days (require reposting)

### 2.2 Candidate Scoring Algorithm

```javascript
function calculateMatchScore(candidate, jobRequirements) {
  const weights = {
    experience: 0.30,
    skills: 0.35,
    education: 0.15,
    culture_fit: 0.10,
    communication: 0.10
  };
  
  let score = 0;
  
  // Experience (0-100)
  const expMatch = Math.min(
    (candidate.years_experience / jobRequirements.min_years) * 100, 
    100
  );
  score += expMatch * weights.experience;
  
  // Skills (0-100)
  const requiredSkills = jobRequirements.skills;
  const matchedSkills = candidate.skills.filter(s => 
    requiredSkills.includes(s)
  ).length;
  const skillsMatch = (matchedSkills / requiredSkills.length) * 100;
  score += skillsMatch * weights.skills;
  
  // Education (binary: 100 if meets, 0 if not)
  const eduMatch = meetsEducationRequirement(
    candidate.education, 
    jobRequirements.education_level
  ) ? 100 : 0;
  score += eduMatch * weights.education;
  
  // Culture fit & communication (manual rating 1-5)
  score += (candidate.culture_fit_rating / 5) * 100 * weights.culture_fit;
  score += (candidate.communication_rating / 5) * 100 * weights.communication;
  
  return Math.round(score);
}

// Score interpretation
// 90-100: Excellent match (auto-shortlist)
// 75-89: Good match (shortlist)
// 50-74: Potential (review required)
// <50: Poor match (auto-decline if enabled)
```

### 2.3 Interview Scheduling Logic

**Conflict Detection:**
```javascript
function canScheduleInterview(interviewerIds, proposedTime, duration) {
  // Check each interviewer availability
  for (const interviewerId of interviewerIds) {
    const conflicts = checkConflicts(interviewerId, proposedTime, duration);
    
    // Blockers (hard conflicts)
    if (conflicts.has_leave) return { canSchedule: false, reason: 'LEAVE' };
    if (conflicts.has_meeting) return { canSchedule: false, reason: 'MEETING' };
    
    // Soft conflicts (warnings)
    if (conflicts.has_tentative) return { canSchedule: true, warning: 'TENTATIVE_CONFLICT' };
    if (conflicts.outside_work_hours) return { canSchedule: true, warning: 'OVERTIME' };
  }
  
  return { canSchedule: true };
}
```

### 2.4 Offer Generation Rules

**Salary Calculation:**
```javascript
function calculateOfferSalary(candidateScore, marketRate, budgetMax, currentEmployees) {
  // Base: Market rate for role
  let offer = marketRate;
  
  // Adjustment for candidate quality
  if (candidateScore >= 95) offer *= 1.10; // 10% premium
  else if (candidateScore >= 85) offer *= 1.05; // 5% premium
  else if (candidateScore < 60) offer *= 0.95; // 5% discount
  
  // Internal equity check
  const teamAverage = calculateTeamAverage(currentEmployees);
  if (offer > teamAverage * 1.20) {
    // Flag for HR review - exceeding 20% of team average
    return { 
      salary: Math.min(offer, budgetMax), 
      warning: 'INTERNAL_EQUITY',
      requires_approval: true 
    };
  }
  
  // Budget ceiling
  offer = Math.min(offer, budgetMax);
  
  return { salary: Math.round(offer / 1000) * 1000, warning: null };
}
```

---

## 3. Sub-System 2: Onboarding Logic

### 3.1 Checklist Generation

**Auto-Generate Tasks Based On:**
```javascript
const onboardingRules = {
  all_employees: [
    { task: 'Create email account', dept: 'IT', due_days: -1 },
    { task: 'Prepare workstation', dept: 'ADMIN', due_days: -1 },
    { task: 'Add to payroll', dept: 'HR', due_days: 0 },
    { task: 'Issue access card', dept: 'ADMIN', due_days: 0 }
  ],
  by_employment_type: {
    'FULL_TIME': [
      { task: 'Enroll in benefits', dept: 'HR', due_days: 3 },
      { task: 'Assign mentor', dept: 'MANAGER', due_days: 1 }
    ],
    'CONTRACT': [
      { task: 'Prepare contract docs', dept: 'HR', due_days: -2 },
      { task: 'Set end date reminder', dept: 'HR', due_days: 0 }
    ]
  },
  by_role: {
    'MANAGER': [
      { task: 'Grant approval permissions', dept: 'IT', due_days: 0 },
      { task: 'Setup team calendar access', dept: 'IT', due_days: 0 }
    ],
    'ENGINEER': [
      { task: 'Create dev environment', dept: 'IT', due_days: 0 },
      { task: 'Grant code repo access', dept: 'IT', due_days: 0 }
    ]
  }
};

function generateOnboardingChecklist(employee) {
  const tasks = [...onboardingRules.all_employees];
  
  // Add type-specific tasks
  tasks.push(...onboardingRules.by_employment_type[employee.type] || []);
  
  // Add role-specific tasks
  tasks.push(...onboardingRules.by_role[employee.role] || []);
  
  // Calculate due dates
  return tasks.map(task => ({
    ...task,
    due_date: addBusinessDays(employee.join_date, task.due_days)
  }));
}
```

### 3.2 Probation Tracking

**Auto-Evaluation Triggers:**
```javascript
function checkProbationStatus(employee) {
  const today = new Date();
  const joinDate = employee.join_date;
  const probationEnd = addMonths(joinDate, employee.probation_months);
  
  const daysUntilEnd = differenceInBusinessDays(probationEnd, today);
  
  // Notifications
  if (daysUntilEnd === 30) {
    notify('HR', `Probation ending in 30 days: ${employee.name}`);
    notify('MANAGER', `Schedule probation review for ${employee.name}`);
  }
  
  if (daysUntilEnd === 7) {
    notify('MANAGER', `URGENT: Probation review due in 7 days for ${employee.name}`);
  }
  
  // Auto-actions at end
  if (today >= probationEnd && !employee.probation_review_completed) {
    // Escalate to HR
    createTask('HR', `Probation review overdue for ${employee.name}`);
    
    // If still no review after +14 days, flag for management
    if (daysUntilEnd <= -14) {
      notify('CEO', `Probation review critically overdue: ${employee.name}`);
    }
  }
}
```

### 3.3 Probation Decision Logic

```javascript
const probationOutcomes = {
  PASS: {
    actions: [
      'Update status to ACTIVE',
      'Convert to permanent (if applicable)',
      'Schedule 1-on-1 with manager',
      'Send congratulations email'
    ],
    notifications: ['EMPLOYEE', 'MANAGER', 'HR']
  },
  EXTEND: {
    conditions: 'Requires 2nd-level manager approval if > 3 months extension',
    actions: [
      'Set new probation end date',
      'Create development plan',
      'Schedule check-ins every 2 weeks'
    ],
    max_extension: 6 // months
  },
  FAIL: {
    actions: [
      'Initiate termination process',
      'Calculate final settlement',
      'Schedule exit interview',
      'Disable system access'
    ],
    requires_approval: ['HR', 'CEO']
  }
};
```

---

## 4. Sub-System 3: Employee Records Logic

### 4.1 Profile Change Approval

**Auto-Approval vs. Manual Review:**
```javascript
const profileChangeRules = {
  auto_approve: [
    'personal_info.phone',
    'emergency_contact.name',
    'emergency_contact.phone'
  ],
  require_hr_approval: [
    'personal_info.address',
    'bank_details.account_number',
    'bank_details.bank_name'
  ],
  require_manager_approval: [
    'work_preferences.flexible_hours',
    'work_preferences.remote_days'
  ],
  forbidden: [
    'employee_id',
    'employment.start_date',
    'compensation.base_salary' // Must go through salary adjustment process
  ]
};

function processProfileChange(employeeId, field, oldValue, newValue) {
  if (profileChangeRules.forbidden.includes(field)) {
    return { status: 'REJECTED', reason: 'FIELD_NOT_EDITABLE' };
  }
  
  if (profileChangeRules.auto_approve.includes(field)) {
    applyChange(employeeId, field, newValue);
    return { status: 'APPROVED', approved_at: new Date() };
  }
  
  if (profileChangeRules.require_hr_approval.includes(field)) {
    createApprovalRequest('HR', employeeId, field, oldValue, newValue);
    return { status: 'PENDING_HR_APPROVAL' };
  }
  
  // Default: require approval
  createApprovalRequest('MANAGER', employeeId, field, oldValue, newValue);
  return { status: 'PENDING_APPROVAL' };
}
```

### 4.2 Document Expiry Tracking

```javascript
function checkDocumentExpirations() {
  const documents = getDocumentsExpiringIn(30); // Next 30 days
  
  for (const doc of documents) {
    const daysUntilExpiry = differenceInDays(doc.expiry_date, today);
    
    if (daysUntilExpiry === 30) {
      notify('EMPLOYEE', `Your ${doc.type} expires in 30 days. Please renew.`);
      notify('HR', `${doc.employee_name}'s ${doc.type} expires in 30 days.`);
    }
    
    if (daysUntilExpiry === 7) {
      notify('EMPLOYEE', `URGENT: Your ${doc.type} expires in 7 days!`);
      notify('HR', `URGENT: ${doc.employee_name}'s ${doc.type} expires in 7 days.`);
      notify('MANAGER', `${doc.employee_name}'s document expiring soon - may affect work.`);
    }
    
    if (daysUntilExpiry <= 0) {
      // Document expired
      updateDocumentStatus(doc.id, 'EXPIRED');
      
      if (doc.is_mandatory) {
        notify('HR', `MANDATORY DOCUMENT EXPIRED: ${doc.employee_name} - ${doc.type}`);
        // May trigger suspension if work permit, etc.
        if (doc.type === 'WORK_PERMIT') {
          suggestStatusChange(doc.employee_id, 'SUSPENDED');
        }
      }
    }
  }
}
```

---

## 5. Sub-System 4: Attendance & Leave Logic

### 5.1 Leave Balance Calculation

```javascript
function calculateLeaveBalance(employee, leaveType, asOfDate) {
  const entitlement = getAnnualEntitlement(employee.employment_type, leaveType);
  
  // Calculate accrual (monthly)
  const monthsEmployed = differenceInMonths(asOfDate, employee.join_date);
  const accrualRate = entitlement / 12;
  const entitledToDate = Math.min(monthsEmployed * accrualRate, entitlement);
  
  // Get used leave
  const usedLeave = db.leave_requests.aggregate({
    employee_id: employee.id,
    leave_type: leaveType,
    status: 'APPROVED',
    year: asOfDate.getFullYear()
  }).sum('days_taken');
  
  // Get pending leave (reserved but not yet taken)
  const pendingLeave = db.leave_requests.aggregate({
    employee_id: employee.id,
    leave_type: leaveType,
    status: 'APPROVED',
    start_date: { $gt: asOfDate }
  }).sum('days_requested');
  
  return {
    entitled: Math.round(entitledToDate * 10) / 10,
    used: usedLeave,
    pending: pendingLeave,
    available: Math.round((entitledToDate - usedLeave - pendingLeave) * 10) / 10,
    next_accrual_date: getNextAccrualDate(asOfDate)
  };
}
```

**Leave Entitlements by Type:**
| Type | Full-Time | Part-Time | Contract | Notes |
|------|-----------|-----------|----------|-------|
| ANNUAL | 20 days | 10 days | Per contract | Accrues monthly |
| SICK | 10 days | 5 days | Per contract | Resets annually |
| MATERNITY | 90 days | 90 days | Per contract | Full pay |
| PATERNITY | 3 days | 3 days | Per contract | Full pay |
| BEREAVEMENT | 5 days | 5 days | Per contract | Immediate family only |
| STUDY | 5 days | 2 days | 0 | Per academic year |

### 5.2 Leave Request Validation

```javascript
function validateLeaveRequest(request) {
  const errors = [];
  
  // 1. Check balance
  const balance = calculateLeaveBalance(
    request.employee_id, 
    request.leave_type, 
    new Date()
  );
  
  if (request.days_requested > balance.available) {
    errors.push({
      field: 'days_requested',
      message: `Insufficient balance. Available: ${balance.available}, Requested: ${request.days_requested}`,
      code: 'INSUFFICIENT_BALANCE'
    });
  }
  
  // 2. Check notice period
  const minNoticeDays = getMinNoticePeriod(request.leave_type);
  const daysUntilStart = differenceInBusinessDays(
    request.start_date, 
    new Date()
  );
  
  if (daysUntilStart < minNoticeDays) {
    errors.push({
      field: 'start_date',
      message: `Minimum ${minNoticeDays} business days notice required`,
      code: 'INSUFFICIENT_NOTICE'
    });
  }
  
  // 3. Check overlapping leaves
  const overlapping = db.leave_requests.find({
    employee_id: request.employee_id,
    status: { $in: ['APPROVED', 'PENDING'] },
    $or: [
      { start_date: { $lte: request.end_date, $gte: request.start_date } },
      { end_date: { $gte: request.start_date, $lte: request.end_date } }
    ]
  });
  
  if (overlapping.length > 0) {
    errors.push({
      field: 'dates',
      message: 'Overlapping leave request exists',
      code: 'OVERLAPPING_LEAVE'
    });
  }
  
  // 4. Check blackout dates
  const blackoutDates = getBlackoutDates(request.employee_id);
  const overlapBlackout = datesOverlap(
    request.start_date, 
    request.end_date, 
    blackoutDates
  );
  
  if (overlapBlackout) {
    errors.push({
      field: 'dates',
      message: 'Request conflicts with blackout period (critical project/quarter end)',
      code: 'BLACKOUT_PERIOD',
      requires_ceo_override: true
    });
  }
  
  // 5. Check handover completeness
  if (request.days_requested >= 5 && !request.handover.delegate_id) {
    errors.push({
      field: 'handover',
      message: 'Leave > 5 days requires handover delegate',
      code: 'HANDOVER_REQUIRED'
    });
  }
  
  return { valid: errors.length === 0, errors };
}
```

### 5.3 Attendance Event Types & Time Windows

**Check-in/out Event Types:**
| Type | Window | Grace Period | Purpose |
|------|--------|--------------|---------|
| `morning_check_in` | 08:30-09:00 | 15 min | Start of workday |
| `lunch_check_out` | 12:00-13:30 | 15 min | Lunch break start |
| `afternoon_check_in` | 13:30-14:00 | 15 min | Return from lunch |
| `home_check_out` | 17:00-17:30 | 15 min | End of workday |

**Weekend & Holiday Rules:**
- **Sunday:** Always blocked (no check-in allowed)
- **Saturday:** Configurable via `enableSaturdayWork` flag
- **Saturday Windows:** If enabled, use `saturdayWindows` config instead of regular windows
- **Timezone:** All times calculated in org's configured timezone (default: Africa/Addis_Ababa)

**Time Window Logic:**
```javascript
function isWithinTimeWindow(timestamp, window, graceMinutes, timezone) {
  const timeInZone = formatInTimeZone(timestamp, timezone, 'HH:mm');
  const [currentHour, currentMin] = timeInZone.split(':').map(Number);
  const currentMinutes = currentHour * 60 + currentMin;
  
  const [startHour, startMin] = window.start.split(':').map(Number);
  const [endHour, endMin] = window.end.split(':').map(Number);
  
  const windowStart = startHour * 60 + startMin;
  const windowEnd = endHour * 60 + endMin + graceMinutes;
  
  return currentMinutes >= windowStart && currentMinutes <= windowEnd;
}
```

**Late & Early Detection:**
- **Late:** Check-in after window end + grace period (e.g., after 09:15 for morning)
- **Too Late (Absent):** Check-in after `graceMinutes + absentThresholdMinutes` (e.g., after 09:30)
- **Early Check-out:** Check-out before window start - grace period
- **Grace Period Usage:** Allowed without reason; still tracked as "late" for HR analytics

**Event Type Auto-Detection:**
If no explicit event type provided, system determines based on current time vs. all windows:
1. Find matching window (within start/end+grace)
2. If no match → find closest window (for late check-in)
3. Default to morning_check_in if ambiguous

### 5.4 Device Validation & Auto-Registration

**Device Fingerprint Requirements:**
- Required when `enableDeviceDetection` is true in config
- Captures: OS, browser, userAgent, screenResolution, timezone, deviceModel
- Used for security validation and audit trail

**Device Status States:**
| Status | Description | Action |
|--------|-------------|--------|
| `pending` | Awaiting HR approval | Block check-in (unless on office network) |
| `approved` | Cleared for use | Allow check-in |
| `revoked` | Access terminated | Block check-in |

**Auto-Registration Logic:**
```javascript
// When device not found during check-in:
if (!device && isIpInOfficeRange(clientIP, config.ipCidrs)) {
  // Auto-create and approve for office network
  device = await EmployeeDevice.create({
    employeeId: employee._id,
    deviceFingerprint,
    deviceName: `${os} ${browser}`,
    status: 'approved',
    approvedAt: now,
    registrationMethod: 'auto_office_network'
  });
  
  // Log audit trail
  AuditLogger.log('DEVICE_AUTO_REGISTRATION', device);
} else if (!device) {
  // Not on office network - require manual registration
  return { error: 'DEVICE_NOT_REGISTERED', requiresRegistration: true };
}
```

**Auto-Approval for Pending Devices:**
```javascript
if (device.status === 'pending' && isIpInOfficeRange(clientIP, config.ipCidrs)) {
  // Auto-approve if now on office network
  device.status = 'approved';
  device.registrationMethod = 'auto_approved_office_network';
  await device.save();
}
```

**Device Usage Tracking:**
- Update `lastLoginDate` and increment `loginCount` on each check-in
- Capture IP address for security audit

---

### 5.5 Validation Methods

#### WiFi (IP-Based) Validation
```javascript
// Office network detection
function isIpInOfficeRange(ip, cidrs) {
  for (const cidr of cidrs) {
    if (cidr.includes('/')) {
      // CIDR range check
      return ipaddr.parse(ip).match(ipaddr.parseCIDR(cidr));
    } else {
      // Individual IP exact match
      return ipaddr.parse(ip).toString() === ipaddr.parse(cidr).toString();
    }
  }
  return false;
}
```

**WiFi Method Rules:**
- WiFi check-in REQUIRES office network connection
- If not on office WiFi → Block with `NOT_ON_OFFICE_WIFI` error
- For Geo method with WiFi present: Set `flagged=true` for review

#### Geo (GPS) Validation
```javascript
function isWithinGeoRadius(userLat, userLon, officeLat, officeLon, radiusMeters) {
  const distance = haversine(
    { lat: userLat, lon: userLon },
    { lat: officeLat, lon: officeLon }
  );
  return distance <= radiusMeters;
}
```

**Geo Method Rules:**
- GPS accuracy threshold: Max 100m (reject if `geo.accuracy > 100`)
- Geo-fence bypass for `workType === 'remote'` employees
- If outside radius → Allow but `flagged=true` for HR review
- Send GPS accuracy warning notification if poor signal

#### QR Code Validation
```javascript
// QR Token = JWT with payload:
{
  employeeId: employee._id.toString(),
  type: 'qr_checkin',
  exp: Date // expiration
}

// Validation:
1. Verify JWT signature with JWT_SECRET
2. Verify tokenPayload.employeeId matches current user
3. Verify token type is 'qr_checkin'
4. Check token not expired
```

#### WebAuthn Validation
```javascript
// Requirements:
if (!webauthnAssertion || !employee.webauthnCredentials?.length) {
  return { error: 'WebAuthn authentication required' };
}

// Verify against registered credentials
// (Client-side validation with server challenge verification)
```

---

### 5.6 Duplicate Prevention & Request Deduplication

**Redis Cache for Deduplication:**
```javascript
// Check for recent request (30-second window)
if (requestId) {
  const cached = await AttendanceCache.getCachedRequestResult(requestId);
  if (cached) return cached; // Return cached result
}

// Cache result after successful check-in
await AttendanceCache.cacheRequestResult(requestId, result);

// Invalidate user cache for fresh data
await AttendanceCache.invalidateUserCache(userId);
```

**Duplicate Check Rules:**
1. **Same type within 30 seconds:** Block as duplicate
2. **Any type within 10 seconds:** Rate limit (429 Too Frequent)
3. **Check-out without check-in:** Block with "No check-in found for today"
4. **Same check-out type within 5 minutes:** Block as duplicate

---

### 5.7 Timer Integration Rules

**Automatic Timer Actions:**

| Check-in/out Type | Timer Action | Details |
|-------------------|--------------|---------|
| `lunch_check_out` | Pause running timers | Set status='paused', pauseReason='Lunch break' |
| `home_check_out` | Complete all timers | Set status='completed', calculate totalWorkTime |
| `morning_check_in` | Handled by frontend | Show timer start modal |
| `afternoon_check_in` | Handled by frontend | Show timer resume modal |

**Timer Calculation on Completion:**
```javascript
// Sum all interval durations
totalWorkTime = intervals.reduce((total, interval) => {
  if (interval.start && interval.end) {
    return total + (new Date(interval.end) - new Date(interval.start));
  }
  return total;
}, 0) / 1000 / 60; // Convert to minutes
```

---

### 5.8 Real-Time Notifications

**WebSocket Broadcasts (HR/Admin):**
```javascript
// On every check-in/out
websocketService.sendToRole('HR', 'attendance_update', {
  type: 'checkin' | 'checkout',
  employeeId,
  employeeName,
  timestamp,
  method,
  flagged,
  late
});
```

**Push Notifications to Employee:**
| Scenario | Notification Type | Content |
|----------|-------------------|---------|
| Successful check-in | 'checkin_success' | Method, timestamp |
| Late arrival | 'late_checkin' | Time, grace period used |
| Location flagged | 'location_mismatch' | Geo/IP mismatch warning |
| GPS accuracy poor | 'gps_accuracy_warning' | Move to open area |

**HR Alerts for Flagged Events:**
```javascript
if (flagged || late) {
  notificationService.createNotification({
    recipientId: 'hr_team',
    type: 'system_alert',
    title: `Flagged Attendance: ${employeeName}`,
    priority: late ? 'high' : 'medium',
    metadata: { employeeId, logId, method, flagged, late }
  });
}
```

---

### 5.9 Security & Anti-Tampering

**NTP Time Validation:**
```javascript
const timeValidation = await validateTimeAgainstNTP(30000); // 30s tolerance
if (!timeValidation.isValid) {
  flagged = true; // Flag for review
  // Log: localTime vs serverTime difference
}
```

**Request De-duplication:**
- Redis-based request ID caching (30-second window)
- Returns identical response for duplicate requests

**Audit Logging:**
```javascript
AuditLogger.logUserAction(
  { id: user.id, email: user.email, name: user.name },
  'ATTENDANCE_CHECKIN' | 'ATTENDANCE_CHECKOUT',
  'AttendanceLog',
  { id: log._id, context: { method, flagged, late } }
);
```

---

### 5.10 Overtime Calculation

```javascript
function calculateOvertime(employeeId, date, hoursWorked) {
  const shift = getEmployeeShift(employeeId, date);
  const regularHours = shift.duration_hours;
  
  let overtimeHours = 0;
  let overtimeType = null;
  let rateMultiplier = 1.0;
  
  if (hoursWorked > regularHours) {
    const extraHours = hoursWorked - regularHours;
    
    // Weekday overtime
    if (isWeekday(date)) {
      // First 2 hours: 1.5x
      // Beyond 2 hours: 2.0x
      if (extraHours <= 2) {
        overtimeHours = extraHours;
        rateMultiplier = 1.5;
        overtimeType = 'WEEKDAY_EARLY';
      } else {
        overtimeHours = extraHours;
        rateMultiplier = 2.0;
        overtimeType = 'WEEKDAY_LATE';
      }
    }
    
    // Weekend overtime
    if (isWeekend(date)) {
      overtimeHours = extraHours;
      rateMultiplier = 2.0;
      overtimeType = 'WEEKEND';
    }
    
    // Holiday overtime
    if (isHoliday(date)) {
      overtimeHours = extraHours;
      rateMultiplier = 2.5;
      overtimeType = 'HOLIDAY';
    }
  }
  
  // Monthly cap check
  const monthlyOT = getMonthlyOvertime(employeeId, date);
  const MAX_MONTHLY_OT = 40; // hours
  
  if (monthlyOT + overtimeHours > MAX_MONTHLY_OT) {
    return {
      error: 'MONTHLY_OVERTIME_CAP_EXCEEDED',
      max_allowed: MAX_MONTHLY_OT - monthlyOT,
      requested: overtimeHours,
      requires_approval: 'CEO'
    };
  }
  
  const hourlyRate = getHourlyRate(employeeId);
  
  return {
    overtime_hours: Math.round(overtimeHours * 100) / 100,
    rate_multiplier: rateMultiplier,
    overtime_type: overtimeType,
    payout_amount: Math.round(overtimeHours * hourlyRate * rateMultiplier * 100) / 100,
    hourly_rate: hourlyRate
  };
}
```

---

## 6. Sub-System 5: Performance & OKR Logic

### 6.1 Review Period Scheduling

```javascript
const reviewSchedule = {
  quarterly: {
    months: [3, 6, 9, 12], // End months
    window_open_days_before: 15,
    window_close_days_after: 30,
    self_assessment_duration_days: 14,
    manager_review_duration_days: 7,
    one_on_one_scheduling_days: 14
  },
  annual: {
    month: 12,
    includes: ['full_year_review', 'goal_setting_next_year', 'compensation_review']
  }
};

function calculateReviewWindow(period) {
  const endOfPeriod = new Date(period.year, period.end_month, 0);
  
  return {
    window_opens: subDays(endOfPeriod, reviewSchedule.quarterly.window_open_days_before),
    self_assessment_due: addDays(endOfPeriod, reviewSchedule.quarterly.self_assessment_duration_days),
    manager_review_due: addDays(endOfPeriod, 
      reviewSchedule.quarterly.self_assessment_duration_days + 
      reviewSchedule.quarterly.manager_review_duration_days
    ),
    window_closes: addDays(endOfPeriod, reviewSchedule.quarterly.window_close_days_after)
  };
}
```

### 6.2 Performance Rating Calculation

```javascript
function calculateFinalRating(employeeId, reviewId) {
  const review = db.performance_reviews.findOne({ _id: reviewId });
  
  // Self-assessment ratings
  const selfRatings = review.self_assessment.goal_ratings.map(g => g.self_rating);
  const selfAverage = average(selfRatings);
  
  // Manager ratings
  const managerRatings = review.manager_review.goal_ratings.map(g => g.manager_rating);
  const managerAverage = average(managerRatings);
  
  // Weighted final (manager has 60% weight)
  const finalRating = (selfAverage * 0.4) + (managerAverage * 0.6);
  
  // Determine category
  let category;
  if (finalRating >= 4.5) category = 'OUTSTANDING';
  else if (finalRating >= 4.0) category = 'EXCEEDS_EXPECTATIONS';
  else if (finalRating >= 3.0) category = 'MEETS_EXPECTATIONS';
  else if (finalRating >= 2.0) category = 'BELOW_EXPECTATIONS';
  else category = 'UNSATISFACTORY';
  
  // Compensation recommendations (if annual review)
  let raiseRecommendation = null;
  if (review.period.quarter === 4) {
    const raiseMatrix = {
      'OUTSTANDING': { min: 10, max: 15 },
      'EXCEEDS_EXPECTATIONS': { min: 7, max: 10 },
      'MEETS_EXPECTATIONS': { min: 3, max: 5 },
      'BELOW_EXPECTATIONS': { min: 0, max: 0 },
      'UNSATISFACTORY': { min: -5, max: 0 }
    };
    
    raiseRecommendation = raiseMatrix[category];
  }
  
  return {
    final_rating: Math.round(finalRating * 10) / 10,
    category,
    self_average: Math.round(selfAverage * 10) / 10,
    manager_average: Math.round(managerAverage * 10) / 10,
    raise_recommendation: raiseRecommendation,
    promotion_eligible: category === 'EXCEEDS_EXPECTATIONS' || category === 'OUTSTANDING'
  };
}
```

### 6.3 OKR Progress Calculation

```javascript
function calculateOKRProgress(okrId) {
  const okr = db.okrs.findOne({ _id: okrId });
  
  const krProgress = okr.key_results.map(kr => {
    let percentage = 0;
    
    switch (kr.type) {
      case 'NUMERIC':
        percentage = Math.min(100, (kr.current_value / kr.target_value) * 100);
        break;
      case 'PERCENTAGE':
        percentage = Math.min(100, (kr.current_value / kr.target_value) * 100);
        break;
      case 'BOOLEAN':
        percentage = kr.current_value ? 100 : 0;
        break;
      case 'MILESTONE':
        percentage = (kr.completed_milestones / kr.total_milestones) * 100;
        break;
    }
    
    return {
      kr_id: kr.kr_id,
      title: kr.title,
      progress: Math.round(percentage),
      status: getKRStatus(percentage, kr.target_value, kr.current_value)
    };
  });
  
  // Overall OKR progress (average of KRs)
  const overallProgress = average(krProgress.map(kr => kr.progress));
  
  // Determine overall status
  let overallStatus = 'ON_TRACK';
  const atRiskKRs = krProgress.filter(kr => kr.status === 'AT_RISK').length;
  const delayedKRs = krProgress.filter(kr => kr.status === 'DELAYED').length;
  const achievedKRs = krProgress.filter(kr => kr.status === 'ACHIEVED').length;
  
  if (delayedKRs > 0) overallStatus = 'DELAYED';
  else if (atRiskKRs > krProgress.length / 2) overallStatus = 'AT_RISK';
  else if (achievedKRs === krProgress.length) overallStatus = 'ACHIEVED';
  
  return {
    overall_progress: Math.round(overallProgress),
    overall_status: overallStatus,
    key_results: krProgress,
    quarter_end_projection: calculateProjection(okr, overallProgress)
  };
}

function getKRStatus(progress, target, current) {
  if (progress >= 100) return 'ACHIEVED';
  if (progress >= 70) return 'ON_TRACK';
  if (progress >= 40) return 'AT_RISK';
  return 'DELAYED';
}
```

---

## 7. Sub-System 6: Training Logic

### 7.1 Training Budget Allocation

```javascript
function calculateTrainingBudget(teamId, year) {
  const teamSize = db.employees.count({ team_id: teamId, status: 'ACTIVE' });
  const baseAllocation = teamSize * 10000; // ETB 10,000 per person
  
  // Adjustments
  const previousYearUtilization = getPreviousYearUtilization(teamId, year - 1);
  
  // If utilization < 50%, reduce by 20%
  // If utilization > 90%, increase by 10%
  let multiplier = 1.0;
  if (previousYearUtilization < 0.5) multiplier = 0.8;
  else if (previousYearUtilization > 0.9) multiplier = 1.1;
  
  return {
    total_budget: Math.round(baseAllocation * multiplier),
    per_person: Math.round(baseAllocation * multiplier / teamSize),
    used_ytd: getUsedBudgetYTD(teamId, year),
    remaining: Math.round(baseAllocation * multiplier - getUsedBudgetYTD(teamId, year))
  };
}
```

### 7.2 Skill Gap Analysis

```javascript
function analyzeSkillGap(employeeId, targetRoleId) {
  const employee = db.employees.findOne({ _id: employeeId });
  const currentSkills = getEmployeeSkills(employeeId);
  const targetSkills = getRoleRequirements(targetRoleId);
  
  const gaps = [];
  const strengths = [];
  
  for (const requiredSkill of targetSkills) {
    const currentLevel = currentSkills.find(
      s => s.skill_id === requiredSkill.skill_id
    )?.level || 0;
    
    const gap = requiredSkill.required_level - currentLevel;
    
    if (gap > 0) {
      gaps.push({
        skill: requiredSkill.skill_name,
        current_level: currentLevel,
        required_level: requiredSkill.required_level,
        gap: gap,
        priority: gap >= 2 ? 'HIGH' : 'MEDIUM',
        recommended_trainings: findTrainingsForSkill(requiredSkill.skill_id)
      });
    } else if (currentLevel > requiredSkill.required_level) {
      strengths.push({
        skill: requiredSkill.skill_name,
        level: currentLevel,
        transferable: true
      });
    }
  }
  
  // Calculate readiness score
  const totalGap = gaps.reduce((sum, g) => sum + g.gap, 0);
  const readinessScore = Math.max(0, 100 - (totalGap * 10));
  
  return {
    gaps,
    strengths,
    total_gaps: gaps.length,
    critical_gaps: gaps.filter(g => g.priority === 'HIGH').length,
    readiness_score: Math.round(readinessScore),
    readiness_level: getReadinessLevel(readinessScore),
    estimated_closure_months: Math.ceil(totalGap / 2), // Assuming 2 levels/quarter
    recommended_development_plan: generateDevelopmentPlan(gaps)
  };
}
```

---

## 8. Sub-System 7: Employee Relations Logic

### 8.1 Disciplinary Action Escalation

```javascript
const disciplinaryMatrix = {
  ATTENDANCE_VIOLATION: {
    first: { action: 'VERBAL_WARNING', expires_months: 6 },
    second: { action: 'WRITTEN_WARNING', expires_months: 12 },
    third: { action: 'FINAL_WARNING', expires_months: 12 },
    fourth: { action: 'TERMINATION' }
  },
  PERFORMANCE_ISSUE: {
    first: { action: 'PERFORMANCE_IMPROVEMENT_PLAN', duration_months: 3 },
    second: { action: 'WRITTEN_WARNING' },
    third: { action: 'TERMINATION' }
  },
  CODE_OF_CONDUCT: {
    minor: { action: 'WRITTEN_WARNING' },
    major: { action: 'SUSPENSION', duration_days: 3 },
    severe: { action: 'TERMINATION', immediate: true }
  }
};

function determineDisciplinaryAction(employeeId, incidentType) {
  // Check history
  const history = db.disciplinary_actions.find({
    employee_id: employeeId,
    incident_type: incidentType,
    created_at: { $gte: subMonths(new Date(), 24) } // Last 24 months
  }).sort({ created_at: -1 });
  
  const rule = disciplinaryMatrix[incidentType];
  
  if (!rule) {
    return { action: 'CASE_BY_CASE', requires_hr_review: true };
  }
  
  // Count active (non-expired) previous actions
  const activeCount = history.filter(h => 
    !h.expires_at || h.expires_at > new Date()
  ).length;
  
  // Determine action based on count
  const actionKeys = Object.keys(rule);
  const actionKey = actionKeys[Math.min(activeCount, actionKeys.length - 1)];
  const action = rule[actionKey];
  
  return {
    ...action,
    escalation_level: activeCount + 1,
    previous_incidents: activeCount,
    requires_approval: action.action === 'TERMINATION' ? ['HR', 'CEO'] : ['HR']
  };
}
```

### 8.2 Incident Investigation Workflow

```javascript
function processIncidentReport(incidentId) {
  const incident = db.incident_reports.findOne({ _id: incidentId });
  
  // Auto-assign based on severity
  if (incident.severity === 'CRITICAL') {
    incident.investigator_id = getSeniorInvestigator();
    incident.sla_hours = 24;
  } else if (incident.severity === 'HIGH') {
    incident.investigator_id = getHRBusinessPartner(incident.department);
    incident.sla_hours = 72;
  } else {
    incident.investigator_id = getHRGeneralist();
    incident.sla_hours = 168; // 7 days
  }
  
  // Auto-notify
  notify(incident.investigator_id, `New incident assigned: ${incident.report_id}`);
  notify('HR_MANAGER', `New ${incident.severity} severity incident reported`);
  
  if (incident.severity === 'CRITICAL') {
    notify('CEO', `CRITICAL incident reported: ${incident.incident_type}`);
  }
  
  // Set follow-up dates
  incident.investigation_due = addHours(new Date(), incident.sla_hours);
  incident.review_meeting_scheduled = addDays(new Date(), 3);
  
  return incident;
}
```

---

## 9. Sub-System 8: Offboarding Logic

### 9.1 Notice Period Validation

```javascript
function validateResignationNotice(employeeId, proposedLastDay) {
  const employee = db.employees.findOne({ _id: employeeId });
  const today = new Date();
  
  // Calculate required notice period
  const requiredNoticeDays = getRequiredNoticeDays(employee.employment_type);
  const actualNoticeDays = differenceInBusinessDays(proposedLastDay, today);
  
  const result = {
    valid: true,
    warnings: [],
    errors: []
  };
  
  // Check minimum notice
  if (actualNoticeDays < requiredNoticeDays) {
    result.errors.push({
      code: 'INSUFFICIENT_NOTICE',
      message: `Minimum ${requiredNoticeDays} business days required. You provided ${actualNoticeDays}.`,
      requires_waiver: true,
      waiver_approvers: ['MANAGER', 'HR']
    });
    result.valid = false;
  }
  
  // Check for critical projects
  const criticalProjects = getCriticalProjects(employeeId);
  if (criticalProjects.length > 0) {
    result.warnings.push({
      code: 'CRITICAL_PROJECTS',
      message: `You are assigned to ${criticalProjects.length} critical projects.`,
      projects: criticalProjects.map(p => p.name),
      suggested_handover_days: Math.min(actualNoticeDays, 14)
    });
  }
  
  // Check leave balance
  const leaveBalance = calculateLeaveBalance(employeeId, 'ANNUAL', today);
  if (leaveBalance.available > 0) {
    result.warnings.push({
      code: 'LEAVE_BALANCE',
      message: `You have ${leaveBalance.available} days of annual leave.`,
      options: ['ENCASH', 'TAKE_BEFORE_LEAVING', 'FORFEIT']
    });
  }
  
  // Check probation status
  if (employee.status === 'ON_PROBATION') {
    result.warnings.push({
      code: 'PROBATION_NOTICE',
      message: 'You are on probation. Reduced notice period may apply.',
      reduced_notice_days: 7
    });
  }
  
  return result;
}
```

### 9.2 Final Settlement Calculation

```javascript
function calculateFinalSettlement(employeeId, lastWorkingDay) {
  const employee = db.employees.findOne({ _id: employeeId });
  const salary = employee.compensation.base_salary;
  const dailyRate = salary / 30; // Assuming 30-day month
  
  const settlement = {
    earnings: {},
    deductions: {},
    net_payable: 0
  };
  
  // 1. Salary for days worked in final month
  const daysWorkedInFinalMonth = lastWorkingDay.getDate();
  settlement.earnings.salary_days_worked = Math.round(dailyRate * daysWorkedInFinalMonth);
  
  // 2. Leave encashment
  const leaveBalance = calculateLeaveBalance(employeeId, 'ANNUAL', lastWorkingDay);
  if (leaveBalance.available > 0) {
    settlement.earnings.leave_encashment = Math.round(dailyRate * leaveBalance.available);
  }
  
  // 3. Prorated bonus (if applicable)
  const bonus = calculateProratedBonus(employeeId, lastWorkingDay);
  if (bonus > 0) {
    settlement.earnings.prorated_bonus = bonus;
  }
  
  // 4. Overtime due
  const pendingOvertime = getPendingOvertime(employeeId, lastWorkingDay);
  if (pendingOvertime.amount > 0) {
    settlement.earnings.overtime = pendingOvertime.amount;
  }
  
  // 5. Deductions
  // Tax (PAYE calculation)
  const grossEarnings = Object.values(settlement.earnings).reduce((a, b) => a + b, 0);
  settlement.deductions.tax = calculatePAYE(grossEarnings);
  
  // Pension
  settlement.deductions.pension = Math.round(grossEarnings * 0.07); // 7% employee contribution
  
  // Outstanding loans/advances
  const outstanding = getOutstandingLoans(employeeId);
  if (outstanding > 0) {
    settlement.deductions.loan_recovery = Math.min(outstanding, grossEarnings * 0.5); // Max 50% recovery
  }
  
  // Calculate net
  const totalDeductions = Object.values(settlement.deductions).reduce((a, b) => a + b, 0);
  settlement.net_payable = grossEarnings - totalDeductions;
  
  // Generate breakdown document
  settlement.breakdown_document = generateSettlementDocument(settlement);
  
  return settlement;
}
```

### 9.3 Offboarding Task Matrix

```javascript
const offboardingTasks = {
  HR: [
    { task: 'Conduct exit interview', deadline_days: -3, mandatory: true },
    { task: 'Process final settlement', deadline_days: 0, mandatory: true },
    { task: 'Prepare experience certificate', deadline_days: 0, mandatory: true },
    { task: 'Update employee status to RESIGNED', deadline_days: 0, mandatory: true },
    { task: 'Archive employee file', deadline_days: 7, mandatory: true }
  ],
  IT: [
    { task: 'Revoke email access', deadline_days: 0, mandatory: true, time: '18:00' },
    { task: 'Revoke system access', deadline_days: 0, mandatory: true, time: '18:00' },
    { task: 'Backup user data', deadline_days: -1, mandatory: true },
    { task: 'Wipe company devices', deadline_days: 0, mandatory: false },
    { task: 'Transfer code ownership', deadline_days: -3, mandatory: true }
  ],
  ADMIN: [
    { task: 'Collect access badges', deadline_days: 0, mandatory: true },
    { task: 'Process asset returns', deadline_days: 0, mandatory: true },
    { task: 'Clear locker/desk', deadline_days: 0, mandatory: false },
    { task: 'Update phone directory', deadline_days: 1, mandatory: true }
  ],
  FINANCE: [
    { task: 'Calculate final settlement', deadline_days: -1, mandatory: true },
    { task: 'Process final payment', deadline_days: 0, mandatory: true },
    { task: 'Close expense account', deadline_days: 1, mandatory: true },
    { task: 'Reconcile advances', deadline_days: -1, mandatory: true }
  ],
  MANAGER: [
    { task: 'Approve knowledge transfer', deadline_days: -3, mandatory: true },
    { task: 'Reassign projects/tasks', deadline_days: -5, mandatory: true },
    { task: 'Complete handover checklist', deadline_days: 0, mandatory: true },
    { task: 'Provide final feedback to HR', deadline_days: -1, mandatory: false }
  ]
};

function generateOffboardingChecklist(employeeId, lastWorkingDay) {
  const checklist = [];
  
  for (const [department, tasks] of Object.entries(offboardingTasks)) {
    for (const task of tasks) {
      checklist.push({
        department,
        task: task.task,
        due_date: addBusinessDays(lastWorkingDay, task.deadline_days),
        mandatory: task.mandatory,
        status: 'PENDING',
        assigned_to: null, // To be assigned by department head
        completed_at: null
      });
    }
  }
  
  return checklist;
}
```

---

## 10. Notification Engine

### 10.1 Notification Triggers

```javascript
const notificationTriggers = {
  // Leave Management
  'LEAVE_SUBMITTED': {
    recipients: ['SUPERVISOR'],
    channels: ['APP', 'EMAIL'],
    template: 'leave_request_pending'
  },
  'LEAVE_APPROVED': {
    recipients: ['EMPLOYEE'],
    channels: ['APP', 'EMAIL'],
    template: 'leave_approved'
  },
  'LEAVE_REJECTED': {
    recipients: ['EMPLOYEE'],
    channels: ['APP', 'EMAIL'],
    template: 'leave_rejected'
  },
  
  // Approvals
  'APPROVAL_REQUIRED': {
    recipients: ['APPROVER'],
    channels: ['APP', 'EMAIL', 'PUSH'],
    template: 'action_required',
    urgency: 'HIGH'
  },
  
  // Performance
  'REVIEW_PERIOD_OPENED': {
    recipients: ['EMPLOYEE', 'MANAGER'],
    channels: ['APP', 'EMAIL'],
    template: 'review_period_opened'
  },
  'REVIEW_OVERDUE': {
    recipients: ['EMPLOYEE', 'MANAGER', 'HR'],
    channels: ['APP', 'EMAIL'],
    template: 'review_overdue',
    urgency: 'HIGH'
  },
  
  // Onboarding
  'ONBOARDING_TASK_OVERDUE': {
    recipients: ['ASSIGNEE', 'HR'],
    channels: ['APP', 'EMAIL'],
    template: 'task_overdue',
    escalation: true,
    escalation_after_hours: 24
  },
  
  // Offboarding
  'RESIGNATION_SUBMITTED': {
    recipients: ['MANAGER', 'HR'],
    channels: ['APP', 'EMAIL'],
    template: 'resignation_notice'
  },
  
  // Documents
  'DOCUMENT_EXPIRING': {
    recipients: ['EMPLOYEE', 'HR'],
    channels: ['APP', 'EMAIL'],
    template: 'document_expiry_warning'
  }
};

function sendNotification(trigger, context) {
  const config = notificationTriggers[trigger];
  if (!config) return;
  
  for (const recipient of config.recipients) {
    const userIds = resolveRecipient(recipient, context);
    
    for (const userId of userIds) {
      for (const channel of config.channels) {
        dispatchNotification(channel, {
          user_id: userId,
          template: config.template,
          context,
          urgency: config.urgency || 'NORMAL'
        });
      }
    }
  }
  
  // Schedule escalation if configured
  if (config.escalation) {
    scheduleEscalation(trigger, context, config.escalation_after_hours);
  }
}
```

### 10.2 Notification Batching

```javascript
function batchNotifications(notifications, batchWindowMinutes = 30) {
  const batches = {};
  
  for (const notification of notifications) {
    const key = `${notification.user_id}_${notification.type}`;
    
    if (!batches[key]) {
      batches[key] = {
        user_id: notification.user_id,
        type: notification.type,
        count: 0,
        items: [],
        first_received: notification.created_at
      };
    }
    
    batches[key].count++;
    batches[key].items.push(notification);
  }
  
  // Process batches
  for (const batch of Object.values(batches)) {
    if (batch.count === 1) {
      sendImmediateNotification(batch.items[0]);
    } else {
      sendDigestNotification(batch);
    }
  }
}
```

---

## 11. Approval Workflow Engine

### 11.1 Dynamic Approval Chain

```javascript
function determineApprovalChain(requestType, context) {
  const baseChain = [];
  
  // Level 1: Direct Manager (always required for employee-initiated)
  if (context.initiated_by === 'EMPLOYEE') {
    baseChain.push({
      level: 1,
      role: 'SUPERVISOR',
      approver_id: context.employee.supervisor_id,
      required: true
    });
  }
  
  // Level 2: Department Head (for certain types)
  if (requiresDepartmentHeadApproval(requestType, context)) {
    baseChain.push({
      level: 2,
      role: 'DEPARTMENT_HEAD',
      approver_id: context.employee.department_head_id,
      required: true
    });
  }
  
  // Level 3: HR (for most HR-related requests)
  if (requiresHRApproval(requestType)) {
    baseChain.push({
      level: baseChain.length + 1,
      role: 'HR',
      approver_id: getHRBusinessPartner(context.employee.department),
      required: true
    });
  }
  
  // Level 4: Finance (for monetary requests)
  if (hasFinancialImpact(requestType, context)) {
    baseChain.push({
      level: baseChain.length + 1,
      role: 'FINANCE',
      approver_id: getFinanceApprover(context.amount),
      required: true,
      condition: context.amount > 50000 // Threshold
    });
  }
  
  // Level 5: CEO (for high-value or sensitive)
  if (requiresCEOApproval(requestType, context)) {
    baseChain.push({
      level: baseChain.length + 1,
      role: 'CEO',
      approver_id: getCEO(),
      required: true
    });
  }
  
  return baseChain;
}
```

### 11.2 Approval Routing Logic

```javascript
function routeApprovalRequest(requestId) {
  const request = db.approval_requests.findOne({ _id: requestId });
  const chain = request.approval_chain;
  
  // Find current pending level
  const currentLevel = chain.find(l => l.status === 'PENDING');
  
  if (!currentLevel) {
    // All approved
    finalizeApproval(request);
    return { status: 'COMPLETED' };
  }
  
  // Check for escalation
  const hoursPending = differenceInHours(new Date(), currentLevel.assigned_at);
  const escalationThreshold = getEscalationThreshold(currentLevel.role);
  
  if (hoursPending > escalationThreshold) {
    // Escalate to next level
    escalateApproval(request, currentLevel);
    return { status: 'ESCALATED', to_level: currentLevel.level + 1 };
  }
  
  // Send reminder
  if (hoursPending > escalationThreshold / 2) {
    sendReminder(currentLevel.approver_id, request);
  }
  
  return { status: 'PENDING', current_level: currentLevel.level };
}

function escalateApproval(request, currentLevel) {
  const nextLevel = request.approval_chain.find(l => l.level === currentLevel.level + 1);
  
  if (nextLevel) {
    notify(nextLevel.approver_id, 
      `Approval escalated: ${request.type} - ${request.employee_name}`);
    nextLevel.status = 'PENDING';
    nextLevel.assigned_at = new Date();
    nextLevel.escalated_from = currentLevel.approver_id;
  } else {
    // No higher level, notify HR admin
    notify('HR_ADMIN', `Approval stuck at ${currentLevel.role} for ${request.type}`);
  }
  
  currentLevel.status = 'ESCALATED';
  currentLevel.escalated_at = new Date();
}
```

### 11.3 Parallel vs Sequential Approval

```javascript
const approvalModes = {
  SEQUENTIAL: 'SEQUENTIAL', // One after another
  PARALLEL: 'PARALLEL',     // All at same level simultaneously
  CONDITIONAL: 'CONDITIONAL' // Based on rules
};

function determineApprovalMode(requestType, context) {
  switch (requestType) {
    case 'LEAVE_REQUEST':
      return approvalModes.SEQUENTIAL;
      
    case 'SALARY_ADJUSTMENT':
      return approvalModes.SEQUENTIAL; // Must be sequential for audit
      
    case 'TRAINING_REQUEST':
      // Supervisor and HR can review in parallel if < ETB 10,000
      if (context.cost < 10000) {
        return approvalModes.PARALLEL;
      }
      return approvalModes.SEQUENTIAL;
      
    case 'PROMOTION':
      return approvalModes.SEQUENTIAL; // Always sequential
      
    case 'RECRUITMENT_REQUEST':
      return approvalModes.CONDITIONAL;
      
    default:
      return approvalModes.SEQUENTIAL;
  }
}

function processParallelApprovals(request) {
  const pendingApprovers = request.approval_chain.filter(l => l.status === 'PENDING');
  
  // Send to all pending approvers at current level simultaneously
  for (const approver of pendingApprovers) {
    sendApprovalRequest(approver.approver_id, request);
  }
  
  // Wait for majority or unanimous decision based on config
  const decisions = pendingApprovers.map(l => l.decision);
  const approvals = decisions.filter(d => d === 'APPROVED').length;
  const rejections = decisions.filter(d => d === 'REJECTED').length;
  
  if (rejections > 0) {
    // Any rejection in parallel mode = overall rejection
    return finalizeRejection(request, 'One or more approvers rejected');
  }
  
  if (approvals === pendingApprovers.length) {
    // All approved
    return advanceToNextLevel(request);
  }
  
  // Still waiting
  return { status: 'PENDING', approvals, total: pendingApprovers.length };
}
```

---

*Document Version: 1.0*  
*Last Updated: February 2026*  
*For: BLIH Backend Development Team*
