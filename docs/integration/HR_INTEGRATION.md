# BLIH HR Module - Integration Documentation

**Purpose:** External system integration guide for HR module  
**Audience:** Integration Engineers, System Administrators, Solution Architects  
**Version:** 1.0 | February 2026

---

## Table of Contents
1. [Integration Overview](#1-integration-overview)
2. [Authentication & Security](#2-authentication--security)
3. [Payroll System Integration](#3-payroll-system-integration)
4. [Biometric Device Integration](#4-biometric-device-integration)
5. [Calendar Integration](#5-calendar-integration)
6. [Email & SMS Integration](#6-email--sms-integration)
7. [Time Tracking Devices](#7-time-tracking-devices)
8. [HRIS Synchronization](#8-hris-synchronization)
9. [Third-Party Services](#9-third-party-services)
10. [Data Migration](#10-data-migration)
11. [Monitoring & Troubleshooting](#11-monitoring--troubleshooting)

---

## 1. Integration Overview

### 1.1 Integration Patterns

BLIH HR supports multiple integration patterns:

| Pattern | Use Case | Example |
|---------|-----------|---------|
| **API Integration** | Real-time data exchange | Payroll system sync |
| **Webhook Integration** | Event-driven updates | Slack notifications |
| **File Import/Export** | Bulk data migration | Legacy HRIS import |
| **Database Replication** | High-frequency sync | Biometric device logs |
| **SSO Federation** | Unified authentication | Azure AD integration |

### 1.2 Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BLIH HR Module                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   REST API  │  │   Webhooks  │  │   File I/O  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│         │                 │                 │        │
│  ┌──────▼──────┐   ┌─────▼──────┐   ┌────▼──────┐ │
│  │ Payroll     │   │ Biometric   │   │ Calendar   │ │
│  │ System      │   │ Devices     │   │ Systems    │ │
│  └─────────────┘   └─────────────┘   └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Supported Protocols

| Protocol | Use | Security |
|----------|------|----------|
| HTTPS/REST | Primary API | TLS 1.3, OAuth 2.0 |
| GraphQL | Complex queries | Same as REST |
| Webhook | Event notifications | HMAC signatures |
| SFTP | File transfers | PGP encryption |
| LDAP/AD | User sync | TLS, bind credentials |
| SMTP | Email notifications | TLS, SPF/DKIM |

---

## 2. Authentication & Security

### 2.1 API Authentication

All integrations use OAuth 2.0 with JWT tokens:

```javascript
// 1. Register integration in BLIH Admin
const integration = await registerIntegration({
  name: "Payroll System",
  scopes: ["hr:employee:read", "hr:attendance:read"],
  redirectUri: "https://payroll.company.com/callback"
});

// 2. Get authorization code
const authUrl = `https://blih.company.com/oauth/authorize?` +
  `client_id=${integration.clientId}&` +
  `redirect_uri=${integration.redirectUri}&` +
  `scope=${integration.scopes.join(' ')}&` +
  `response_type=code`;

// 3. Exchange code for tokens
const tokens = await exchangeCodeForTokens({
  code: authCode,
  client_id: integration.clientId,
  client_secret: integration.clientSecret
});
```

### 2.2 Webhook Security

All webhook payloads are signed with HMAC-SHA256:

```javascript
// Verify webhook signature
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(JSON.stringify(payload))
  .digest('hex');

if (signature !== request.headers['x-blih-signature']) {
  return res.status(401).send('Invalid signature');
}
```

### 2.3 IP Whitelisting

Configure allowed IPs for integrations:

```json
{
  "integrationSettings": {
    "allowedIps": ["203.0.113.0/24", "192.168.1.100"],
    "requireTls": true,
    "maxRequestsPerMinute": 1000
  }
}
```

---

## 3. Payroll System Integration

### 3.1 Supported Payroll Systems

| System | Integration Type | Data Flow |
|--------|----------------|-----------|
| **SAP SuccessFactors** | API | Bidirectional |
| **Workday** | API | Bidirectional |
| **ADP** | File Import/Export | Payroll → BLIH |
| **Local Ethiopian Systems** | Custom API | Bidirectional |
| **Custom Payroll** | Database | Real-time sync |

### 3.2 Data Synchronization

#### Employee Data Sync
```json
// Payroll → BLIH (Employee master)
{
  "eventType": "employee.sync",
  "employees": [
    {
      "employeeId": "EMP1001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "department": "Engineering",
      "position": "Senior Developer",
      "compensation": {
        "baseSalary": 60000,
        "currency": "ETB",
        "payFrequency": "MONTHLY"
      },
      "bankAccount": {
        "bankName": "Commercial Bank of Ethiopia",
        "accountNumber": "1234567890"
      }
    }
  ]
}
```

#### Attendance Data Export
```json
// BLIH → Payroll (Timesheet data)
{
  "period": "2026-02-01 to 2026-02-29",
  "timesheets": [
    {
      "employeeId": "EMP1001",
      "days": [
        {
          "date": "2026-02-15",
          "checkIn": "08:45",
          "checkOut": "17:30",
          "breakMinutes": 60,
          "workedHours": 7.75,
          "overtimeHours": 0.5,
          "status": "PRESENT"
        }
      ],
      "totalHours": 176.5,
      "overtimeHours": 2.5
    }
  ]
}
```

### 3.3 Integration Configuration

```yaml
# payroll-integration.yml
payrollSystem: "workday"
apiEndpoint: "https://your-company.workday.com"
credentials:
  clientId: "${WORKDAY_CLIENT_ID}"
  clientSecret: "${WORKDAY_CLIENT_SECRET}"
syncSchedule:
  employeeData: "0 2 * * *"  # Daily at 2 AM
  attendanceData: "0 18 * * *" # Daily at 6 PM
  leaveData: "0 6 * * 1"     # Monthly on 1st
mappings:
  departmentField: "organization"
  positionField: "jobTitle"
  salaryField: "compensation.basePay"
```

### 3.4 Error Handling & Retry Logic

```javascript
const syncWithRetry = async (data, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await payrollApi.syncEmployees(data);
      return { success: true, data: result };
    } catch (error) {
      if (attempt === maxRetries) {
        await notifyAdmin('Payroll sync failed after 3 attempts', error);
        throw error;
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await sleep(delay);
    }
  }
};
```

---

## 4. Biometric Device Integration

### 4.1 Supported Devices

| Device Type | Protocol | Data Sent |
|-------------|----------|------------|
| **Fingerprint Readers** | TCP/IP, REST | User ID, timestamp, match score |
| **Facial Recognition** | WebSocket, MQTT | User ID, confidence level, image hash |
| **RFID Cards** | Wiegand, TCP/IP | Card ID, timestamp |
| **Palm Vein** | Proprietary API | User ID, vein pattern hash |

### 4.2 Device Registration

```javascript
// Register biometric device
const device = await registerBiometricDevice({
  name: "Main Entrance Fingerprint Reader",
  type: "FINGERPRINT",
  location: "Main Office Entrance",
  ipAddress: "192.168.1.50",
  port: 8080,
  apiKey: deviceApiKey,
  syncInterval: 30 // seconds
});
```

### 4.3 Real-Time Data Flow

```javascript
// Biometric device → BLIH
const biometricStream = new WebSocket('ws://192.168.1.50:8080/stream');

biometricStream.on('message', async (data) => {
  const event = JSON.parse(data);
  
  // Validate device signature
  if (!validateDeviceSignature(event, deviceApiKey)) {
    console.warn('Invalid biometric event signature');
    return;
  }
  
  // Process attendance event
  if (event.type === 'ATTENDANCE') {
    await processBiometricAttendance({
      employeeId: event.employeeId,
      timestamp: event.timestamp,
      deviceType: event.deviceType,
      confidence: event.confidence,
      location: device.location
    });
  }
});
```

### 4.4 Attendance Processing Logic

```javascript
async function processBiometricAttendance(data) {
  // 1. Verify employee exists and is active
  const employee = await getEmployee(data.employeeId);
  if (!employee || employee.status !== 'ACTIVE') {
    await logSecurityEvent('UNKNOWN_BIOMETRIC_ACCESS', data);
    return;
  }
  
  // 2. Check if within attendance window
  const now = new Date();
  const window = getAttendanceWindow(now);
  
  if (!isWithinTimeWindow(now, window)) {
    // Log but allow (will be flagged)
    await createAttendanceLog({
      ...data,
      flagged: true,
      flagReason: 'OUTSIDE_WINDOW'
    });
  } else {
    // Normal attendance processing
    await createAttendanceLog(data);
  }
  
  // 3. Send real-time notification
  await notifyManager(employee.managerId, {
    type: 'BIOMETRIC_ATTENDANCE',
    employee: employee.name,
    timestamp: data.timestamp,
    device: data.deviceType
  });
}
```

---

## 5. Calendar Integration

### 5.1 Supported Calendar Systems

| System | Integration Type | Features |
|--------|----------------|----------|
| **Google Calendar** | API | Leave sync, meeting scheduling |
| **Microsoft Outlook** | Graph API | Leave sync, room booking |
| **Exchange Server** | EWS | Leave sync, resource booking |
| **CalDAV** | Standard protocol | Basic calendar sync |

### 5.2 Leave Calendar Sync

```javascript
// Sync approved leave to employee calendar
const syncLeaveToCalendar = async (leaveRequest) => {
  const employee = await getEmployee(leaveRequest.employeeId);
  const calendarEvent = {
    summary: `Leave - ${leaveRequest.leaveType}`,
    description: `Approved leave: ${leaveRequest.reason}`,
    start: {
      dateTime: leaveRequest.startDate,
      timeZone: employee.timezone
    },
    end: {
      dateTime: leaveRequest.endDate,
      timeZone: employee.timezone
    },
    transparency: 'opaque', // Show as busy
    visibility: 'private',
    attendees: [
      { email: employee.email },
      { email: employee.manager.email }
    ]
  };
  
  // Create in calendar system
  if (employee.calendarProvider === 'GOOGLE') {
    await googleCalendar.createEvent(employee.calendarId, calendarEvent);
  } else if (employee.calendarProvider === 'OUTLOOK') {
    await outlookGraph.createEvent(employee.calendarId, calendarEvent);
  }
  
  // Set up meeting cancellation if leave is cancelled
  await storeCalendarMapping(leaveRequest.id, calendarEvent.id);
};
```

### 5.3 Meeting Room Integration

```javascript
// Check room availability for interviews
const checkRoomAvailability = async (dateTime, duration) => {
  const rooms = await getMeetingRooms();
  const availableRooms = [];
  
  for (const room of rooms) {
    const calendarId = room.calendarId;
    const events = await getCalendarEvents(calendarId, dateTime, duration);
    
    if (events.length === 0) {
      availableRooms.push({
        roomId: room.id,
        name: room.name,
        capacity: room.capacity,
        equipment: room.equipment
      });
    }
  }
  
  return availableRooms;
};
```

---

## 6. Email & SMS Integration

### 6.1 Email Providers

| Provider | Protocol | Features |
|-----------|----------|----------|
| **SendGrid** | REST API | Templates, analytics, delivery tracking |
| **AWS SES** | REST/SMTP | Bulk sending, bounce handling |
| **Local SMTP** | SMTP | On-premise, custom domains |
| **Mailgun** | REST API | Validation, routing rules |

### 6.2 Email Configuration

```yaml
# email-config.yml
emailProvider: "sendgrid"
apiKey: "${SENDGRID_API_KEY}"
fromAddress: "hr@company.com"
fromName: "BLIH HR System"
templates:
  leaveApproved: "d-1234567890abcdef"
  leaveRejected: "d-0987654321fedcba"
  interviewScheduled: "d-1111111111111111"
  onboardingWelcome: "d-2222222222222222"
settings:
  trackOpens: true
  trackClicks: true
  unsubscribeGroup: "hr-notifications"
```

### 6.3 SMS Providers

| Provider | Coverage | Features |
|-----------|----------|----------|
| **Twilio** | Global | Two-factor, short codes |
| **Ethio Telecom** | Ethiopia | Local rates, Amharic support |
| **AWS SNS** | Global | Multi-channel (SMS, Push, Email) |

### 6.4 Notification Templates

```javascript
// Dynamic email template rendering
const sendLeaveNotification = async (type, recipient, data) => {
  const template = await getEmailTemplate(`leave${type}`);
  
  const rendered = templateEngine.render(template, {
    employeeName: data.employeeName,
    leaveType: data.leaveType,
    startDate: formatDate(data.startDate),
    endDate: formatDate(data.endDate),
    daysRequested: data.daysRequested,
    approverName: data.approverName,
    reason: data.reason,
    actionUrl: `${BASE_URL}/leave/${data.requestId}`
  });
  
  await emailProvider.send({
    to: recipient.email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    templateId: template.id,
    trackingParams: {
      employeeId: data.employeeId,
      requestId: data.requestId,
      notificationType: type
    }
  });
};
```

---

## 7. Time Tracking Devices

### 7.1 Device Types

| Device | Integration | Use Case |
|---------|-------------|-----------|
| **Time Clocks** | TCP/IP, Serial | Factory floor, construction sites |
| **Mobile Apps** | REST API | Field workers, remote teams |
| **Desktop Apps** | WebSocket | Office workers |
| **Kiosk Systems** | HTTP API | Reception areas, multiple locations |

### 7.2 Time Clock Protocol

```javascript
// Time clock → BLIH (Punch data)
const timeClockProtocol = {
  // Punch in/out
  PUNCH: {
    endpoint: '/api/v1/timeclock/punch',
    method: 'POST',
    payload: {
      deviceId: 'string',
      employeeId: 'string',
      timestamp: 'ISO8601',
      type: 'IN|OUT',
      method: 'CARD|BIOMETRIC|PIN'
    }
  },
  
  // Heartbeat
  HEARTBEAT: {
    endpoint: '/api/v1/timeclock/heartbeat',
    method: 'POST',
    interval: 60, // seconds
    payload: {
      deviceId: 'string',
      status: 'ONLINE|OFFLINE',
      lastPunch: 'ISO8601'
    }
  },
  
  // Configuration sync
  CONFIG: {
    endpoint: '/api/v1/timeclock/config',
    method: 'GET',
    response: {
      timezone: 'Africa/Addis_Ababa',
      gracePeriod: 15,
      schedules: [...]
    }
  }
};
```

### 7.3 Offline Support

```javascript
// Handle time clock offline scenarios
const handleOfflinePunches = async (deviceId) => {
  // Get stored punches from device
  const offlinePunches = await getDevicePunches(deviceId, {
    synced: false,
    limit: 1000
  });
  
  for (const punch of offlinePunches) {
    try {
      // Validate punch integrity
      if (validatePunchData(punch)) {
        await syncPunchToServer(punch);
        punch.synced = true;
        await updatePunchStatus(punch.id, 'synced');
      }
    } catch (error) {
      console.error(`Failed to sync punch ${punch.id}:`, error);
      // Keep as unsynced for retry
    }
  }
  
  // Confirm sync completion
  await confirmDeviceSync(deviceId, offlinePunches.length);
};
```

---

## 8. HRIS Synchronization

### 8.1 Legacy HRIS Connectors

| System | Method | Frequency | Data Direction |
|---------|---------|------------|----------------|
| **Custom HRIS** | Database view | Real-time | Bidirectional |
| **Excel/CSV** | File import | Manual | HRIS → BLIH |
| **SQL Database** | Direct query | Scheduled | HRIS → BLIH |
| **SOAP Web Service** | API calls | Scheduled | Bidirectional |

### 8.2 Data Mapping Configuration

```json
{
  "fieldMappings": {
    "employee": {
      "legacyField": "employee_code",
      "blihField": "employeeId",
      "transformation": "toString"
    },
    "firstName": {
      "legacyField": "first_nm",
      "blihField": "firstName",
      "transformation": "trim"
    },
    "salary": {
      "legacyField": "annual_sal",
      "blihField": "compensation.baseSalary",
      "transformation": "parseFloat"
    }
  },
  "tableMappings": {
    "employees": "employee_master",
    "departments": "dept_table",
    "positions": "job_codes"
  }
}
```

### 8.3 Incremental Sync Logic

```javascript
const performIncrementalSync = async (lastSyncTime) => {
  // Get changes from legacy system
  const changes = await legacyHRIS.getChanges({
    since: lastSyncTime,
    tables: ['employees', 'departments', 'positions']
  });
  
  for (const change of changes) {
    try {
      switch (change.operation) {
        case 'INSERT':
          await createEmployee(change.data);
          break;
        case 'UPDATE':
          await updateEmployee(change.id, change.data);
          break;
        case 'DELETE':
          await deactivateEmployee(change.id);
          break;
      }
      
      // Log successful sync
      await logSyncChange(change);
    } catch (error) {
      // Queue for retry
      await queueFailedChange(change, error);
    }
  }
  
  // Update last sync timestamp
  await updateLastSyncTime(new Date());
};
```

---

## 9. Third-Party Services

### 9.1 Background Check Services

| Service | Country | Integration Type |
|----------|-----------|------------------|
| **Ethiopian Federal Police** | Ethiopia | API |
| **HireRight** | International | API |
| **Checkr** | International | API |

```javascript
const initiateBackgroundCheck = async (candidateId, checkType) => {
  const candidate = await getCandidate(candidateId);
  const checkRequest = {
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    dateOfBirth: candidate.dateOfBirth,
    nationalId: candidate.nationalId,
    checkType: checkType, // CRIMINAL, EDUCATION, EMPLOYMENT
    consent: candidate.backgroundCheckConsent
  };
  
  const result = await backgroundCheckProvider.submit(checkRequest);
  
  // Store check reference
  await storeBackgroundCheck({
    candidateId,
    checkId: result.checkId,
    status: 'PENDING',
    initiatedAt: new Date()
  });
  
  return result;
};
```

### 9.2 Skills Assessment Platforms

```javascript
// Integration with online assessment platforms
const createSkillsAssessment = async (candidateId, skills) => {
  const assessment = await assessmentPlatform.createTest({
    candidateEmail: candidate.email,
    skills: skills,
    duration: 60, // minutes
    proctoring: true,
    language: 'en'
  });
  
  // Send assessment link to candidate
  await sendAssessmentEmail(candidate.email, {
    testUrl: assessment.testUrl,
    expiryDate: assessment.expiryDate,
    duration: assessment.duration
  });
  
  return assessment;
};
```

---

## 10. Data Migration

### 10.1 Migration Planning

```yaml
# migration-plan.yml
migration:
  sourceSystem: "Legacy HRIS"
  targetSystem: "BLIH HR"
  estimatedRecords:
    employees: 500
    attendance: 50000
    leave: 2000
    performance: 1500
  
  phases:
    - name: "Data Validation"
      duration: "3 days"
      activities:
        - "Profile mapping validation"
        - "Data quality assessment"
        - "Duplicate detection"
    
    - name: "Historical Data Migration"
      duration: "2 days"
      activities:
        - "Employee master data"
        - "Attendance history (2 years)"
        - "Leave history (2 years)"
    
    - name: "Cutover"
      duration: "1 day"
      activities:
        - "Final data sync"
        - "System switch"
        - "Validation checks"
```

### 10.2 Data Validation Rules

```javascript
const validateEmployeeData = (employee) => {
  const errors = [];
  
  // Required fields
  const required = ['employeeId', 'firstName', 'lastName', 'email', 'department'];
  for (const field of required) {
    if (!employee[field]) {
      errors.push(`${field} is required`);
    }
  }
  
  // Email format
  if (employee.email && !isValidEmail(employee.email)) {
    errors.push('Invalid email format');
  }
  
  // Employee ID uniqueness
  if (employee.employeeId && await isDuplicateEmployeeId(employee.employeeId)) {
    errors.push('Employee ID already exists');
  }
  
  // Salary range validation
  if (employee.salary && (employee.salary < 0 || employee.salary > 1000000)) {
    errors.push('Salary out of valid range');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
```

---

## 11. Monitoring & Troubleshooting

### 11.1 Integration Health Monitoring

```javascript
const monitorIntegrationHealth = async () => {
  const integrations = await getActiveIntegrations();
  
  for (const integration of integrations) {
    try {
      // Test connectivity
      const startTime = Date.now();
      await testIntegrationEndpoint(integration);
      const responseTime = Date.now() - startTime;
      
      // Update health status
      await updateIntegrationHealth(integration.id, {
        status: 'HEALTHY',
        responseTime,
        lastCheck: new Date()
      });
    } catch (error) {
      await updateIntegrationHealth(integration.id, {
        status: 'UNHEALTHY',
        error: error.message,
        lastCheck: new Date()
      });
      
      // Alert administrators
      await sendIntegrationAlert(integration, error);
    }
  }
};
```

### 11.2 Common Issues & Solutions

| Issue | Symptoms | Solution |
|--------|-----------|----------|
| **API Rate Limiting** | HTTP 429 responses | Implement exponential backoff |
| **Authentication Failure** | HTTP 401 responses | Refresh tokens, check client credentials |
| **Data Sync Delays** | Stale data in target | Check queue depth, retry failed items |
| **Webhook Delivery Failures** | Missing event notifications | Verify endpoint URL, check signature validation |
| **Time Zone Issues** | Incorrect timestamps | Ensure timezone consistency across systems |

### 11.3 Debug Mode

```javascript
// Enable debug logging for integration
const debugIntegration = async (integrationId, enable) => {
  await updateIntegrationConfig(integrationId, {
    debugMode: enable,
    logLevel: enable ? 'DEBUG' : 'INFO',
    logRetention: enable ? 30 : 7 // days
  });
  
  if (enable) {
    console.log(`Debug mode enabled for integration ${integrationId}`);
    console.log('All API calls and responses will be logged');
  }
};
```

---

## Integration Checklist

### Pre-Integration Setup
- [ ] Register integration in BLIH Admin
- [ ] Generate API credentials
- [ ] Configure IP whitelisting
- [ ] Set up webhook endpoints
- [ ] Test authentication flow
- [ ] Configure data mappings

### Testing Phase
- [ ] Unit test API calls
- [ ] Integration test with sample data
- [ ] Performance testing under load
- [ ] Error handling validation
- [ ] Security testing (penetration test)

### Production Deployment
- [ ] Switch to production endpoints
- [ ] Configure monitoring and alerts
- [ ] Document integration procedures
- [ ] Train support team
- [ ] Establish rollback procedures

---

*Integration Guide Version: 1.0*  
*Last Updated: February 2026*  
*For integration support: integrations@blih.com*
