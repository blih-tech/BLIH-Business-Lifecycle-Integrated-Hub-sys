# BLIH Core Platform - Feature & User Experience Documentation

**Module:** Core Platform (Foundation Services)  
**Version:** 1.0  
**Last Updated:** February 2026  
**Status:** Production Ready

---

## Table of Contents
1. [Module Overview](#module-overview)
2. [Technical Architecture](#technical-architecture)
3. [Implementation Details](#implementation-details)
4. [User Personas](#user-personas)
5. [Feature Catalog](#feature-catalog)
6. [User Experience Flows](#user-experience-flows)
7. [UI Components & Patterns](#ui-components--patterns)
8. [Security & Access Control](#security--access-control)
9. [Integration Points](#integration-points)
10. [System Administration](#system-administration)
11. [Database Schema](#database-schema)
12. [Deployment Configuration](#deployment-configuration)

---

## Module Overview

### Purpose
The Core Platform provides foundational services that power all BLIH modules: identity and access management, audit logging, notifications, and system configuration. It ensures consistent governance, security, and compliance across the entire system.

### Value Proposition
- **Unified Identity:** Single sign-on across all modules with consistent user experience
- **Complete Auditability:** Every action logged with immutable records for compliance
- **Proactive Communication:** Multi-channel notifications keep users informed
- **Centralized Governance:** Consistent policies and controls across the organization
- **Simplified Administration:** One place to manage users, roles, and system settings

### Target Users
| Role | Primary Use Case | Key Features Used |
|------|-----------------|-------------------|
| All Users | Login, profile, notifications | Auth, profile, notification center |
| Department Manager | Team access management | User management, role assignment |
| IT Admin | System configuration | Settings, integrations, monitoring |
| Security Officer | Audit and compliance | Audit logs, access reports, RBAC |
| Compliance Officer | Evidence generation | Audit export, compliance dashboards |
| End Users | Daily system interaction | Dashboard, notifications, search |

### Technical Specifications
| Component | Technology | Version | Purpose |
|------------|-------------|----------|---------|
| **Authentication** | Keycloak | 22.x | SSO, MFA, user federation |
| **Session Store** | Redis | 7.x | Session management, caching |
| **Database** | PostgreSQL | 15.x | Core platform data |
| **Message Queue** | RabbitMQ | 3.12.x | Event-driven communication |
| **Cache** | Redis | 7.x | Application caching |
| **Search** | Elasticsearch | 8.x | Audit log search |
| **Monitoring** | Prometheus + Grafana | Latest | Metrics and alerting |

### Service Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                 Core Platform Services               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Auth      │  │    RBAC     │  │   Audit     │ │
│  │  Service    │  │   Service   │  │   Service   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│         │                 │                 │        │
│  ┌──────▼──────┐   ┌─────▼──────┐   ┌────▼──────┐ │
│  │  Keycloak   │   │ PostgreSQL │   │ RabbitMQ  │ │
│  │   (SSO)     │   │ (Database)  │   │ (Events)  │ │
│  └─────────────┘   └─────────────┘   └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Architecture

### Core Services Design

**Microservices Pattern:**
- **Auth Service:** Handles authentication, MFA, session management
- **RBAC Service:** Role-based access control and permissions
- **Audit Service:** Comprehensive logging and compliance tracking
- **Notification Service:** Multi-channel message delivery
- **Configuration Service:** System settings and feature flags

**Data Flow Architecture:**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │───▶│   Gateway   │───▶│   Services  │
│  (Next.js)  │    │   (API)     │    │  (NestJS)   │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                   │
                           ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │   Redis     │    │ PostgreSQL  │
                   │  (Cache)    │    │ (Database)  │
                   └─────────────┘    └─────────────┘
```

### Event-Driven Architecture

**Event Bus Pattern:**
- **Publisher:** Core services emit events for all state changes
- **Subscriber:** Business modules subscribe to relevant events
- **Event Store:** Immutable log of all events for audit trail

**Event Types:**
```javascript
// Authentication Events
auth.login.success
auth.login.failure
auth.logout
auth.password.changed
auth.mfa.enabled

// User Management Events
user.created
user.updated
user.disabled
user.role.assigned
user.role.revoked

// System Events
system.config.changed
system.maintenance.started
system.maintenance.completed
```

### Scalability Design

**Horizontal Scaling:**
- **Stateless Services:** All core services designed for horizontal scaling
- **Load Balancing:** NGINX with health checks and session affinity
- **Database Sharding:** User data sharded by organization
- **Cache Clustering:** Redis cluster for session and data caching

**Performance Targets:**
- **API Response Time:** < 200ms (95th percentile)
- **Authentication:** < 500ms including MFA validation
- **Audit Log Search:** < 1 second for 30-day queries
- **Notification Delivery:** < 5 seconds for critical alerts

---

## Implementation Details

### Authentication Implementation

**JWT Token Structure:**
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-id"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@company.com",
    "roles": ["EMPLOYEE", "HR_MANAGER"],
    "permissions": [
      "core:user:view",
      "hr:employee:create"
    ],
    "orgId": "org-uuid",
    "sessionId": "session-uuid",
    "iat": 1640991600,
    "exp": 1640995200,
    "iss": "blih-core",
    "aud": "blih-modules"
  }
}
```

**MFA Implementation:**
```javascript
// TOTP Implementation (Time-based One-Time Password)
const speakeasy = require('speakeasy');

// Generate secret for user
const secret = speakeasy.generateSecret({
  name: `BLIH (${user.email})`,
  issuer: 'BLIH',
  length: 32
});

// Verify TOTP token
const verified = speakeasy.totp.verify({
  secret: user.mfaSecret,
  encoding: 'base32',
  token: providedToken,
  window: 2 // Allow 2 time steps (30 seconds each)
});
```

### RBAC Implementation

**Permission Model:**
```javascript
// Permission Format: module:resource:action
const permissions = {
  'core:user:view': 'View user profiles',
  'core:user:create': 'Create new users',
  'core:user:update': 'Update user information',
  'hr:employee:view': 'View employee records',
  'hr:leave:approve': 'Approve leave requests'
};

// Role Definition
const role = {
  id: 'hr_manager',
  name: 'HR Manager',
  permissions: [
    'hr:employee:*', // Wildcard for all employee actions
    'hr:leave:approve',
    'hr:performance:review'
  ]
};

// Permission Check
const hasPermission = (userPermissions, requiredPermission) => {
  return userPermissions.some(permission => {
    if (permission.includes('*')) {
      const [module, resource] = permission.split(':');
      const [reqModule, reqResource] = requiredPermission.split(':');
      return module === reqModule && resource === reqResource;
    }
    return permission === requiredPermission;
  });
};
```

### Audit Logging Implementation

**Audit Event Structure:**
```javascript
const auditEvent = {
  id: generateUUID(),
  timestamp: new Date().toISOString(),
  userId: user.id,
  userEmail: user.email,
  action: 'hr.employee.update',
  resource: 'employee/emp-001',
  resourceId: 'emp-001',
  result: 'SUCCESS',
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
  changes: {
    before: oldData,
    after: newData
  },
  sessionId: session.id,
  requestId: request.id,
  compliance: {
    gdpr: true,
    sox: true,
    iso27001: true
  }
};
```

**Audit Storage Strategy:**
```sql
-- PostgreSQL Audit Table Structure
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(255),
  resource_id VARCHAR(255),
  result VARCHAR(20) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  changes_before JSONB,
  changes_after JSONB,
  session_id UUID,
  request_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource, resource_id);
```

### Notification System Implementation

**Multi-Channel Delivery:**
```javascript
class NotificationService {
  async send(notification) {
    const channels = this.getChannels(notification.type, notification.priority);
    const promises = channels.map(channel => this.sendViaChannel(channel, notification));
    
    // Parallel delivery with timeout
    const results = await Promise.allSettled(promises);
    
    // Log delivery results
    this.logDeliveryResults(notification, results);
    
    // Retry failed deliveries
    this.scheduleRetries(notification, results);
  }
  
  getChannels(type, priority) {
    const channelMap = {
      'CRITICAL': ['EMAIL', 'SMS', 'PUSH', 'WEBHOOK'],
      'HIGH': ['EMAIL', 'PUSH'],
      'NORMAL': ['EMAIL'],
      'LOW': ['EMAIL']
    };
    
    return channelMap[priority] || ['EMAIL'];
  }
}
```

---

## User Personas

### Persona 1: Sam - IT Administrator
**Profile:** 5 years system admin experience, manages BLIH deployment for 200 users  
**Goals:**
- Ensure system security and availability
- Manage user access efficiently
- Configure integrations with other systems
- Monitor system health and performance

**Pain Points:**
- User provisioning takes too much time
- Difficult to track who has access to what
- No visibility into system usage patterns
- Security incidents are hard to investigate

**How BLIH Helps:**
- Bulk user import and role assignment
- Complete access audit trail
- System analytics and health dashboards
- Immutable logs for incident investigation

### Persona 2: Rachel - Compliance Officer
**Profile:** Responsible for ISO 27001/9001 compliance, internal and external audits  
**Goals:**
- Generate audit evidence efficiently
- Demonstrate access controls are working
- Track changes and approvals
- Respond to auditor requests quickly

**Pain Points:**
- Gathering audit evidence is time-consuming
- Can't prove who did what and when
- Access reviews are manual and error-prone
- Audit preparation takes weeks

**How BLIH Helps:**
- One-click audit report generation
- Complete activity history for every record
- Automated access certification campaigns
- Always-ready compliance documentation

### Persona 3: Alex - Department Manager
**Profile:** Engineering manager with 12 direct reports, uses multiple BLIH modules  
**Goals:**
- Ensure team has appropriate system access
- Stay informed of team activities
- Receive relevant notifications only
- Manage team workflows efficiently

**Pain Points:**
- New team members wait days for access
- Too many irrelevant notifications
- Don't know what team members are doing in the system
- Offboarding is often forgotten

**How BLIH Helps:**
- Self-service access requests with approval
- Smart notification preferences
- Team activity dashboard
- Automated offboarding checklists

---

## Feature Catalog

### 1. Identity & Access Management (IAM)

#### 1.1 Authentication
**Feature:** Secure user login with multiple authentication options  
**User Value:** Convenient yet secure access to the system

**Authentication Methods:**
- **Username/Password:** Standard login with password policies
- **Single Sign-On (SSO):** Integration with corporate identity provider
- **Multi-Factor Authentication (MFA):** TOTP, SMS, email verification
- **Passwordless:** WebAuthn/FIDO2 support (optional)
- **Social Login:** Google, Microsoft (configurable)

**Password Policies:**
- Minimum length and complexity
- Password expiration (configurable)
- History prevention (no reuse)
- Account lockout after failed attempts
- Password strength indicator

**Session Management:**
- Configurable session timeout
- Concurrent session limits
- Remember me option
- Force logout capability (admin)
- Session activity monitoring

**UX Highlights:**
- Clean, branded login page
- Password visibility toggle
- "Forgot password" self-service
- Clear error messages (no user enumeration)
- Redirect to original destination after login

#### 1.2 User Management
**Feature:** Complete user lifecycle management  **User Value:** Right people have right access at right time

**User Lifecycle:**
- **Provisioning:**
  - Manual creation
  - Bulk import (CSV/Excel)
  - Auto-provisioning from HR system
  - Self-registration (configurable)
  
- **Maintenance:**
  - Profile updates
  - Password resets
  - MFA setup/management
  - Session management
  
- **Deprovisioning:**
  - Disable/suspend account
  - Access revocation
  - Data ownership transfer
  - Archive account

**User Profile:**
- Basic info: Name, email, phone, photo
- Organizational: Department, manager, employee ID
- Contact preferences: Email, SMS, in-app
- Security: MFA status, password age, last login
- Activity: Login history, recent actions
- Access: Roles, permissions, module access

**UX Highlights:**
- User directory with search and filters
- Bulk operations (activate, deactivate, reset)
- Import wizard with validation
- User activity timeline

#### 1.3 Role-Based Access Control (RBAC)
**Feature:** Granular permission management through roles  **User Value:** Least-privilege access that's easy to manage

**Role Hierarchy:**
- **System Roles:** Built-in roles (Admin, User, Guest)
- **Custom Roles:** Organization-defined roles
- **Module Roles:** Per-module access levels

**Built-in Roles:**
| Role | Description | Typical Permissions |
|------|-------------|---------------------|
| Super Admin | Full system access | All permissions |
| Module Admin | Module-specific admin | Module management |
| Manager | Team oversight | Team data, approvals |
| Standard User | Regular employee | Core functionality |
| Guest | Limited access | View-only, specific areas |

**Custom Role Creation:**
- Name and description
- Base role (copy permissions from)
- Module access (which modules visible)
- Granular permissions (per-module actions)
- Data scope (own, team, department, all)
- Assignment rules (auto-assign based on attributes)

**Permission Granularity:**
Format: `MODULE:RESOURCE:ACTION`

Examples:
- `HR:employee:view` - View employee records
- `CRM:deal:edit` - Edit sales deals
- `PROJECTS:project:create` - Create projects
- `FINANCE:report:export` - Export financial reports
- `BRAIN:document:approve` - Approve knowledge documents

**UX Highlights:**
- Role comparison view
- Permission preview for new roles
- User-role assignment matrix
- Role usage analytics

#### 1.4 Organization Management
**Feature:** Define and manage organizational structure  **User Value:** Accurate reporting lines and data segmentation

**Organizational Elements:**
- **Company:** Single company context (BLIH)
- **Departments:** Business units/divisions
- **Teams:** Functional groups
- **Locations:** Physical sites/offices
- **Cost Centers:** Budget responsibility centers

**Hierarchy:**
```
Company (BLIH)
├── Department: Engineering
│   ├── Team: Backend Development
│   ├── Team: Frontend Development
│   └── Team: QA
├── Department: Sales
│   ├── Team: Enterprise Sales
│   └── Team: SMB Sales
└── Department: Operations
    └── Team: Customer Success
```

**UX Highlights:**
- Org chart visualization
- Drag-and-drop reorganization
- Department-level permissions
- Headcount and budget tracking

### 2. Audit & Compliance

#### 2.1 Audit Logging
**Feature:** Comprehensive, immutable activity recording  **User Value:** Complete accountability and compliance evidence

**Logged Events:**
- **Authentication:** Logins, logouts, failed attempts, password changes
- **Data Access:** View, create, update, delete operations
- **Data Changes:** Before/after values for modifications
- **Administrative:** Configuration changes, permission updates
- **Security:** MFA events, session events, access denials
- **System:** Scheduled jobs, errors, performance events

**Audit Record Structure:**
```json
{
  "timestamp": "2026-02-15T10:30:00Z",
  "userId": "user-uuid",
  "userEmail": "john@company.com",
  "action": "employee.update",
  "module": "HR",
  "resourceId": "emp-001",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "changes": {
    "before": { "salary": 50000 },
    "after": { "salary": 55000 }
  },
  "metadata": {
    "requestId": "req-uuid",
    "sessionId": "sess-uuid"
  }
}
```

**Log Retention:**
- Standard: 7 years (configurable)
- Hot storage: 90 days (searchable)
- Cold storage: Archive with retrieval capability

**UX Highlights:**
- Audit log viewer with filters
- Export to CSV/PDF for auditors
- Real-time activity stream
- Tamper-evident verification

#### 2.2 Access Reviews
**Feature:** Periodic certification of user access rights  **User Value:** Compliance with regular access recertification requirements

**Review Campaigns:**
- **User Access Reviews:** Managers certify direct reports' access
- **Role Reviews:** Validate role definitions and assignments
- **Privilege Reviews:** High-risk permission validation
- **Orphaned Access:** Detect and remediate stale permissions

**Review Workflow:**
1. **Initiation:**
   - Define scope (users/roles to review)
   - Set deadline
   - Assign reviewers
   - Launch campaign

2. **Review Process:**
   - Reviewers receive notification
   - Review access list
   - Certify (approve) or revoke (remove)
   - Add comments
   - Submit review

3. **Remediation:**
   - System logs revocations
   - Notifications to affected users
   - Manager approval for high-risk changes
   - Completion report

**UX Highlights:**
- Review dashboard with progress
- Bulk certification actions
- Overdue reminder escalations
- Historical review archive

#### 2.3 Compliance Reporting
**Feature:** Pre-built compliance reports and dashboards  **User Value:** Rapid audit response and continuous compliance monitoring

**Standard Reports:**
- **User Access Report:** Who has access to what
- **Privileged Access Report:** Users with elevated permissions
- **Activity Summary:** High-level system usage
- **Failed Login Report:** Security incident analysis
- **Data Export Log:** Sensitive data movement tracking
- **Permission Changes:** RBAC modification history

**Compliance Dashboards:**
- ISO 27001 control evidence
- SOX IT control status
- GDPR data processing records
- PCI DSS access controls

**Export Formats:**
- PDF (executive summaries)
- Excel (detailed data)
- CSV (system import)
- JSON (API integration)

**UX Highlights:**
- Scheduled report generation
- Email distribution lists
- Report template library
- One-click auditor package export

### 3. Notifications & Communication

#### 3.1 Notification System
**Feature:** Multi-channel alert and messaging system  **User Value:** Stay informed without information overload

**Notification Channels:**
- **In-App:** Bell icon with badge count, notification center
- **Email:** Configurable frequency (immediate, digest, weekly)
- **SMS:** Critical alerts only (configurable)
- **Push:** Mobile app notifications
- **Slack/Teams:** Integration channels

**Notification Categories:**
| Category | Examples | Default Channel |
|----------|----------|-----------------|
| **System** | Password reset, MFA required | Email |
| **Action Required** | Approvals, tasks, reminders | In-app + Email |
| **Informational** | Status updates, completions | In-app |
| **Security** | Login from new device, lockout | Email + SMS |
| **Urgent** | System outage, data breach | All channels |

**Notification Preferences:**
- Per-category channel selection
- Frequency settings (immediate, hourly digest, daily digest)
- Quiet hours for non-urgent notifications
- Module-specific subscriptions
- Do-not-disturb mode

**UX Highlights:**
- Notification center with filtering
- Mark all as read
- Archive/delete notifications
- Custom notification rules

#### 3.2 Activity Feed
**Feature:** Real-time stream of relevant system events  **User Value:** Situational awareness of work context

**Feed Content:**
- Actions by people you work with
- Updates to records you follow
- Status changes on your projects/deals
- Comments on your tasks
- System announcements

**Personalization:**
- Follow/unfollow records
- Priority contacts
- Ignore patterns (reduce noise)
- Digest vs. real-time preference

**UX Highlights:**
- Infinite scroll with lazy loading
- Inline actions (approve, comment, view)
- Filter by type, module, date
- Mark as read / dismiss

### 4. System Configuration

#### 4.1 Module Management
**Feature:** Enable/disable and configure system modules  **User Value:** Tailored system to organizational needs

**Module Lifecycle:**
- **Available:** Licensed but not deployed
- **Enabled:** Active and accessible
- **Configured:** Customized for organization
- **Disabled:** Inaccessible (data preserved)

**Configuration Options:**
- Module activation/deactivation
- Feature toggles (enable sub-features)
- Default settings
- Integration connections
- Custom field definitions

**UX Highlights:**
- Module marketplace view
- Configuration wizards
- Settings import/export
- Change history

#### 4.2 System Settings
**Feature:** Global configuration for the BLIH instance  **User Value:** Consistent system behavior aligned with policies

**Setting Categories:**
- **General:** Company name, logo, timezone, date format
- **Security:** Password policy, MFA requirements, session timeout
- **Notifications:** Default channels, retention, templates
- **Integrations:** API keys, connection settings
- **Backup:** Schedule, retention, destination
- **Compliance:** Audit retention, data residency

**Environment-Specific:**
- Development settings
- Staging configuration
- Production parameters

**UX Highlights:**
- Settings search
- Category organization
- Validation on save
- Rollback capability

#### 4.3 Customization
**Feature:** Branding and UI personalization  **User Value:** System feels like part of the organization

**Branding Options:**
- Company logo (header, login page, emails)
- Color scheme (primary, secondary colors)
- Favicon
- Custom CSS (advanced)

**UI Customization:**
- Default dashboard layouts
- Custom fields (per module)
- Form layouts
- Report templates

**UX Highlights:**
- Live preview of changes
- Logo size guidelines
- Color contrast validation
- Reset to defaults

### 5. Dashboard & Navigation

#### 5.1 User Dashboard
**Feature:** Personalized landing page with relevant information  **User Value:** Quick access to what matters most

**Dashboard Widgets:**
- **My Tasks:** Pending items requiring action
- **Recent Activity:** Recently accessed records
- **Notifications:** Unread alerts
- **Quick Actions:** Common shortcuts
- **My Metrics:** Personal KPIs (deals closed, hours logged)
- **Team Updates:** Activities from team members
- **Upcoming:** Calendar events, deadlines

**Customization:**
- Add/remove widgets
- Rearrange layout
- Configure widget settings
- Save multiple layouts

**UX Highlights:**
- Drag-and-drop widget arrangement
- Responsive grid layout
- Widget expand/collapse
- Mobile-optimized view

#### 5.2 Global Navigation
**Feature:** Consistent navigation across all modules  **User Value:** Easy movement between different parts of the system

**Navigation Elements:**
- **Top Bar:** Logo, module switcher, global search, notifications, profile
- **Side Menu:** Contextual based on current module
- **Breadcrumbs:** Path back to parent pages
- **Quick Links:** Frequently accessed pages
- **Favorites:** User-defined shortcuts

**Search:**
- Global search across all modules
- Type-ahead suggestions
- Filter by module
- Recent searches
- Saved searches

**UX Highlights:**
- Keyboard shortcuts (Cmd+K for search)
- Collapsible sidebar
- Recently visited modules
- Mobile hamburger menu

#### 5.3 Module Switcher
**Feature:** Easy navigation between BLIH modules  **User Value:** Seamless workflow across different business functions

**Switcher Interface:**
```
┌─────────────────────────────────────────────────────┐
│  ☰                                                   │
│                                                      │
│  MODULES                                             │
│  ├─ 🏠 Dashboard                                     │
│  ├─ 👥 HR Team                                       │
│  ├─ 🤝 CRM                                           │
│  ├─ 📊 Projects                                      │
│  ├─ 💰 Finance                                       │
│  ├─ 🧠 Brain                                         │
│  └─ ⚙️ Admin                                         │
│                                                      │
│  RECENT                                              │
│  ├─ Employee Directory (HR)                          │
│  ├─ Sales Pipeline (CRM)                             │
│  └─ TechCorp Project (Projects)                      │
└─────────────────────────────────────────────────────┘
```

---

## User Experience Flows

### Flow 1: User Onboarding & First Login

**Scenario:** New employee Alex logs in for the first time

```
1. Account Created by HR
   ├─ HR admin creates account in Core Platform
   ├─ Temporary password generated
   ├─ Welcome email sent with login link
   └─ Account status: Pending First Login

2. Alex receives email
   Subject: "Welcome to BLIH - Your Account is Ready"
   Body:
   ├─ "Welcome to the team! Your BLIH account has been created."
   ├─ Username: alex.chen@company.com
   ├─ [Set Your Password] button
   └─ Link expires in 48 hours

3. Password Setup
   Alex clicks link → Password setup page
   ├─ Enters temporary password (from email)
   ├─ Creates new password (strength indicator shows "Strong")
   ├─ Confirms new password
   └─ Password policy acknowledged

4. MFA Setup (if required)
   ├─ "Enable Two-Factor Authentication"
   ├─ QR code displayed for authenticator app
   ├─ Alex scans with phone → 6-digit code entered
   ├─ Backup codes generated and saved
   └─ MFA enabled ✓

5. Profile Completion
   ├─ Profile photo upload (optional)
   ├─ Contact preferences (email, SMS)
   ├─ Timezone selection
   ├─ Language preference
   └─ Department and manager (pre-filled from HR)

6. Dashboard Tour
   ├─ "Welcome to your dashboard!" modal appears
   ├─ Highlights key areas:
   │  ├─ "Your tasks appear here"
   │  ├─ "Recent notifications here"
   │  └─ "Access all modules from here"
   └─ Tour can be replayed from Help menu

7. First Actions Suggested
   Dashboard shows:
   ├─ [Complete Your Profile] (90% done)
   ├─ [Review Employee Handbook] (Brain)
   ├─ [Meet Your Team] (HR directory)
   └─ [Set Notification Preferences]

8. Ready to Use
   ├─ Account status: Active
   ├─ Notifications enabled
   ├─ Dashboard personalized
   └─ First login complete in 4 minutes
```

### Flow 2: Access Request & Approval

**Scenario:** Alex needs access to CRM for sales support

```
1. Alex identifies need
   ├─ Starting sales support role
   ├─ Currently has access to: HR, Projects
   └─ Needs: CRM access

2. Request Access
   Alex goes to: Profile → Access → Request Access
   ├─ "Request Additional Access" form
   ├─ Selects: CRM Module
   ├─ Selects role: CRM Standard User
   ├─ Reason: "Supporting sales team with technical pre-sales"
   ├─ Duration: Permanent (vs. Temporary)
   └─ Submits request

3. Request Routing
   System determines approval chain:
   ├─ Level 1: Direct Manager (Priya)
   ├─ Level 2: CRM Module Admin (Sales Manager)
   └─ Notification sent to both

4. Manager Approval (Priya)
   ├─ Receives email: "Access request from Alex Chen"
   ├─ Opens notification → Request details
   ├─ Reviews: Reason legitimate ✓
   ├─ Clicks: [Approve]
   └─ Request moves to Level 2

5. Module Admin Approval (Sales Manager)
   ├─ Receives notification
   ├─ Reviews access level appropriateness
   ├─ Approves with comment: "Approved for pre-sales support"
   └─ Request fully approved

6. Access Provisioning
   ├─ CRM role assigned to Alex
   ├─ Notification to Alex: "Access granted to CRM"
   ├─ CRM appears in Alex's module switcher
   ├─ Audit log: Access granted, approvers recorded
   └─ Alex can now access CRM

7. Follow-up
   ├─ Alex receives CRM onboarding guide (Brain)
   ├─ CRM dashboard appears in Alex's home
   └─ Access review scheduled for 6 months

[Total time: 4 hours from request to approval]
```

### Flow 3: Security Incident Investigation

**Scenario:** Suspicious login activity detected

```
1. Alert Triggered
   System detects:
   ├─ Login from unusual location (foreign country)
   ├─ Outside normal hours (3 AM local time)
   └─ Failed MFA attempt
   
   Action: Account temporarily locked
   Notifications: User (email), Security Officer (SMS)

2. User Notification (Alex)
   Email: "Suspicious login attempt detected"
   ├─ Time and location of attempt
   ├─ "Was this you?"
   │  ├─ [Yes, verify and unlock] → MFA challenge
   │  └─ [No, secure my account] → Password reset forced
   └─ Contact IT Security if concerned

3. Security Investigation (Rachel)
   Rachel opens Security Dashboard:
   ├─ Alert: "Alex Chen - Suspicious Login"
   ├─ Opens user activity:
   │  ├─ Login history (last 30 days)
   │  ├─ Geolocation analysis
   │  ├─ Device fingerprinting
   │  └─ Recent actions taken
   ├─ Cross-references:
   │  ├─ Was Alex traveling? (HR calendar: No)
   │  ├─ VPN usage? (No)
   │  └─ Similar pattern for others? (No)
   └─ Assessment: Likely credential compromise

4. Response Actions
   Rachel takes action:
   ├─ Keeps account locked
   ├─ Forces password reset
   ├─ Invalidates all sessions
   ├─ Requires MFA re-enrollment
   └─ Schedules security awareness training

5. Audit Trail
   All actions logged:
   ├─ Suspicious login attempt
   ├─ Account locked (automated)
   ├─ Investigation conducted by Rachel
   ├─ Remediation actions taken
   └─ Resolution: Account secured

6. Follow-up
   ├─ Alex completes password reset + MFA setup
   ├─ Security training assigned
   ├─ 30-day monitoring flag set
   └─ Incident report generated

[Resolution time: 2 hours]
```

---

## UI Components & Patterns

### Login Page
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                        [Company Logo]                               │
│                                                                     │
│                    Sign In to BLIH                                  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Email                                                        │   │
│  │  [alex.chen@company.com                                   ]   │   │
│  │                                                               │   │
│  │  Password                                   [👁️]            │   │
│  │  [••••••••••••••                                            ]   │   │
│  │                                                               │   │
│  │  [✓] Remember me              [Forgot password?]             │   │
│  │                                                               │   │
│  │              [         Sign In         ]                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│          ───────────  Or continue with  ───────────                 │
│                                                                     │
│              [Google]  [Microsoft]  [SSO]                          │
│                                                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### User Dashboard
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo]  [Dashboard ▼]  [🔍]  [🔔 5]  [👤 Alex ▼]                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Good morning, Alex! 👋                                             │
│                                                                     │
│  MY TASKS                      RECENT ACTIVITY                      │
│  ┌─────────────────────┐      ┌─────────────────────┐              │
│  │ 🔴 Approve: Leave   │      │ You updated Project │              │
│  │    Request (2)      │      │ Alpha status        │              │
│  │                     │      │ 2 hours ago         │              │
│  │ 🟡 Review: Q1       │      │                     │              │
│  │    Goals            │      │ Sarah commented on  │              │
│  │                     │      │ your task           │              │
│  │ 🟢 Submit: Expense  │      │ 4 hours ago         │              │
│  │    Report           │      │                     │              │
│  │                     │      │ Project Beta          │              │
│  │ [View All Tasks]    │      │ milestone completed │              │
│  └─────────────────────┘      │ 1 day ago           │              │
│                               └─────────────────────┘              │
│                                                                     │
│  QUICK ACTIONS             NOTIFICATIONS                            │
│  [+ New Project]           ⚠️ Password expires in 3 days           │
│  [+ Log Time]              📋 2 tasks assigned to you              │
│  [+ Create Lead]           🏆 Q1 goals review due Friday           │
│  [View Calendar]                                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Audit Log Viewer
```
┌─────────────────────────────────────────────────────────────────────┐
│  Audit Log                                [Export] [⚙️ Columns ▼]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Filter: [All Modules ▼]  [All Users ▼]  [All Actions ▼]            │
│  Date: [Last 7 Days ▼]                                              │
│  Search: [                                                      ]   │
│                                                                     │
│  Time          User           Action           Module    Resource    │
│  ──────────────────────────────────────────────────────────────   │
│  10:32 AM      Alex Chen      employee.update  HR        EMP-001     │
│  10:28 AM      John Smith     deal.create     CRM       Deal-42    │
│  09:45 AM      Sarah Jones    project.view    Projects  PRJ-105    │
│  09:30 AM      System         payroll.process Finance   Batch-22   │
│  09:15 AM      Mike Ross      login.success   Core      Auth       │
│                                                                     │
│  [View Details]  [Filter Similar]  [Export Row]                     │
│                                                                     │
│  Showing 1-5 of 1,247 matching records    [< 1 2 3 ... 250 >]     │
└─────────────────────────────────────────────────────────────────────┘
```

### Notification Center
```
┌─────────────────────────────────────────────────────────────────────┐
│  Notifications                                          [Mark All ✓]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TODAY                                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🔔                                                    [•••]  │   │
│  │ Task Assigned: "Review Q1 Report"                            │   │
│  │ From: Sarah Jones        2 hours ago                          │   │
│  │ [View Task]  [Dismiss]                                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 📢                                                    [•••]  │   │
│  │ System Maintenance Scheduled                                  │   │
│  │ Saturday, Feb 20, 2:00 AM - 4:00 AM                          │   │
│  │ [Learn More]  [Dismiss]                                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  YESTERDAY                                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ✅                                                    [•••]  │   │
│  │ Leave Request Approved                                        │   │
│  │ Approved by: Mike Ross                                          │   │
│  │ [View Details]  [Dismiss]                                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [View All Notifications]  [Settings]                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Security & Access Control

### Security Architecture

**Defense in Depth:**
1. **Perimeter:** WAF, DDoS protection, rate limiting
2. **Network:** TLS 1.3, network segmentation
3. **Application:** Input validation, parameterized queries, CSRF protection
4. **Authentication:** Strong passwords, MFA, session management
5. **Authorization:** RBAC, ABAC, principle of least privilege
6. **Data:** Encryption at rest (AES-256), encryption in transit
7. **Audit:** Comprehensive logging, anomaly detection

### Session Security

**Session Management:**
- Secure, httpOnly, SameSite cookies
- Session timeout (configurable, default: 8 hours)
- Concurrent session limits per user
- Session invalidation on logout
- Force logout capability (admin)

**Token Handling:**
- JWT with short expiration (15 minutes)
- Refresh token rotation
- Token binding to device fingerprint
- Secure storage in browser

### Data Protection

**Encryption:**
- At Rest: Database encryption (AES-256)
- In Transit: TLS 1.3 minimum
- Field-level: Sensitive data (PII) encrypted
- Keys: Managed in secure vault

**Data Handling:**
- Input sanitization
- Output encoding
- File upload validation
- SQL injection prevention (ORM)
- XSS prevention (CSP, output encoding)

---

## Integration Points

### Outbound Events (Core Platform Publishes)
| Event | Trigger | Subscribers |
|-------|---------|-------------|
| `auth.login.success` | User logs in | Audit log, Security monitoring |
| `auth.login.failure` | Failed login | Security alerts, Account lockout |
| `auth.logout` | User logs out | Session cleanup |
| `auth.password.changed` | Password update | Security notification |
| `user.created` | New user | All modules (user provisioning) |
| `user.updated` | Profile change | HR, related modules |
| `user.disabled` | Account disabled | All modules (access revocation) |
| `role.assigned` | Role granted | Module access updates |
| `role.revoked` | Role removed | Access cleanup |
| `audit.critical` | Critical action | Security officer, SIEM |

### Inbound Events (Core Platform Consumes)
| Event | Source | Action |
|-------|--------|--------|
| `hr.employee.hired` | HR | Auto-create user account |
| `hr.employee.terminated` | HR | Disable account, revoke access |
| `hr.employee.transferred` | HR | Update department/roles |
| `finance.period.closed` | Finance | Compliance timestamp |
| `audit.finding.critical` | Audit | Security alert escalation |

### External Integrations
| System | Type | Purpose |
|--------|------|---------|
| Identity Provider (Keycloak) | SSO/SAML | Authentication, user federation |
| SIEM (Splunk/QRadar) | Syslog/CEF | Security event aggregation |
| MDM (Intune/JAMF) | API | Device compliance checking |
| HRIS (Workday/ADP) | API | User provisioning sync |
| Directory (Active Directory) | LDAP | User/group sync |
| Monitoring (Prometheus/Grafana) | API | System health metrics |

---

## System Administration

### Admin Dashboard

**System Health:**
- Service status (all green/yellow/red)
- Resource utilization (CPU, memory, disk)
- Active sessions count
- Recent errors/exceptions
- Queue depths (event bus, notifications)

**User Statistics:**
- Active users (today/this week/this month)
- Login success/failure rates
- New user registrations
- Access request volume
- Session duration averages

**Audit Summary:**
- Total events today
- Failed login attempts
- Permission changes
- Critical actions logged
- Compliance report generation

### Maintenance Operations

**User Management:**
- Bulk user import/export
- Password reset campaigns
- MFA enrollment drives
- Access recertification
- Orphaned account cleanup

**System Maintenance:**
- Log archival and retention
- Database optimization
- Cache clearing
- Index rebuilding
- Backup verification

---

*Documentation Version: 1.0*  
*Module Version: 1.0*  
*Last Updated: February 2026*

---

## Database Schema

### Core Platform Tables

**Users Table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  department_id UUID REFERENCES departments(id),
  position VARCHAR(100),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret VARCHAR(255),
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Roles Table:**
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Permissions Table:**
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  module VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  category VARCHAR(20) NOT NULL
);
```

**Role Permissions Junction:**
```sql
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
```

**User Roles Junction:**
```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, role_id)
);
```

**Organizations Table:**
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  domain VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'UTC',
  currency VARCHAR(3) DEFAULT 'USD',
  language VARCHAR(10) DEFAULT 'en',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Departments Table:**
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  parent_id UUID REFERENCES departments(id),
  manager_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes and Performance

```sql
-- User Authentication Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_department ON users(department_id);

-- RBAC Performance Indexes
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_permissions_module ON permissions(module, resource, action);

-- Audit Performance Indexes
CREATE INDEX idx_audit_logs_timestamp_user ON audit_logs(timestamp, user_id);
CREATE INDEX idx_audit_logs_action_resource ON audit_logs(action, resource);
CREATE INDEX idx_audit_logs_compliance ON audit_logs USING GIN(compliance);
```

---

## Deployment Configuration

### Docker Compose Setup

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  # Core API Gateway
  api-gateway:
    image: blih/core-api:1.0
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/blih_core
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - postgres
      - redis
      - rabbitmq
    networks:
      - blih-network

  # Authentication Service
  auth-service:
    image: blih/auth-service:1.0
    environment:
      - KEYCLOAK_URL=http://keycloak:8080
      - JWT_SECRET=${JWT_SECRET}
      - MFA_ISSUER=BLIH
    depends_on:
      - keycloak
    networks:
      - blih-network

  # PostgreSQL Database
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=blih_core
      - POSTGRES_USER=blih_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - blih-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - blih-network

  # RabbitMQ Message Broker
  rabbitmq:
    image: rabbitmq:3.12-management
    environment:
      - RABBITMQ_DEFAULT_USER=blih_user
      - RABBITMQ_DEFAULT_PASS=${RABBITMQ_PASSWORD}
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    ports:
      - "15672:15672"  # Management UI
    networks:
      - blih-network

  # Keycloak SSO
  keycloak:
    image: quay.io/keycloak/keycloak:22.0
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_PASSWORD}
      - DB_VENDOR=postgres
      - DB_ADDR=postgres
      - DB_DATABASE=blih_core
      - DB_USER=blih_user
      - DB_PASSWORD=${DB_PASSWORD}
    depends_on:
      - postgres
    ports:
      - "8080:8080"
    networks:
      - blih-network

  # Elasticsearch for Audit Logs
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    volumes:
      - es_data:/usr/share/elasticsearch/data
    networks:
      - blih-network

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
  es_data:

networks:
  blih-network:
    driver: bridge
```

### Environment Configuration

**.env.example:**
```bash
# Database Configuration
DB_PASSWORD=your_secure_db_password
DATABASE_URL=postgresql://blih_user:your_secure_db_password@postgres:5432/blih_core

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_at_least_32_characters
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Redis Configuration
REDIS_URL=redis://redis:6379
REDIS_TTL=3600

# RabbitMQ Configuration
RABBITMQ_URL=amqp://blih_user:your_rabbitmq_password@rabbitmq:5672
RABBITMQ_PASSWORD=your_rabbitmq_password

# Keycloak Configuration
KEYCLOAK_PASSWORD=your_keycloak_admin_password
KEYCLOAK_URL=http://keycloak:8080

# Email Configuration
SMTP_HOST=smtp.company.com
SMTP_PORT=587
SMTP_USER=noreply@company.com
SMTP_PASSWORD=your_smtp_password

# Security Configuration
MFA_REQUIRED=true
SESSION_TIMEOUT=480
MAX_CONCURRENT_SESSIONS=3

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ADMIN_PASSWORD=your_grafana_password
```

### Kubernetes Deployment

**k8s/core-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blih-core-api
  namespace: blih
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blih-core-api
  template:
    metadata:
      labels:
        app: blih-core-api
    spec:
      containers:
      - name: core-api
        image: blih/core-api:1.0
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: blih-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: blih-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: blih-core-api-service
  namespace: blih
spec:
  selector:
    app: blih-core-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Monitoring Setup

**prometheus.yml:**
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'blih-core-api'
    static_configs:
      - targets: ['api-gateway:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'rabbitmq'
    static_configs:
      - targets: ['rabbitmq:15692']
```

### Backup Strategy

**Daily Backup Script:**
```bash
#!/bin/bash
# backup-core.sh

DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups/core"

# PostgreSQL Backup
pg_dump -h postgres -U blih_user -d blih_core > $BACKUP_DIR/postgres_$DATE.sql

# Redis Backup
redis-cli --rdb $BACKUP_DIR/redis_$DATE.rdb

# Compress Backups
gzip $BACKUP_DIR/postgres_$DATE.sql
gzip $BACKUP_DIR/redis_$DATE.rdb

# Upload to S3 (or local storage)
aws s3 cp $BACKUP_DIR/postgres_$DATE.sql.gz s3://blih-backups/core/
aws s3 cp $BACKUP_DIR/redis_$DATE.rdb.gz s3://blih-backups/core/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Health Checks

**Health Endpoint Implementation:**
```javascript
// health.controller.js
const healthCheck = async (req, res) => {
  const health = {
    status: 'HEALTHY',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    uptime: process.uptime(),
    services: {}
  };

  try {
    // Database Health
    await db.query('SELECT 1');
    health.services.database = { status: 'HEALTHY', responseTime: Date.now() - start };

    // Redis Health
    await redis.ping();
    health.services.redis = { status: 'HEALTHY', responseTime: Date.now() - start };

    // RabbitMQ Health
    await rabbitmq.checkConnection();
    health.services.rabbitmq = { status: 'HEALTHY', responseTime: Date.now() - start };

  } catch (error) {
    health.status = 'UNHEALTHY';
    health.error = error.message;
  }

  const statusCode = health.status === 'HEALTHY' ? 200 : 503;
  res.status(statusCode).json(health);
};
```

---

*Documentation Version: 1.0*  
*Module Version: 1.0*  
*Last Updated: February 2026*
