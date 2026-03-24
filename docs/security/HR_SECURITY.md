# BLIH HR Module - Security Documentation

**Purpose:** Security controls and compliance guide for HR module  
**Audience:** Security Officers, Compliance Officers, IT Administrators  
**Version:** 1.0 | February 2026

---

## Table of Contents

1. [Security Overview](#1-security-overview)
2. [Data Classification](#2-data-classification)
3. [Access Control](#3-access-control)
4. [Data Protection](#4-data-protection)
5. [Audit & Monitoring](#5-audit--monitoring)
6. [Compliance Requirements](#6-compliance-requirements)
7. [Incident Response](#7-incident-response)
8. [Security Configuration](#8-security-configuration)

---

## 1. Security Overview

### 1.1 Security Architecture

```
┌─────────────────────────────────────────────────────┐
│                BLIH HR Security Layers            │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Network   │  │ Application  │  │    Data     │ │
│  │   Security  │  │   Security   │  │ Protection  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│         │                 │                 │        │
│  ┌──────▼──────┐   ┌─────▼──────┐   ┌────▼──────┐ │
│  │ WAF, DDoS   │   │ Input Valid │   │ Encryption │ │
│  │ Rate Limiting │   │ RBAC, CSRF  │   │ PII Masking│ │
│  └─────────────┘   └─────────────┘   └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 1.2 Threat Model

| Threat Category         | Examples                                 | Mitigations                               |
| ----------------------- | ---------------------------------------- | ----------------------------------------- |
| **Unauthorized Access** | Stolen credentials, privilege escalation | MFA, RBAC, session management             |
| **Data Breach**         | SQL injection, API abuse                 | Input validation, encryption, audit       |
| **Insider Threat**      | Data exfiltration, unauthorized access   | Need-to-know, DLP, monitoring             |
| **Privacy Violation**   | PII exposure, unauthorized viewing       | Field-level access, consent management    |
| **Compliance Breach**   | Missing controls, poor audit trails      | Automated compliance, evidence generation |

### 1.3 Security Principles

- **Least Privilege:** Users only access data necessary for their role
- **Defense in Depth:** Multiple security layers at different levels
- **Zero Trust:** Verify every request, regardless of source
- **Privacy by Design:** PII protection built into system architecture
- **Audit Everything:** All actions logged for compliance and investigation

---

## 2. Data Classification

### 2.1 Classification Levels

| Level            | Definition                               | Examples               | Access Controls |
| ---------------- | ---------------------------------------- | ---------------------- | --------------- |
| **Public**       | Non-sensitive, publicly available        | Open access            |
| **Internal**     | Company internal, not confidential       | Employee access only   |
| **Confidential** | Business sensitive, limited distribution | Role-based access      |
| **Restricted**   | Highly sensitive, need-to-know           | Executive/HR only      |
| **PII**          | Personally identifiable information      | Field-level encryption |

### 2.2 HR Data Classification Matrix

| Data Type                   | Classification | Storage Requirements   | Access Requirements |
| --------------------------- | -------------- | ---------------------- | ------------------- |
| **Employee Name, Email**    | Internal       | Encrypted at rest      | Role-based          |
| **Employee ID, Department** | Internal       | Encrypted at rest      | Role-based          |
| **Phone, Address**          | Confidential   | Field-level encryption | Manager + HR        |
| **Salary, Compensation**    | Restricted     | AES-256 encryption     | HR + Finance only   |
| **Bank Account Details**    | Restricted     | AES-256 + HSM          | HR + Finance only   |
| **Medical Information**     | Restricted     | AES-256 + audit trails | HR only             |
| **Performance Reviews**     | Confidential   | Encrypted at rest      | Manager + HR        |
| **Disciplinary Records**    | Restricted     | AES-256 + audit trails | HR + Legal only     |

### 2.3 Data Retention Policy

| Data Type               | Retention Period                     | Archive Location             | Disposal Method |
| ----------------------- | ------------------------------------ | ---------------------------- | --------------- |
| **Employee Records**    | 7 years post-termination             | Cold storage                 | Secure deletion |
| **Attendance Logs**     | 5 years                              | Hot storage (1 year) → Cold  | Secure deletion |
| **Leave Records**       | 7 years                              | Hot storage (2 years) → Cold | Secure deletion |
| **Performance Reviews** | 5 years                              | Hot storage (1 year) → Cold  | Secure deletion |
| **Payroll Records**     | 10 years                             | Cold storage                 | Secure deletion |
| **Audit Logs**          | 7 years                              | Hot storage (90 days) → Cold | Secure deletion |
| **PII Data**            | Until purpose fulfilled + legal hold | Encrypted storage            | Secure deletion |

---

## 3. Access Control

### 3.1 Role-Based Access Control (RBAC)

**HR-Specific Roles:**

```json
{
  "HR_ADMIN": {
    "description": "Full HR system access",
    "permissions": [
      "hr:*:*", // All HR permissions
      "hr:employee:sensitive_data",
      "hr:compliance:admin"
    ],
    "dataScope": "all"
  },
  "HR_MANAGER": {
    "description": "Department-level HR management",
    "permissions": [
      "hr:employee:view",
      "hr:employee:update",
      "hr:leave:approve",
      "hr:performance:review",
      "hr:attendance:view"
    ],
    "dataScope": "department"
  },
  "HR_ANALYST": {
    "description": "HR analytics and reporting",
    "permissions": [
      "hr:employee:view",
      "hr:reports:generate",
      "hr:compliance:view"
    ],
    "dataScope": "all",
    "restrictions": ["no_salary_access", "no_pii_export"]
  },
  "RECRUITER": {
    "description": "Recruitment functions only",
    "permissions": [
      "hr:recruitment:*",
      "hr:candidate:view",
      "hr:interview:schedule"
    ],
    "dataScope": "recruitment_data_only"
  }
}
```

### 3.2 Field-Level Access Control

**PII Field Restrictions:**

```javascript
const fieldAccessMatrix = {
  // Salary fields - HR + Finance only
  'compensation.base_salary': ['HR_ADMIN', 'HR_MANAGER', 'FINANCE_MANAGER'],
  'compensation.bank_account': ['HR_ADMIN', 'FINANCE_MANAGER'],

  // Medical information - HR only
  'health.medical_conditions': ['HR_ADMIN', 'HR_MANAGER'],
  'health.emergency_contact': ['HR_ADMIN', 'HR_MANAGER', 'EMPLOYEE_SELF'],

  // Performance reviews - Manager + HR
  'performance.reviews': ['HR_ADMIN', 'HR_MANAGER', 'LINE_MANAGER'],
  'performance.ratings': ['HR_ADMIN', 'HR_MANAGER', 'LINE_MANAGER'],

  // Disciplinary records - HR + Legal only
  'disciplinary.records': ['HR_ADMIN', 'LEGAL_COUNSEL'],

  // Basic info - Employee + Manager + HR
  'personal_info.phone': ['EMPLOYEE_SELF', 'LINE_MANAGER', 'HR_*'],
  'personal_info.address': ['EMPLOYEE_SELF', 'HR_*'],
};
```

### 3.3 Data Masking

**Masking Rules for Different User Types:**

```javascript
const applyDataMasking = (data, userRole, userId) => {
  const maskedData = { ...data };

  // Salary masking for non-authorized users
  if (!hasPermission(userRole, 'hr:compensation:view')) {
    maskedData.compensation = {
      base_salary: '***-***-***',
      currency: data.compensation.currency,
    };
  }

  // PII masking for reports
  if (userRole === 'HR_ANALYST') {
    maskedData.email = maskEmail(data.email);
    maskedData.phone = maskPhone(data.phone);
    maskedData.bankAccount = maskBankAccount(data.bankAccount);
  }

  // Self-view only for sensitive fields
  if (userId !== data.employeeId && !hasPermission(userRole, 'hr:pii:view')) {
    delete maskedData.medical;
    delete maskedData.disciplinary;
  }

  return maskedData;
};

const maskEmail = (email) => {
  const [username, domain] = email.split('@');
  return `${username.slice(0, 2)}***@${domain}`;
};

const maskPhone = (phone) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};
```

---

## 4. Data Protection

### 4.1 Encryption Standards

**At Rest:**

- **Database Encryption:** AES-256 with Transparent Data Encryption (TDE)
- **Field-Level Encryption:** AES-256 for PII fields (salary, bank accounts)
- **File Storage:** AES-256 with customer-managed keys
- **Backup Encryption:** AES-256 with separate key management

**In Transit:**

- **API Communication:** TLS 1.3 with perfect forward secrecy
- **Database Connections:** TLS 1.3 with certificate validation
- **File Transfers:** SFTP with AES-256 encryption
- **Email:** TLS 1.3 with SPF/DKIM/DMAARC

**Key Management:**

```yaml
encryption:
  algorithm: 'AES-256-GCM'
  keyRotation: 'quarterly'
  keySource: 'HSM' # Hardware Security Module
  backupKeys: 'encrypted_offsite'
  accessControl: 'multi_person_approval'
```

### 4.2 PII Protection

**PII Data Flow:**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Input    │ →  │ Validation  │ →  │ Encryption  │ →  │   Storage   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
   Sanitization        Access Control       Audit Trail
```

**PII Handling Rules:**

- Never log PII in application logs
- Use parameterized queries to prevent SQL injection
- Implement output encoding to prevent XSS
- Encrypt PII before database storage
- Mask PII in non-production environments

### 4.3 Data Loss Prevention (DLP)

**DLP Rules:**

```javascript
const dlpRules = {
  // Block large data exports
  largeExport: {
    threshold: 1000, // records
    action: 'BLOCK',
    requireApproval: true,
  },

  // Block PII downloads for non-authorized users
  piiDownload: {
    fields: ['salary', 'bank_account', 'medical'],
    allowedRoles: ['HR_ADMIN', 'FINANCE_MANAGER'],
    action: 'BLOCK',
  },

  // Alert on unusual access patterns
  unusualAccess: {
    patterns: [
      'mass_profile_views',
      'off_hours_access',
      'bulk_sensitive_queries',
    ],
    action: 'ALERT',
    threshold: 5, // deviations per hour
  },
};
```

---

## 5. Audit & Monitoring

### 5.1 Comprehensive Audit Logging

**Audit Event Categories:**
| Category | Events Logged | Retention |
|----------|----------------|------------|
| **Authentication** | Login, logout, MFA, password changes | 7 years |
| **Authorization** | Role changes, permission grants, access denials | 7 years |
| **Data Access** | View, export, search PII | 7 years |
| **Data Modification** | Create, update, delete with before/after values | 7 years |
| **Admin Actions** | Configuration changes, system updates | 7 years |
| **Security Events** | Failed logins, suspicious activity, lockouts | 7 years |
| **Compliance** | Access reviews, policy changes, evidence generation | 7 years |

**Audit Record Structure:**

```json
{
  "eventId": "evt-uuid",
  "timestamp": "2026-02-15T10:30:00.123Z",
  "userId": "user-uuid",
  "userEmail": "user@company.com",
  "userRole": "HR_MANAGER",
  "sessionId": "sess-uuid",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "action": "hr.employee.view",
  "resource": "employee/emp-001",
  "resourceId": "emp-001",
  "module": "HR",
  "result": "SUCCESS",
  "dataClassification": "CONFIDENTIAL",
  "sensitiveDataAccessed": ["compensation", "personal_info"],
  "changes": {
    "before": null,
    "after": {
      "fields": ["name", "email", "department"],
      "piiCount": 2
    }
  },
  "correlationId": "req-uuid",
  "complianceTags": ["GDPR_ARTICLE_29", "SOX_404"],
  "location": {
    "country": "Ethiopia",
    "region": "Addis Ababa"
  }
}
```

### 5.2 Real-time Security Monitoring

**Security Event Detection:**

```javascript
const securityMonitoring = {
  // Brute force detection
  bruteForce: {
    threshold: 5, // failed attempts
    window: 300, // seconds
    action: 'LOCK_ACCOUNT',
    duration: 900, // 15 minutes
  },

  // Unusual access patterns
  unusualAccess: {
    metrics: [
      'off_hours_access',
      'mass_data_export',
      'privilege_escalation_attempts',
      'api_abuse_patterns',
    ],
    baselineWindow: 30, // days
    deviationThreshold: 3.0, // standard deviations
  },

  // Data exfiltration detection
  dataExfiltration: {
    indicators: [
      'large_file_downloads',
      'frequent_api_calls',
      'bulk_data_exports',
      'unusual_destination_ips',
    ],
    thresholds: {
      downloadSize: 100 * 1024 * 1024, // 100MB
      apiCallsPerMinute: 100,
      exportRecordsPerHour: 1000,
    },
  },
};
```

### 5.3 Security Dashboard

**Real-time Metrics:**

- Active sessions by location
- Failed login attempts by IP
- PII access trends
- Unusual activity alerts
- Compliance status indicators

**Alert Escalation:**

```javascript
const escalationMatrix = {
  LOW: {
    notification: ['SECURITY_TEAM'],
    responseTime: 24, // hours
    autoActions: [],
  },
  MEDIUM: {
    notification: ['SECURITY_TEAM', 'IT_MANAGER'],
    responseTime: 4,
    autoActions: ['INCREASE_MONITORING'],
  },
  HIGH: {
    notification: ['SECURITY_TEAM', 'IT_MANAGER', 'CISO'],
    responseTime: 1,
    autoActions: ['BLOCK_IP', 'FORCE_LOGOUT'],
  },
  CRITICAL: {
    notification: ['ALL_STAKEHOLDERS'],
    responseTime: 0.25, // 15 minutes
    autoActions: ['EMERGENCY_LOCKDOWN', 'NOTIFY_REGULATORS'],
  },
};
```

---

## 6. Compliance Requirements

### 6.1 GDPR Compliance

**GDPR Implementation:**

```yaml
gdpr:
  lawfulBasis:
    - type: 'CONSENT'
      description: 'Employee consent for data processing'
    - type: 'CONTRACTUAL_NECESSITY'
      description: 'Employment contract requirements'
    - type: 'LEGAL_OBLIGATION'
      description: 'Ethiopian labor law compliance'

  dataSubjectRights:
    - right: 'ACCESS'
      process: 'Self-service portal + HR verification'
      timeframe: '30 days'
    - right: 'RECTIFICATION'
      process: 'Request correction with documentation'
      timeframe: '30 days'
    - right: 'ERASURE'
      process: 'Data deletion request + verification'
      timeframe: '30 days'
    - right: 'PORTABILITY'
      process: 'Export in machine-readable format'
      timeframe: '30 days'
    - right: 'OBJECTION'
      process: 'Consent withdrawal processing'
      timeframe: '30 days'

  dataProtection:
    encryption: 'AES-256'
    pseudonymization: 'enabled_for_analytics'
    accessControls: 'role_based'
    auditLogging: 'comprehensive'
    breachNotification: '72_hours'
```

### 6.2 Ethiopian Labor Law Compliance

**Local Compliance Requirements:**

```yaml
ethiopianLaborLaw:
  workingHours:
    maximum: '8_hours_per_day'
    overtime: 'up_to_2_hours_daily'
    weeklyLimit: '48_hours'
    overtimeRate: '1.25x_weekday_1.5x_weekend'

  leaveEntitlements:
    annual: '16_working_days_per_year'
    sick: 'unlimited_with_medical_certificate'
    maternity: '90_days_full_pay'
    paternity: '3_days_full_pay'
    bereavement: '3_days_immediate_family'

  recordKeeping:
    employeeRecords: '7_years'
    payrollRecords: '10_years'
    accidentRecords: '3_years'
    accessLogs: '7_years'

  dataResidency:
    location: 'Ethiopia'
    crossBorderTransfer: 'explicit_consent_required'
    storageLocation: 'on_premise_or_approved_provider'
```

### 6.3 ISO 27001 Controls

**Relevant Controls:**
| Control | Implementation | Evidence |
|---------|----------------|----------|
| A.9.2 Access Control | RBAC, MFA, session management | Access logs, role matrix |
| A.12.3 Data Backup | Automated daily backups | Backup logs, restore tests |
| A.13.2 Information Transfer | TLS encryption, secure protocols | Network configs, certificates |
| A.14.1 Information Classification | Data classification matrix | Classification policy, labels |
| A.16.1 Management of Incidents | Incident response procedure | Incident logs, response reports |

---

## 7. Incident Response

### 7.1 Incident Classification

**Incident Types:**
| Type | Severity | Response Time | Escalation |
|------|-----------|----------------|------------|
| **Data Breach** | Critical | < 1 hour | Executive, Legal, Regulators |
| **Unauthorized Access** | High | < 4 hours | CISO, IT Director |
| **Malware Infection** | High | < 4 hours | IT Security, System Admins |
| **Policy Violation** | Medium | < 24 hours | HR Manager, Compliance |
| **System Outage** | Medium | < 2 hours | IT Operations, Business Users |
| **Minor Security Event** | Low | < 72 hours | Security Team |

### 7.2 Incident Response Process

```
1. Detection & Analysis
   ├─ Automated monitoring alerts
   ├─ Manual reporting channels
   ├─ Initial assessment and classification
   └─ Containment strategy determination

2. Containment
   ├─ Isolate affected systems
   ├─ Block unauthorized access
   ├─ Preserve evidence for investigation
   └─ Activate business continuity plans

3. Investigation
   ├─ Root cause analysis
   ├─ Impact assessment
   ├─ Data breach determination
   └─ Evidence documentation

4. Eradication & Recovery
   ├─ Remove threats
   ├─ Restore systems from clean backups
   ├─ Patch vulnerabilities
   └─ Validate system integrity

5. Post-Incident Activities
   ├─ Lessons learned documentation
   ├─ Security improvements implementation
   ├─ Compliance reporting
   └─ Stakeholder communication
```

### 7.3 Breach Notification Workflow

**GDPR 72-Hour Notification:**

```javascript
const handleDataBreach = async (incident) => {
  // 1. Assess breach scope
  const impactAssessment = await assessBreachImpact(incident);

  // 2. Determine notification requirements
  const notificationRequired =
    impactAssessment.piiAffected && impactAssessment.riskLevel === 'HIGH';

  if (notificationRequired) {
    // 3. Prepare notification content
    const notification = {
      incidentType: 'DATA_BREACH',
      affectedDataTypes: impactAssessment.dataTypes,
      affectedCount: impactAssessment.affectedUsers,
      breachDate: incident.detectedAt,
      mitigationSteps: incident.containmentActions,
      contactInformation: securityTeamContact,
    };

    // 4. Send to supervisory authority (within 72 hours)
    await notifyRegulatoryAuthority({
      authority: 'Ethiopian Data Protection Authority',
      notification,
      deadline: '72_hours',
    });

    // 5. Notify affected individuals
    await notifyAffectedUsers({
      users: impactAssessment.affectedUsers,
      method: 'EMAIL_AND_SMS',
      template: 'DATA_BREACH_NOTIFICATION',
      urgency: 'HIGH',
    });
  }
};
```

---

## 8. Security Configuration

### 8.1 Security Settings

**Administrative Configuration:**

```yaml
security:
  authentication:
    passwordPolicy:
      minLength: 12
      requireUppercase: true
      requireLowercase: true
      requireNumbers: true
      requireSpecialChars: true
      preventReuse: 10 // previous passwords
      expirationDays: 90
      lockoutThreshold: 5
      lockoutDuration: 15 // minutes

    mfa:
      required: true
      methods: ['TOTP', 'SMS', 'EMAIL']
      backupCodes: 10
      gracePeriod: 7 // days

    session:
      timeoutMinutes: 480 // 8 hours
      maxConcurrent: 3
      requireReauth: true // for sensitive actions

  accessControl:
    rbac:
      defaultRole: 'EMPLOYEE'
      approvalRequired: true
      separationOfDuties: true

    dataClassification:
      automaticClassification: true
      userClassification: false
      encryptionByDefault: true

    api:
      rateLimiting:
        default: 100 // requests per minute
        burst: 200
        sensitiveEndpoints: 10

      cors:
        allowedOrigins: ['https://company.com']
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE']
        maxAge: 86400

  monitoring:
    audit:
      logLevel: 'INFO'
      retention: '7_years'
      realTimeAlerts: true

    security:
      bruteForceDetection: true
      anomalyDetection: true
      geoBlocking: false
      ipWhitelist: ['192.168.0.0/16', '10.0.0.0/8']
```

### 8.2 Security Headers

**HTTP Security Headers:**

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 8.3 Security Testing

**Regular Security Assessments:**

- **Penetration Testing:** Quarterly by external security firm
- **Vulnerability Scanning:** Weekly automated scans
- **Code Review:** Mandatory for all changes
- **Security Testing:** Unit and integration tests for security controls
- **Compliance Audits:** Annual internal, annual external

**Test Coverage:**

```javascript
const securityTests = {
  authentication: [
    'weak_password_detection',
    'brute_force_protection',
    'session_hijacking',
    'mfa_bypass',
  ],
  authorization: [
    'privilege_escalation',
    'horizontal_authorization_bypass',
    'role_based_access_control',
  ],
  dataProtection: [
    'sql_injection',
    'xss_prevention',
    'csrf_protection',
    'pii_exposure',
  ],
  infrastructure: [
    'tls_configuration',
    'server_hardening',
    'network_segmentation',
    'backup_security',
  ],
};
```

---

## Security Checklist

### Pre-Deployment Security Review

- [ ] Data classification matrix implemented
- [ ] Field-level access controls configured
- [ ] PII encryption at rest and in transit
- [ ] Comprehensive audit logging enabled
- [ ] Security monitoring and alerting configured
- [ ] Incident response procedures documented
- [ ] Security headers implemented
- [ ] Rate limiting and DDoS protection active
- [ ] Backup and recovery procedures tested
- [ ] Compliance requirements mapped

### Ongoing Security Operations

- [ ] Daily security log review
- [ ] Weekly vulnerability scan results analysis
- [ ] Monthly access review and certification
- [ ] Quarterly penetration testing
- [ ] Annual compliance audit preparation
- [ ] Security awareness training for HR staff
- [ ] Incident response drills (bi-annual)
- [ ] Security configuration updates and patches

---

_Security Guide Version: 1.0_  
_Last Updated: February 2026_  
_For security issues: security@blih.com_  
_Emergency: security-emergency@blih.com_
