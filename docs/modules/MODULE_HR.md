# BLIH HR Module - Feature & User Experience Documentation

**Module:** BLIH Team (Human Resources)  
**Version:** 1.0  
**Last Updated:** February 2026  
**Status:** Production Ready

---

## Table of Contents

1. [Module Overview](#module-overview)
2. [User Personas](#user-personas)
3. [Feature Catalog](#feature-catalog)
4. [User Experience Flows](#user-experience-flows)
5. [UI Components & Patterns](#ui-components--patterns)
6. [Permissions & Access Control](#permissions--access-control)
7. [Integration Points](#integration-points)

---

## Module Overview

### Purpose

The BLIH HR Module ("BLIH Team") provides end-to-end employee lifecycle management, from recruitment through offboarding, with integrated performance tracking, training management, and compliance documentation.

### Value Proposition

- **Reduce HR Administrative Overhead:** Automate onboarding checklists, leave calculations, and document management
- **Ensure Compliance:** Built-in audit trails for all personnel actions with ISO 9001/27001 evidence generation
- **Improve Employee Experience:** Self-service portal for employees to manage their information, requests, and development
- **Data-Driven Decisions:** Analytics on headcount, turnover, performance trends, and training compliance

### Target Users

| Role               | Primary Use Case                        | Key Features Used                                   |
| ------------------ | --------------------------------------- | --------------------------------------------------- |
| HR Manager         | Full employee lifecycle management      | All features, reports, admin functions              |
| Line Manager       | Team oversight, approvals               | Employee view, leave approvals, performance reviews |
| Employee           | Self-service                            | Profile management, leave requests, training        |
| CFO/Finance        | Payroll integration, headcount planning | Reports, employee cost data                         |
| Compliance Officer | Audit evidence                          | Audit logs, policy acknowledgments                  |

---

## User Personas

### Persona 1: Sarah - HR Manager

**Profile:** 8 years HR experience, manages 200+ employee company, reports to CEO  
**Goals:**

- Reduce time spent on administrative tasks
- Ensure 100% compliance with labor regulations
- Improve employee satisfaction scores
- Generate accurate reports for leadership

**Pain Points:**

- Manual onboarding paperwork takes 3+ hours per hire
- Tracking training compliance across departments is difficult
- Leave balance calculations are error-prone
- Difficulty finding historical employee data

**How BLIH Helps:**

- Digital onboarding reduces time to 30 minutes
- Automated training reminders and compliance dashboards
- Real-time leave balance calculations
- Searchable employee history with full audit trail

### Persona 2: Michael - Engineering Manager

**Profile:** Manages team of 12 developers, technical background, limited HR experience  
**Goals:**

- Quickly approve team requests without HR bottlenecks
- Track team skills and development needs
- Manage team capacity for project planning

**Pain Points:**

- Don't know leave balances of team members
- Slow approval processes delay project timelines
- No visibility into team training gaps

**How BLIH Helps:**

- Mobile-friendly approval interface
- Team dashboard with leave calendar and skill matrix
- Automated reminders for pending actions

### Persona 3: Amina - New Employee

**Profile:** Recently hired software developer, first week on the job  
**Goals:**

- Complete onboarding quickly
- Understand company policies and benefits
- Set up direct deposit and benefits

**Pain Points:**

- Information scattered across emails and documents
- Unclear who to ask for help
- Don't know if tasks are completed

**How BLIH Helps:**

- Interactive onboarding checklist with progress tracking
- AI chatbot answers common questions 24/7
- Digital document signing and submission

---

## Feature Catalog

### 1. Employee Management

#### 1.1 Employee Directory

**Feature:** Centralized employee database with search and filtering  
**User Value:** Find any employee quickly with advanced search capabilities

**Capabilities:**

- Grid/list view toggle
- Advanced filters: department, role, status, hire date range, location
- Quick search by name, email, employee ID
- Export to CSV/PDF
- Org chart visualization
- Profile photos and contact cards

**UX Highlights:**

- Search-as-you-type with instant results
- Save frequent filter combinations as "Views"
- Bulk actions for mass updates (HR Admin only)
- Hover cards showing key info without clicking

#### 1.2 Employee Profile

**Feature:** Comprehensive employee record with lifecycle timeline  
**User Value:** Single source of truth for all employee information

**Profile Sections:**

- **Personal Info:** Name, contact, emergency contacts, addresses
- **Employment:** Position, department, manager, employment type, dates
- **Compensation:** Salary history, benefits, bonuses (role-restricted)
- **Documents:** Contracts, certifications, visas, ID documents
- **Performance:** Reviews, goals, 360 feedback
- **Development:** Training history, skills, career path
- **Time:** Leave balances, attendance history
- **Timeline:** Visual history of all employment events

**UX Highlights:**

- Tabbed interface with role-based visibility
- Edit mode with inline validation
- Document preview and e-signature integration
- Activity feed showing recent changes

#### 1.3 Employee Lifecycle Management

**Feature:** State-driven workflow for employment status changes  
**User Value:** Standardized, compliant processes for all personnel actions

**Supported Workflows:**
| Action | Trigger | Approval Chain | Notifications |
|--------|---------|----------------|---------------|
| New Hire | HR creates record | Manager + HR | IT (account setup), Finance (payroll) |
| Promotion | Manager initiates | HR + Department Head | Employee, New Manager |
| Transfer | Manager/HR initiates | Both managers + HR | All parties |
| Leave of Absence | Employee/HR initiates | Manager + HR | Payroll, Replacement assignee |
| Termination | Manager/HR initiates | HR + Department Head + Legal | IT (access revocation), Finance |
| Rehire | HR initiates | Standard hire flow | All standard parties |

**UX Highlights:**

- Wizard-style workflow with clear steps
- Required document checklists per transition type
- Digital signature collection
- Automated task creation for IT, Facilities, Finance

### 2. Recruitment & Onboarding

#### 2.1 Applicant Tracking

**Feature:** End-to-end recruitment pipeline management  
**User Value:** Streamlined hiring with candidate ranking and collaboration

**Capabilities:**

- Job requisition workflow with approval
- Multi-channel candidate sourcing (manual entry, email, form)
- Pipeline stages: New → Screening → Interview → Offer → Hired
- Candidate scoring and ranking
- Interview scheduling with calendar integration
- Offer letter generation with e-signature
- Rejection management with templates
- Talent pool for future openings

**UX Highlights:**

- Kanban board view of candidates by stage
- Side-by-side candidate comparison
- Interview feedback forms with scoring rubrics
- Automated email templates with personalization

#### 2.2 Onboarding Portal

**Feature:** Self-service onboarding experience for new hires  
**User Value:** Faster time-to-productivity with guided setup

**Onboarding Components:**

- **Pre-boarding (Before Day 1):**
  - Welcome message from CEO/manager
  - Digital handbook and policy acknowledgment
  - Benefits enrollment
  - Direct deposit setup
  - Emergency contact collection
  - IT equipment preferences

- **First Week Tasks:**
  - Office/facilities orientation checklist
  - Security training and badge pickup
  - Meet-the-team schedule
  - System access verification

- **30/60/90 Day Checkpoints:**
  - Manager check-in forms
  - Goal setting worksheets
  - Feedback surveys

**UX Highlights:**

- Progress dashboard with completion percentage
- Gamification with achievement badges
- Mobile-optimized for completion anywhere
- AI chatbot answers "What do I do next?"

### 3. Time & Attendance

#### 3.1 Leave Management

**Feature:** Comprehensive leave tracking and request workflow  
**User Value:** Accurate balances, transparent approvals, compliance reporting

**Leave Types:**

- Annual/Vacation leave
- Sick leave
- Personal leave
- Maternity/Paternity leave
- Bereavement leave
- Unpaid leave
- Remote work days
- Custom leave types (configurable)

**Capabilities:**

- Accrual rules engine (by tenure, role, location)
- Carryover and expiration policies
- Blackout date management
- Team calendar view
- Substitution/work handover workflow
- Leave liability reporting

**UX Highlights:**

- Visual calendar with drag-to-request
- Real-time balance display
- Mobile app for quick requests
- Manager approval with 1-click actions
- Conflict detection (overlap, insufficient balance)

#### 3.2 Time Tracking

**Feature:** Clock-in/out and timesheet management  
**User Value:** Accurate payroll and project costing data

**Modes:**

- Web clock-in/out
- Mobile app check-in
- Manual timesheet entry
- Project-based time allocation

**Capabilities:**

- Geolocation validation (optional)
- Overtime calculation and approval
- Break tracking
- Timesheet approval workflow
- Payroll integration

**UX Highlights:**

- One-click clock buttons
- Weekly timesheet grid view
- Visual overtime indicators
- Automated reminders for missing entries

### 4. Performance Management

#### 4.1 Performance Reviews

**Feature:** Structured evaluation cycles with 360 feedback  
**User Value:** Fair, documented performance assessments

**Review Types:**

- Annual performance review
- Quarterly check-ins
- Probation evaluation
- Project-based assessment
- 360-degree feedback

**Capabilities:**

- Customizable evaluation forms
- Goal setting and tracking (OKR/SMART)
- Self-assessment + manager review
- Calibration sessions for rating consistency
- Digital signatures and acknowledgment
- Historical review comparison

**UX Highlights:**

- Progress indicator for review completion
- Rich text editor for qualitative feedback
- Rating distribution charts for managers
- Automated reminder escalations

#### 4.2 Continuous Feedback

**Feature:** Ongoing recognition and coaching notes  
**User Value:** Culture of continuous improvement

**Capabilities:**

- Real-time feedback notes (private between manager/employee)
- Public recognition feed with badges
- Coaching conversation tracking
- Development plan creation

**UX Highlights:**

- Quick "kudos" button on any employee profile
- Slack/email integration for recognition sharing
- Feedback timeline view

### 5. Training & Development

#### 5.1 Training Management

**Feature:** Course catalog, enrollment, and compliance tracking  
**User Value:** Ensured competence and regulatory compliance

**Capabilities:**

- Training catalog with categories (compliance, technical, soft skills)
- Self-enrollment and manager-assigned courses
- Due date tracking with escalation
- Certification expiration alerts
- SCORM/xAPI content support
- Training cost tracking
- Skills matrix generation

**UX Highlights:**

- Course recommendation engine (based on role/gaps)
- Learning path visualizations
- Progress bars for multi-part courses
- Mobile-friendly video playback

#### 5.2 Skills & Competencies

**Feature:** Skills inventory and gap analysis  
**User Value:** Strategic workforce planning

**Capabilities:**

- Skills taxonomy management
- Self-assessed + manager-verified ratings
- Gap analysis against role requirements
- Succession planning based on skills
- Training recommendation based on gaps

**UX Highlights:**

- Skills radar charts
- Gap visualization (current vs. required)
- "Add skill" autocomplete from taxonomy
- Team skills heatmap for managers

### 6. Compensation & Benefits

#### 6.1 Compensation Management

**Feature:** Salary structure and history tracking  
**User Value:** Fair pay practices and budget planning

**Capabilities:**

- Salary bands by role/level
- Compensation history timeline
- Bonus and variable pay tracking
- Compensation review workflow
- Pay equity analysis reports
- Market benchmark integration (optional)

**Access Control:**

- Employee: View own compensation only
- Manager: View team salaries
- HR: Full access
- Finance: View for budgeting

#### 6.2 Benefits Administration

**Feature:** Benefits enrollment and management **User Value:** Streamlined benefits selection and administration

**Capabilities:**

- Benefits catalog with costs and coverage
- Open enrollment workflow
- Life event changes (marriage, birth, etc.)
- Dependent management
- Benefits cost reporting
- Integration with insurance providers

---

## User Experience Flows

### Flow 1: New Hire Onboarding

**Scenario:** Amina joins as a new Software Developer

```
┌─────────────────────────────────────────────────────────────────┐
  DAY -7 (Offer Accepted)
  ├─ System sends welcome email with onboarding portal link
  ├─ Amina logs in, sees personalized onboarding dashboard
  ├─ Completes: Emergency contacts, direct deposit, benefits selection
  └─ Signs: Employment contract, NDA, handbook acknowledgment

  DAY 1 (First Day)
  ├─ Amina arrives, badge ready at reception
  ├─ Dashboard shows: "Meet your buddy: John" at 9:00 AM
  ├─ IT check-in: Laptop setup verified via checklist
  ├─ Lunch with team automatically scheduled
  └─ EOD: Manager check-in form pops up

  DAY 3
  ├─ Security training video assigned
  ├─ Code repository access granted (auto-provisioned)
  └─ "First Week Survey" appears

  DAY 30
  ├─ 30-day review meeting scheduled
  ├─ Goal setting worksheet due
  └─ AI Chatbot prompts: "How is your onboarding going?"
```

**UX Success Metrics:**

- Time to complete pre-boarding: < 1 hour
- Day 1 "ready to work" score: > 90%
- 30-day retention: > 95%

### Flow 2: Leave Request & Approval

**Scenario:** Michael (Manager) reviews Amina's vacation request

```
1. Amina opens HR module → My Time → Request Leave
2. Calendar view shows: Green (available), Red (blackout), Yellow (team members out)
3. Amina selects dates: Aug 15-19
4. System calculates: 32 hours requested, 88 hours remaining after approval
5. Amina adds: "Visiting family, will be available for emergencies"
6. Submit → Notification to Michael (mobile push + email)

[Michael's Experience]
7. Michael receives notification with one-tap approve/decline
8. Opens full view: Team calendar, coverage analysis
9. Sees: David is also out that week → potential gap
10. Michael comments: "Approved, please brief David on your project status"
11. Approval updates: Amina's calendar, Payroll, Project resource plan
12. Confirmation to Amina with approved dates

[Escalation Path]
If Michael doesn't respond in 48 hours → Escalates to Department Head
If coverage gap detected → Suggests alternative dates
```

**UX Success Metrics:**

- Request submission time: < 2 minutes
- Manager approval time: < 5 minutes (mobile)
- Approval accuracy: > 99%

### Flow 3: Performance Review Cycle

**Scenario:** Annual review for Michael's team

```
PHASE 1: Goal Setting (Quarter 1)
├─ Michael creates team goals aligned to company OKRs
├─ Each employee adds personal development goals
├─ System tracks goal progress throughout year
└─ Notifications for off-track goals

PHASE 2: Self-Assessment (November)
├─ Employees receive notification: "Annual review open"
├─ Form pre-fills with: Goals progress, 360 feedback received, Achievements
├─ Employee completes: Self-rating, accomplishments, development needs
└─ Submission locks form, notifies manager

PHASE 3: Manager Review (December)
├─ Michael reviews all submissions with side-by-side comparison
├─ Calibration meeting with other managers (rating distribution tool)
├─ Completes: Performance rating, compensation recommendation
├─ Schedule 1:1 meeting with each employee
└─ Finalizes reviews

PHASE 4: 1:1 Meetings (January)
├─ Meeting opens with: Goal achievement summary
├─ Discussion guide: Strengths, growth areas, career aspirations
├─ Employee acknowledges review via digital signature
└─ Development plan created with milestones
```

**UX Success Metrics:**

- Review completion rate: > 95%
- Manager time per review: < 45 minutes
- Employee satisfaction with process: > 4.2/5

### Flow 4: HR Analytics Dashboard

**Scenario:** Sarah (HR Manager) presents quarterly report to CEO

```
Dashboard Layout:
┌─────────────────────────────────────────────────────────────┐
│  HEADLINE METRICS                    [Date Range Selector]  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │ Headcount  │ │ Open Roles │ │ Turnover   │              │
│  │  247  ↑5%  │ │   12  ↑3   │ │  8%  ↓2%   │              │
│  └────────────┘ └────────────┘ └────────────┘              │
│                                                             │
│  VISUALIZATIONS                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Headcount Trend  │  │ Department Break   │               │
│  │ [Line Chart]     │  │ [Donut Chart]      │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ALERTS & ACTIONS                                           │
│  ⚠️ 3 contracts expire this month                           │
│  ⚠️ 5 employees overdue for training                        │
│  ⚠️ 2 leave requests pending > 5 days                       │
│                                                             │
│  QUICK ACTIONS                                              │
│  [Export Report] [Schedule Review] [Send Reminders]         │
└─────────────────────────────────────────────────────────────┘

Drill-Down Capabilities:
- Click any metric → Detailed breakdown
- Filter by: Department, Tenure, Employment Type
- Compare: Current vs. Previous Period vs. Target
- Export: PDF report, Excel data, PowerPoint slides
```

---

## UI Components & Patterns

### Primary Navigation

```
┌──────────────────────────────────────────────────────────────┐
│  BLIH Logo    HR    CRM    Projects    Finance    Brain  [🔍][🔔][👤]
├──────────────────────────────────────────────────────────────┤
│  [Dashboard] [Directory] [Time] [Performance] [Reports]      │
└──────────────────────────────────────────────────────────────┘
```

### Employee Directory Grid

```
┌─────────────────────────────────────────────────────────────┐
│  Employees                              [+ Add] [⚙️ Filter]   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🔍 Search by name, email, role...                   │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ Status: [All ▼] Dept: [All ▼] Loc: [All ▼] [Save View]│   │
│  ├─────────────────────────────────────────────────────┤    │
│  │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │    │
│  │ │ [Photo]│ │ [Photo]│ │ [Photo]│ │ [Photo]│        │    │
│  │ │ Amina  │ │ John   │ │ Sarah  │ │ Mike   │        │    │
│  │ │ Dev    │ │ Dev    │ │ HR     │ │ Eng Mgr│        │    │
│  │ │ [🟢]   │ │ [🟡]   │ │ [🟢]   │ │ [🟢]   │        │    │
│  │ └────────┘ └────────┘ └────────┘ └────────┘        │    │
│  └─────────────────────────────────────────────────────┘    │
│  Showing 1-12 of 247    [< 1 2 3 ... 21 >]                 │
└─────────────────────────────────────────────────────────────┘
```

### Leave Calendar Widget

```
┌──────────────────────────────────────────┐
│  Team Calendar        [Today] [←] [→]    │
├──────────────────────────────────────────┤
│     Mon   Tue   Wed   Thu   Fri          │
│      15    16    17    18    19          │
│  Amina  🌴    🌴    🌴    🌴    🌴       │
│  John   💼    💼    🏠    💼    💼       │
│  David  💼    🏥    💼    💼    💼       │
├──────────────────────────────────────────┤
│  Legend: 🌴 Vacation | 🏠 Remote | 🏥 Sick│
└──────────────────────────────────────────┘
```

### Employee Profile Card

```
┌──────────────────────────────────────────┐
│  [Photo]  Amina Mohammed                 │
│           Senior Developer               │
│           Engineering Dept               │
│           📧 amina@company.com           │
│           📱 +1-555-0123                 │
│                                          │
│  Quick Stats:                            │
│  • Started: Jan 15, 2026                 │
│  • Leave Balance: 88 hours               │
│  • Next Review: Dec 2026                │
│  • Manager: Michael Chen                 │
│                                          │
│  [View Full Profile] [📅 Schedule 1:1]  │
└──────────────────────────────────────────┘
```

---

## Permissions & Access Control

### Permission Matrix

| Feature               | Employee | Manager   | HR Admin | Finance | Executive |
| --------------------- | -------- | --------- | -------- | ------- | --------- |
| View Own Profile      | ✅       | ✅        | ✅       | ✅      | ✅        |
| Edit Own Profile      | ✅       | ✅        | ✅       | ✅      | ✅        |
| View Team Directory   | ❌       | ✅        | ✅       | ✅      | ✅        |
| View All Employees    | ❌       | ❌        | ✅       | ❌      | ✅        |
| View Salaries         | Own only | Team only | ✅       | ✅      | ✅        |
| Edit Employee Records | Own only | ❌        | ✅       | ❌      | ❌        |
| Approve Leave         | Own only | Team      | ✅       | ❌      | ❌        |
| Run Reports           | ❌       | Team      | ✅       | ✅      | ✅        |
| Export Data           | ❌       | ❌        | ✅       | ✅      | ✅        |
| Admin Settings        | ❌       | ❌        | ✅       | ❌      | ✅        |

### Granular Permissions (RBAC)

HR module permissions follow the pattern: `HR:{resource}:{action}`

| Permission Code         | Description                              |
| ----------------------- | ---------------------------------------- |
| `HR:employee:view`      | View employee directory and profiles     |
| `HR:employee:create`    | Create new employee records              |
| `HR:employee:edit`      | Edit existing employee data              |
| `HR:employee:delete`    | Terminate/deactivate employees           |
| `HR:leave:request`      | Submit leave requests                    |
| `HR:leave:approve`      | Approve team leave requests              |
| `HR:leave:admin`        | Override leave balances, manage policies |
| `HR:payroll:view`       | View compensation data                   |
| `HR:payroll:process`    | Run payroll calculations                 |
| `HR:report:view`        | Access standard reports                  |
| `HR:report:export`      | Export data for external analysis        |
| `HR:training:assign`    | Assign training to employees             |
| `HR:training:complete`  | Mark training completion                 |
| `HR:performance:review` | Conduct performance reviews              |
| `HR:onboard:manage`     | Manage onboarding workflows              |

---

## Integration Points

### Outbound Events (HR Publishes)

| Event                    | Payload                               | Subscribers                                                          |
| ------------------------ | ------------------------------------- | -------------------------------------------------------------------- |
| `hr.employee.hired`      | Employee ID, department, start date   | Finance (payroll setup), IT (account creation), Brain (decision log) |
| `hr.employee.terminated` | Employee ID, termination date, reason | Finance (final pay), IT (access revocation), Projects (reassignment) |
| `hr.leave.approved`      | Employee ID, dates, type              | Projects (resource adjustment), Calendar (blocking)                  |
| `hr.payroll.processed`   | Period, summary totals                | Finance (GL posting), Brain (cost analysis)                          |
| `hr.training.completed`  | Employee ID, course, certification    | Brain (skills update), Manager (notification)                        |

### Inbound Events (HR Consumes)

| Event                        | Source   | Action                                                     |
| ---------------------------- | -------- | ---------------------------------------------------------- |
| `finance.payroll.error`      | Finance  | Notify HR to investigate discrepancy                       |
| `project.assignment.changed` | Projects | Update employee's project allocation                       |
| `crm.deal.won`               | CRM      | Trigger headcount planning alert if team capacity exceeded |
| `auth.password.reset`        | Core     | Log security event, notify manager                         |

### API Integrations

| System                    | Integration Type | Data Exchanged                            |
| ------------------------- | ---------------- | ----------------------------------------- |
| Keycloak                  | SSO/SCIM         | User authentication, profile sync         |
| Payroll Provider          | REST API         | Employee data, timesheets, pay results    |
| Benefits Provider         | REST API         | Enrollment, changes, confirmations        |
| Calendar (Google/Outlook) | CalDAV/Graph     | Leave blocking, meeting scheduling        |
| Slack/Teams               | Webhook          | Notifications, bot commands               |
| Learning Management       | LTI/xAPI         | Course assignments, progress, completions |

---

## Mobile Experience

### Mobile App Features

- Clock in/out with geolocation
- Leave requests and approvals
- Team directory with click-to-call
- Notification center
- Offline mode with sync

### Responsive Design Breakpoints

| Device              | Layout                              |
| ------------------- | ----------------------------------- |
| Desktop (>1280px)   | Full sidebar + 3-column grid        |
| Tablet (768-1280px) | Collapsible sidebar + 2-column grid |
| Mobile (<768px)     | Bottom navigation + single column   |

---

_Documentation Version: 1.0_  
_Module Version: 1.0_  
_Last Updated: February 2026_
