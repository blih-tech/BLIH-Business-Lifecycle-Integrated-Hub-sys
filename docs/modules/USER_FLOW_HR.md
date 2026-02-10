# BLIH HR Module - User Flow & UX Documentation

**Purpose:** Clear, actionable user experience guide for HR module  
**Audience:** Designers, Developers, Product Managers  
**Version:** 2.0 | February 2026  
**Alignment:** Based on MODULE_HR_COMPLETE.md (50 forms across 8 sub-systems)

---

## 1. User Personas

| Persona | Role | Primary Goals | Tech Comfort |
|---------|------|---------------|--------------|
| **Alex** | Employee | View payslip, request leave, update profile | Medium |
| **Sarah** | Team Lead | Approve requests, view team, conduct reviews | Medium-High |
| **Michael** | HR Manager | Process hiring, manage records, run reports | High |
| **David** | CEO | View dashboards, approve decisions, insights | Medium |

---

## 2. Core User Flows

**Structure Overview:** This documentation covers 22 primary user flows aligned with the 8 HR sub-systems documented in MODULE_HR_COMPLETE.md. Each flow represents a complete user journey from initiation to completion, with detailed UX considerations and screen designs.

### Sub-System Mapping:
- **Sub-System 1: Recruitment & Hiring** (Flows 1-5)
- **Sub-System 2: Onboarding & Probation** (Flows 7-8)
- **Sub-System 3: Employee Profiles & Records** (Flow 9)
- **Sub-System 4: Attendance, Leave & Time Management** (Flows 6, 16-17, 21-22)
- **Sub-System 5: Performance, OKRs & Career Development** (Flows 10-11, 18-20)
- **Sub-System 6: Training & Skill Development** (Flow 12)
- **Sub-System 7: Employee Relations** (Flows 13-14)
- **Sub-System 8: Exit, Offboarding & Compliance** (Flow 15)

---

### Flow 1: Recruitment Request (Team Lead)

```
Team Dashboard → Click "Request Hiring" → Fill Position Details → Set Budget 
→ Submit for Approval → Finance Review → CEO Approval → HR Processing
```

**Key Screens:**
1. **Request Initiation** - Team, Job Name, Supervisor, Type (New/Replacement)
2. **Rationale** - Hiring Motivation, Role Overview, Organizational Impact
3. **Staffing & Financials** - Current vs. Needed Staff, Salary Bracket, Perks
4. **Schedule** - Target Join Date, Priority Level
5. **Approval Chain** - Finance → Executive Director → HR with status tracking

**UX Principles:**
- Budget availability check in real-time
- Auto-populate from similar positions
- Show approval timeline
- Link to organizational chart

---

### Flow 2: Job Posting Creation (HR)

```
Recruitment Dashboard → Select Approved Request → Create Job Post 
→ Fill Description → Set Requirements → Choose Distribution → Publish
```

**Key Screens:**
1. **Request Import** - Auto-populate from approved recruitment request
2. **Position Details** - Title, Department, Work Type, Work Mode
3. **Description Builder** - Rich text editor with templates
4. **Requirements** - Education, Experience, Skills (tag-based)
5. **Distribution** - Career site, LinkedIn, Telegram, Internal boards
6. **Preview & Publish** - Live preview with analytics tracking

**UX Principles:**
- Template library for common roles
- SEO optimization suggestions
- Multi-platform preview
- Auto-save drafts every 30 seconds

---

### Flow 3: Job Application (Candidate)

```
Job Ad → Click "Apply Now" → Fill Application Form → Upload Resume 
→ Answer Role Questions → Submit → Confirmation & Tracking
```

**Key Screens:**
1. **Job Preview** - Position details with "Apply Now" CTA
2. **Application Form** - Personal info, career data, role-specific questions
3. **Document Upload** - Resume, portfolio, certificates (drag-drop)
4. **Role Questions** - Experience, BLIH knowledge, salary expectations
5. **Confirmation** - Application ID, next steps, timeline

**UX Principles:**
- Progressive disclosure (sections expand as user completes)
- Auto-save to prevent data loss
- Mobile-optimized form
- Real-time validation

---

### Flow 4: CV Screening & Interview Scheduling (HR + Hiring Manager)

```
Applications Inbox → Review CVs → Score Candidates → Select for Interview 
→ Schedule Interviews → Send Invites → Collect Feedback
```

**Key Screens:**
1. **Applications Dashboard** - Filter by role, status, ratings
2. **CV Viewer** - Side-by-side: Original PDF | Parsed data | Score breakdown
3. **Scoring Panel** - 5 criteria: Qualifications, Background, Technical, Fit, Expression
4. **Interview Scheduler** - Calendar integration, room booking, automated invites
5. **Feedback Collection** - Standardized rating form with comments

**UX Principles:**
- AI-powered CV parsing and scoring
- Bulk actions for multiple candidates
- Calendar conflict detection
- Anonymous review option

---

### Flow 5: Hiring Decision & Offer (HR + Leadership)

```
Interview Complete → Review Feedback → Compare Candidates 
→ Select Finalist → Prepare Offer → Finance Approval → CEO Approval → Send Offer
```

**Key Screens:**
1. **Candidate Comparison** - Side-by-side comparison of top 3 candidates
2. **Offer Builder** - Salary, benefits, start date, terms
3. **Budget Check** - Real-time budget availability and approval
4. **Offer Document** - Auto-generated offer letter with e-signature
5. **Candidate Communication** - Offer delivery, negotiation tracking

**UX Principles:**
- Visual candidate ranking
- Real-time budget validation
- Template-based offer generation
- Communication timeline tracking

---

### Flow 6: Leave Request (Employee)

```
Dashboard → Click "Request Leave" → Select Type/Dates → Add Reason 
→ Review → Submit → See Confirmation → Track Status
```

**Key Screens:**
1. **Dashboard** - Quick action card "Request Leave" with balance preview
2. **Form** - Calendar picker, leave type dropdown, reason textarea
3. **Review** - Summary card with days, balance after request
4. **Confirmation** - Success toast + "View My Requests" button
5. **Tracking** - Status badge (Pending → Approved), approver name

**UX Principles:**
- Show leave balance before and after
- Calendar highlights weekends/holidays
- Auto-calculate days on date selection
- Mobile-optimized (big touch targets)

---

### Flow 20: Salary Adjustment & Compensation Review (HR + Finance)

```
Performance Review Complete → Identify Adjustment Need 
→ Prepare Justification → Finance Review → CEO Approval → Update Profile
```

**Key Screens:**
1. **Adjustment Request** - Current vs. proposed compensation, reason
2. **Market Analysis** - Salary benchmark data, compa-ratio calculations
3. **Budget Impact** - Annual cost, budget source, approval workflow
4. **Approval Chain** - Finance → HR → CEO with status tracking
5. **Implementation** - Update payroll, notification to employee

**UX Principles:**
- Real-time market data integration
- Budget impact visualization
- Clear approval timeline
- Automated payroll updates

---

### Flow 21: Leave Approval (Manager)

```
Notification → Click → Review Details → Approve/Reject → Add Comment 
→ Confirmation
```

**Key Screens:**
1. **Notification** - Email/push: "Alex requests 3 days annual leave"
2. **Approval Card** - Employee photo, dates, reason, team coverage
3. **Action** - Green "Approve" / Red "Reject" buttons
4. **Comment** - Optional text field
5. **Confirmation** - Toast + next pending item

**UX Principles:**
- One-click approve from notification
- Show team calendar (who else is off)
- Bulk approve option for multiple requests
- Swipe gestures on mobile

---

### Flow 22: Overtime Request & Approval (Employee + Manager)

```
Project Dashboard → Click "Request Overtime" → Select Dates/Hours 
→ Justify Need → Manager Approval → Finance Budget Check → Approval
```

**Key Screens:**
1. **OT Request Form** - Date, expected hours, project, task, reason
2. **Budget Check** - Remaining OT budget, approval status
3. **Manager Review** - Workload assessment, business justification
4. **Finance Approval** - Budget validation, cost impact analysis
5. **Time Tracking** - Auto-update timesheet with approved OT

**UX Principles:**
- Real-time budget availability
- Project impact visualization
- Automated timesheet integration
- Mobile request approval

---

### Flow 10: Performance Review (Employee + Manager)

```
Review Period Opens → Self-Assessment → Manager Review → 1-on-1 Meeting 
→ Finalize → Sign → Archive
```

**Key Screens:**
1. **Review Dashboard** - "Your review is due" banner, progress steps
2. **Self-Assessment** - Goal ratings sliders, achievement textareas
3. **Manager Review** - View employee input, add manager ratings
4. **1-on-1** - Shared agenda, notes capture
5. **Finalize** - Side-by-side comparison, signature fields

**UX Principles:**
- Progress stepper (1-2-3-4-5)
- Rich text for qualitative feedback
- Goal linkage (pull from KPI plan)
- Offline save (don't lose work)

---

### Flow 18: Career Development & Promotion (Employee + Manager)

```
Performance Review Complete → Discuss Career Goals 
→ Create Development Plan → Track Progress → Promotion Request → Approval
```

**Key Screens:**
1. **Career Planning** - Target role, timeline, motivation
2. **Skills Gap Analysis** - Current vs. required skills assessment
3. **Development Actions** - Training, mentoring, stretch assignments
4. **Progress Tracking** - Milestone achievements, skill improvements
5. **Promotion Request** - Justification, business case, approval workflow

**UX Principles:**
- Visual career path mapping
- Skill gap visualization
- Progress milestone tracking
- Clear promotion criteria

---

### Flow 19: Internal Transfer Request (Employee)

```
Career Dashboard → Click "Request Transfer" → Select Target Role 
→ Complete Justification → Current Manager Approval → Target Manager Review → HR Processing
```

**Key Screens:**
1. **Transfer Request** - Current position, target role, reason for move
2. **Skills Match** - Current skills vs. target role requirements
3. **Impact Analysis** - Team impact, business justification
4. **Approval Workflow** - Current manager → Target manager → HR → CEO
5. **Transition Plan** - Handover timeline, knowledge transfer schedule

**UX Principles:**
- Skills compatibility scoring
- Impact visualization for both teams
- Clear approval timeline
- Structured transition planning

---

### Flow 16: Timesheet Entry (Employee)

```
Time & Leave → Click "Timesheet" → Select Week → Add Daily Hours 
→ Assign to Projects → Review Totals → Submit for Approval
```

**Key Screens:**
1. **Timesheet Grid** - Week view, daily hours input cells
2. **Project Selection** - Dropdown per day, multiple projects supported
3. **Overtime Alerts** - Visual indicator when >8 hours/day or >40 hours/week
4. **Review Summary** - Total regular hours, overtime, project breakdown
5. **Submit** - Confirmation modal with totals

**UX Principles:**
- Copy previous week's pattern
- Smart defaults (same project as yesterday)
- Bulk edit (select multiple days)
- Mobile-optimized grid with swipe navigation

---

### Flow 17: Clock In/Out with Geo-Tracking (Employee)

```
Dashboard → Click "Clock In" → Confirm Location → Working... 
→ Click "Clock Out" → Confirm → View Day Summary
```

**Key Screens:**
1. **Clock Button** - Large green "CLOCK IN" or red "CLOCK OUT" button
2. **Location Map** - Mini map showing detected location vs. office
3. **Status Bar** - "Clocked in at 8:30 AM • 4h 30m elapsed"
4. **Break Logger** - "Start Break" / "End Break" quick buttons
5. **Day Summary** - Hours worked, breaks, overtime calculation

**UX Principles:**
- One-tap clock action
- Offline support (sync when connected)
- Location tolerance (within 100m of office)
- Biometric option (fingerprint/face)

---

### Flow 11: OKR Creation & Alignment (Manager + Employee)

```
Performance → OKRs → Click "New OKR" → Define Objective 
→ Add Key Results (3-5) → Set Targets → Align to Parent OKR → Submit
```

**Key Screens:**
1. **Objective Card** - Title input, description, priority dropdown
2. **Key Results Builder** - Each KR: title, type (numeric/percentage/boolean), target, current
3. **Alignment Tree** - Visual tree showing parent OKR, sibling OKRs
4. **Contributor Assignment** - Who's working on this OKR, percentage contribution
5. **Progress Dashboard** - Update slider, status badge (On Track/At Risk/Delayed)

**UX Principles:**
- OKR templates by role
- Progress visualization (progress bars, sparklines)
- Cascade view (see how team OKRs roll up to company OKRs)
- Update reminders (weekly nudge)

---

### Flow 12: Training Request & Development (Employee + Manager)

```
Learning → My Training → "Request Training" → Search/Select Course 
→ Fill Justification → Set Preferred Dates → Submit → Manager Approves
```

**Key Screens:**
1. **Training Catalog** - Search, filter by category, skill gap highlighting
2. **Request Form** - Course details, cost auto-populated, justification textarea
3. **Skill Gap Link** - "This addresses: Leadership Skills (gap of 2 levels)"
4. **Budget Preview** - "Remaining team training budget: ETB 45,000"
5. **Approval Status** - Timeline view showing manager and HR approval stages

**UX Principles:**
- Skill gap visualization in profile
- ROI calculator (cost vs. skill improvement)
- Prerequisite warnings
- Post-training feedback prompt (7 days after completion)

---

### Flow 13: Employee Recognition & Awards (All Employees)

```
Employee Relations → Recognition → "Nominate Colleague" → Select Employee 
→ Choose Award Type → Write Justification → Submit → Approval Chain
```

**Key Screens:**
1. **Nominee Search** - Employee lookup with recent collaboration highlights
2. **Award Categories** - Star Performer, Innovation, Collaboration, Customer Excellence
3. **Justification Form** - Specific contributions, impact quantification
4. **Evidence Upload** - Screenshots, email threads, project links
5. **Approval Tracker** - Supervisor → HR → CEO approval chain with status

**UX Principles:**
- Peer suggestions ("Who helped you this week?")
- Public recognition feed (opt-in)
- Badge display on employee profile
- Monthly award ceremony integration

---

### Flow 14: Employee Surveys & Feedback (All Employees)

```
Notification → "New Pulse Survey" → Answer Questions (1-5 scale) 
→ Optional Comments → Submit → See Aggregate Results (anonymized)
```

**Key Screens:**
1. **Survey Card** - Progress bar (Question 3 of 12), estimated time
2. **Rating Slider** - 1-5 scale with labels (Strongly Disagree to Strongly Agree)
3. **Comment Box** - Optional elaboration per question
4. **Results Dashboard** - Team/company averages after survey closes
5. **Action Plan** - "You said: X. We're doing: Y" follow-up

**UX Principles:**
- Anonymous by default
- Mobile-optimized (one question per screen option)
- Save and resume
- Results transparency commitment

---

### Flow 15: Resignation & Exit Process (Employee + HR)

```
Employee: Profile → "Initiate Resignation" → Select Last Day → Give Reason 
→ Submit Notice → Complete Handover → Exit Interview

HR: Receive Notice → Initiate Offboarding → Assign Tasks 
→ Monitor Progress → Conduct Exit Interview → Final Settlement
```

**Key Screens:**
1. **Notice Form** - Last working day picker (enforce notice period), reason category
2. **Handover Plan** - Task list: documents, access transfer, knowledge sessions
3. **Offboarding Dashboard** - HR view: task matrix (HR/IT/Admin/Finance)
4. **Exit Interview** - Structured questions, satisfaction ratings, open feedback
5. **Settlement Summary** - Leave encashment, final pay, deductions breakdown

**UX Principles:**
- Notice period calculator (auto-computed from employment date)
- Knowledge transfer session scheduler
- Asset return checklist with photo upload
- Stay-in-touch option for alumni network

---

### Flow 7: New Hire Onboarding (HR)

```
Hiring Approved → Create Onboarding Checklist → Assign Tasks 
→ Monitor Progress → Complete Verification → Activate Employee
```

**Key Screens:**
1. **Onboarding Trigger** - Auto-create from hiring approval
2. **Checklist Builder** - HR, IT, Admin, Team task categories
3. **Task Assignment** - Auto-assign based on role/department
4. **Progress Dashboard** - Real-time status across all departments
5. **Completion Verification** - Final checklists and employee activation

**UX Principles:**
- Pre-fill from hiring data (reduce typing)
- Progress bars for visual tracking
- Automated task assignment based on role
- Red alerts for overdue tasks

---

### Flow 8: Probation Management (Supervisor + HR)

```
New Hire Start → Create 60-Day KPI Plan → Day 30 Check 
→ Day 55 Review → Probation Evaluation → Confirm/Extend/Terminate
```

**Key Screens:**
1. **KPI Plan Creation** - Goal setting with metrics and timelines
2. **Progress Tracking** - Regular check-ins and milestone tracking
3. **Evaluation Form** - Performance assessment against KPIs
4. **Decision Workflow** - Confirmation, extension, or termination
5. **Documentation** - Complete probation file with signatures

**UX Principles:**
- Goal templates by role
- Automated reminders for check-ins
- Performance visualization
- Clear decision pathways

---

### Flow 9: Employee Profile Management (HR + Employee)

```
My Profile → Edit Section → Update Info → Upload Documents 
→ Review Changes → Submit for Verification → Approved
```

**Key Screens:**
1. **Profile Overview** - Photo, basic info, job details, contact info cards
2. **Section Editor** - Personal Info, Emergency Contact, Education, Skills (inline edit)
3. **Document Upload** - ID, certificates, contracts (drag-drop with preview)
4. **Change Log** - "Pending approval: Address update submitted"
5. **Verification Status** - Green checkmarks for verified fields

**UX Principles:**
- Progressive profile completion (gamification: "80% complete")
- Auto-sync with company directory
- Privacy controls (what peers can see vs. managers vs. HR)
- Bulk update option (e.g., address change affects multiple systems)

---

## 3. Navigation Structure

```
📊 Dashboard (Home)
───
👤 My Profile
├─ Personal Info
├─ Documents
├─ Compensation
└─ Activity Log
───
📅 Time & Leave
├─ My Calendar
├─ Request Leave
├─ Timesheet
└─ Attendance
───
🎯 Performance
├─ My Reviews
├─ Goals (OKRs)
└─ 1-on-1s
───
📚 Learning
├─ My Training
├─ Skills
└─ Certifications
───
💬 Employee Relations
├─ Pulse Surveys
├─ Suggestions
├─ Recognition
└─ Complaints (HR only)
───
🏢 Team (Managers only)
├─ My Team
├─ Approvals
├─ Team Calendar
└─ Reports
───
💼 HR Operations (HR only)
├─ Recruitment
├─ Employees
├─ Onboarding
├─ Payroll
├─ Time & Attendance
├─ Performance
├─ Training
├─ Employee Relations
├─ Offboarding
└─ Settings
```

### Mobile Navigation (Bottom Bar)

```
[🏠] [📅] [➕] [👤] [☰]
Home  Time Quick Profile More
           Actions
```

**Quick Actions Menu:**
- Request Leave
- Log Time
- View Payslip
- Contact HR

---

## 4. Key UI Components

### Dashboard Cards

**Employee Dashboard:**
```
┌─────────────────────────────────┐
│ 👤 Welcome, Alex!                 │
├─────────────────────────────────┤
│ 🌴 Leave Balance     📄 Payslip │
│    12 days left      View Latest │
├─────────────────────────────────┤
│ ⏰ Clock In/Out                   │
│    [ CLOCK IN ]                   │
│    Last: Today 8:30 AM            │
├─────────────────────────────────┤
│ 📋 Pending Actions (2)            │
│ • Complete self-assessment        │
│ • Acknowledge new policy          │
└─────────────────────────────────┘
```

**Manager Dashboard:**
```
┌─────────────────────────────────┐
│ 📊 Team Overview                  │
│    8 members • 3 on leave today   │
├─────────────────────────────────┤
│ ⚡ Approvals (4)                  │
│ • Alex: Annual leave              │
│ • Sarah: Expense claim            │
│ [View All]                        │
├─────────────────────────────────┤
│ 🔔 Recent Activity                │
│ • New hire Alex starts Monday     │
│ • Performance reviews due Friday  │
└─────────────────────────────────┘
```

### Form Patterns

**Standard Form Layout:**
```
┌─────────────────────────────────┐
│ Form Title                    [X]│
├─────────────────────────────────┤
│ Section 1: Basic Info             │
│ ┌─────────────┐ ┌─────────────┐   │
│ │ First Name* │ │ Last Name*  │   │
│ └─────────────┘ └─────────────┘   │
│ ┌─────────────────────────────┐   │
│ │ Email*                      │   │
│ └─────────────────────────────┘   │
├─────────────────────────────────┤
│ Section 2: Details                │
│ ┌─────────────────────────────┐   │
│ │ [Dropdown ▼] Department*    │   │
│ └─────────────────────────────┘   │
│ ┌─────────────────────────────┐   │
│ │ [Date Picker 📅] Start Date │   │
│ └─────────────────────────────┘   │
├─────────────────────────────────┤
│ [Cancel]        [Save Draft] [Submit]│
└─────────────────────────────────┘
```

**Wizard/Multi-Step Form:**
```
┌─────────────────────────────────┐
│ Step 2 of 4: Job Details          │
│ ●───●───○───○                     │
│ Personal Job Comp Review          │
├─────────────────────────────────┤
│ [Form fields...]                  │
├─────────────────────────────────┤
│ [← Back]        [Next →]          │
└─────────────────────────────────┘
```

### Status Indicators

| Status | Badge Style | Icon |
|--------|-------------|------|
| Draft | Gray, outline | 📝 |
| Pending | Yellow, solid | ⏳ |
| Approved | Green, solid | ✅ |
| Rejected | Red, solid | ❌ |
| In Progress | Blue, pulse | 🔄 |
| Completed | Green, check | ✓ |
| Overdue | Red, alert | ⚠️ |

---

## 5. Approval Workflows UI

### Approval Chain Visualization

```
┌─────────────────────────────────────────┐
│ Approval Chain                          │
├─────────────────────────────────────────┤
│                                         │
│  👤 You           👤 Sarah         👤 CEO│
│  Submitted   →   Approved    →   Pending│
│  Feb 1           Feb 1            (wait)│
│                            [Remind]     │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Timeline:                              │
│  • Feb 1, 9:00 AM - Submitted           │
│  • Feb 1, 2:00 PM - Finance approved    │
│  • Feb 2, 9:00 AM - Waiting for CEO     │
│                                         │
└─────────────────────────────────────────┘
```

### Approval Action Panel

```
┌─────────────────────────────────────────┐
│ Leave Request from Alex Johnson         │
│ Feb 5-7 (3 days) • Annual Leave         │
├─────────────────────────────────────────┤
│ Reason: Family vacation                 │
│ Team coverage: Sarah, Michael           │
│ Balance after: 9 days remaining         │
├─────────────────────────────────────────┤
│ [Add Comment...                       ] │
├─────────────────────────────────────────┤
│  [ ❌ Reject ]        [ ✅ Approve ]    │
│  [Request Changes]                      │
└─────────────────────────────────────────┘
```

---

## 6. Mobile-First Patterns

### Responsive Breakpoints

| Breakpoint | Target | Adjustments |
|------------|--------|-------------|
| < 480px | Mobile | Single column, bottom nav, swipe actions |
| 480-768px | Tablet | Two columns, sidebar collapses |
| > 768px | Desktop | Full sidebar, three-column dashboard |

### Mobile Form Optimizations

- **Large touch targets** (min 44x44px)
- **Native inputs** (date picker, dropdowns)
- **Sticky actions** (submit button at bottom)
- **Simplified flows** (fewer fields per screen)
- **Voice input** support for textareas

---

## 7. Accessibility Standards

### WCAG 2.1 AA Compliance

- **Color contrast:** 4.5:1 minimum for text
- **Focus indicators:** Visible focus rings on all interactive elements
- **Screen reader:** ARIA labels on all icons, proper heading hierarchy
- **Keyboard navigation:** Full functionality without mouse
- **Alt text:** All images and icons have descriptive text
- **Error messages:** Clear, specific, linked to fields

### Example Accessible Button
```html
<button 
  class="btn btn-primary"
  aria-label="Submit leave request for 3 days"
  tabindex="0">
  Submit Request
</button>
```

---

## 8. Notification Patterns

### Toast Notifications

```
┌─────────────────────────────────┐
│ ✅ Leave request submitted        │
│    Awaiting manager approval      │
│                    [View] [Dismiss]│
└─────────────────────────────────┘
```

### Email Notifications

**Subject:** Action Required: Alex requests 3 days leave

**Preview:**
```
Alex Johnson has requested annual leave:
• Dates: February 5-7, 2026
• Days: 3
• Reason: Family vacation

[Approve] [View Details] [Reject]
```

### In-App Notifications

```
┌─────────────────────────────────┐
│ 🔔 Notifications (3)            [X]│
├─────────────────────────────────┤
│ 👤 Alex requests leave            │
│    2 hours ago • [Approve]          │
│ ─────────────────────────────────  │
│ 📋 Your review is due Friday      │
│    1 day ago • [Complete]           │
│ ─────────────────────────────────  │
│ 📄 New payslip available          │
│    2 days ago • [View]              │
└─────────────────────────────────┘
```

---

## 9. Search & Filter Patterns

### Employee Directory

```
┌─────────────────────────────────────────┐
│ Search employees...              [🔍]  │
├─────────────────────────────────────────┤
│ [All ▼] [Any Team ▼] [Any Role ▼] [🔧]│
├─────────────────────────────────────────┤
│ 👤 Alex Johnson                       │
│    Backend Engineer • Engineering      │
│    alex.j@blih.com                     │
│ ─────────────────────────────────────  │
│ 👤 Sarah Williams                     │
│    Team Lead • Marketing               │
│    sarah.w@blih.com                    │
└─────────────────────────────────────────┘
```

### Filter Chips

```
Active filters: [Team: Engineering ✕] [Status: Active ✕] [Clear All]
```

---

## 10. Empty States

### No Data

```
┌─────────────────────────────────┐
│                                   │
│         📭                        │
│                                   │
│    No leave requests yet          │
│                                   │
│    You haven't submitted any      │
│    leave requests.                │
│                                   │
│       [Request Leave]             │
│                                   │
└─────────────────────────────────┘
```

### No Results

```
┌─────────────────────────────────┐
│                                   │
│         🔍                        │
│                                   │
│    No employees found             │
│                                   │
│    Try adjusting your filters     │
│    or search terms.               │
│                                   │
│    [Clear Filters]                │
│                                   │
└─────────────────────────────────┘
```

---

## 11. Error Handling

### Inline Validation

```
┌─────────────────────────────────┐
│ Email*                            │
│ ┌─────────────────────────────┐   │
│ │ john@example                │   │
│ └─────────────────────────────┘   │
│ ⚠️ Please enter a valid email     │
│    address                        │
└─────────────────────────────────┘
```

### Error Page

```
┌─────────────────────────────────┐
│                                   │
│         ⚠️ 404                    │
│                                   │
│    Page not found                 │
│                                   │
│    The page you're looking for    │
│    doesn't exist or was moved.    │
│                                   │
│    [Go Home]  [Contact Support]   │
│                                   │
└─────────────────────────────────┘
```

---

## 12. Quick Reference: Flow Summary Table

| Flow | Sub-System | Steps | Avg. Time | Key UX Priority |
|------|------------|-------|-----------|-----------------|
| **Recruitment Request** | 1. Recruitment & Hiring | 5 | 10 min | Budget validation, approval workflow |
| **Job Posting Creation** | 1. Recruitment & Hiring | 6 | 15 min | Templates, multi-platform preview |
| **Job Application** | 1. Recruitment & Hiring | 5 | 8 min | Progressive disclosure, mobile optimization |
| **CV Screening & Interview Scheduling** | 1. Recruitment & Hiring | 5 | 20 min | AI scoring, calendar integration |
| **Hiring Decision & Offer** | 1. Recruitment & Hiring | 5 | 30 min | Candidate comparison, budget check |
| **Leave Request** | 4. Attendance & Leave | 4 | 2 min | Speed, clarity |
| **Leave Approval** | 4. Attendance & Leave | 2 | 30 sec | One-click action |
| **New Hire Onboarding** | 2. Onboarding & Probation | 5 | 15 min | Pre-fill, guidance |
| **Probation Management** | 2. Onboarding & Probation | 5 | 45 min | Goal templates, reminders |
| **Employee Profile Management** | 3. Employee Records | 4 | 5 min | Progressive completion |
| **Performance Review** | 5. Performance & Career | 5 | 30 min | Save progress, goal linkage |
| **OKR Creation & Alignment** | 5. Performance & Career | 5 | 15 min | Alignment tree, templates |
| **Career Development & Promotion** | 5. Performance & Career | 5 | 20 min | Career path mapping, skill gap analysis |
| **Internal Transfer Request** | 5. Performance & Career | 5 | 15 min | Skills matching, impact analysis |
| **Salary Adjustment & Compensation** | 5. Performance & Career | 5 | 25 min | Market data, budget impact |
| **Training Request & Development** | 6. Training & Development | 5 | 5 min | Skill gap link, ROI |
| **Employee Recognition & Awards** | 7. Employee Relations | 4 | 5 min | Peer suggestions, public recognition |
| **Employee Surveys & Feedback** | 7. Employee Relations | 3 | 3 min | Anonymous, mobile |
| **Resignation & Exit Process** | 8. Exit & Offboarding | 5 | 10 min | Handover guidance, compliance |
| **Timesheet Entry** | 4. Attendance & Leave | 5 | 5 min | Efficiency, copy-paste |
| **Clock In/Out with Geo-Tracking** | 4. Attendance & Leave | 2 | 10 sec | One-tap, offline |
| **Overtime Request & Approval** | 4. Attendance & Leave | 5 | 8 min | Budget validation, project impact |

### Additional Supporting Flows (Not Primary)
| **Asset & Access Provisioning** | 2. Onboarding & Probation | 4 | 20 min | Auto-assignment, tracking |
| **Policy Acknowledgement** | 2. Onboarding & Probation | 3 | 5 min | Mandatory completion, records |
| **Contract Management** | 3. Employee Records | 3 | 10 min | Expiry alerts, auto-sync |
| **Document Updates** | 3. Employee Records | 3 | 5 min | Version control, notifications |
| **Incident Reporting** | 7. Employee Relations | 4 | 15 min | Safety, documentation, compliance |
| **Disciplinary Action** | 7. Employee Relations | 3 | 20 min | Documentation, approval chain |
| **Conflict Resolution** | 7. Employee Relations | 4 | 30 min | Mediation, documentation |
| **Exit Interview & Offboarding** | 8. Exit & Offboarding | 6 | 45 min | Comprehensive checklist, compliance |
| **Final Pay & Clearance** | 8. Exit & Offboarding | 4 | 20 min | Calculations, approvals, documentation |
| **Compliance Checklist** | 8. Exit & Offboarding | 5 | 15 min | Legal compliance, audit trail |

---

## 13. BLIH Core Integration & Cross-Module Workflows

### 13.1 Core System Architecture Integration

**BLIH Core serves as the central nervous system** that connects all modules including HR. The HR module leverages Core's unified infrastructure for seamless user experience and data consistency.

#### Core Services Utilized by HR Module:

| Core Service | HR Module Usage | User Benefit |
|---------------|----------------|--------------|
| **Authentication (Keycloak)** | Single sign-on, role-based access | One login for all modules |
| **Notification Engine** | Email, in-app, SMS alerts | Real-time updates across modules |
| **File Storage** | Document management, resumes, contracts | Centralized document repository |
| **Search & Indexing** | Employee directory, candidate search | Universal search capability |
| **Workflow Engine** | Approval chains, automated processes | Consistent approval patterns |
| **Analytics & Reporting** | HR metrics, dashboards | Unified business intelligence |
| **Calendar Integration** | Interview scheduling, leave management | Cross-module calendar sync |
| **Mobile Framework** | Responsive HR interfaces | Consistent mobile experience |

---

### 13.2 Cross-Module User Workflows

#### Workflow A: Employee Onboarding (HR + Projects + Finance)

```
HR: Hiring Decision Approved
     ↓ [Core Event: hr.employee.hired]
Core: Triggers automated workflows
     ↓
┌─────────────────────────────────────────────────────────────┐
│                     NOTIFICATIONS                             │
│ • Finance: "New hire - prepare payroll setup"              │
│ • IT: "Create accounts and assign equipment"               │
│ • Projects: "Add to team project allocations"              │
│ • Manager: "Complete onboarding checklist"                 │
└─────────────────────────────────────────────────────────────┘
     ↓
HR: Onboarding Checklist Initiated
     ↓
Projects: Auto-add to relevant project teams
     ↓
Finance: Payroll setup and benefits enrollment
     ↓
IT: Account provisioning and equipment assignment
     ↓
Core: Unified dashboard shows onboarding progress
```

**User Experience Impact:**
- **New Employee:** Single portal for all onboarding tasks
- **HR Manager:** Real-time visibility into cross-department progress
- **IT/Finance:** Automated notifications and task assignments
- **Project Manager:** Immediate team member access

#### Workflow B: Performance Review Integration (HR + Projects + Brain)

```
HR: Performance Review Period Opens
     ↓ [Core Event: hr.review.period.started]
Core: Gathers data from connected modules
     ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATA AGGREGATION                           │
│ • Projects: Task completion rates, time tracking          │
│ • CRM: Deal contributions, client feedback               │
│ • Brain: Training completed, skills acquired              │
│ • Finance: Billable hours, revenue contribution          │
└─────────────────────────────────────────────────────────────┘
     ↓
HR: Performance Review Forms with Pre-populated Data
     ↓
Employee & Manager: Complete Reviews with Full Context
     ↓
Core: Updates skill profiles and triggers development plans
```

#### Workflow C: Leave Management (HR + Projects + Finance)

```
Employee: Submits Leave Request
     ↓
HR: Leave Approval Workflow
     ↓ [Core Event: hr.leave.approved]
Core: Updates all connected systems
     ↓
┌─────────────────────────────────────────────────────────────┐
│               SYSTEM UPDATES                                │
│ • Projects: Update resource availability                  │
│ • Finance: Adjust payroll calculations                     │
│ • Calendar: Block time in all calendars                  │
│ • Team Dashboards: Show team member availability           │
└─────────────────────────────────────────────────────────────┘
```

---

### 13.3 Unified User Experience Patterns

#### Core Navigation Integration

**HR Module follows Core navigation patterns:**

```
┌────────────────────────────────────────────────────────────┐
│  [BLIH Logo]  [HR Module ▼]      [🔍 Search]  [🔔]  [👤]  │
├────────────────────────────────────────────────────────────┤
│ ☰ Menu │                    HR Dashboard                   │
│────────│                                                    │
│ 🏠 Home│ ┌──────────────────────────────────────────────┐   │
│ 👥 HR  │ │              HR Module Home                  │   │
│ 🤝 CRM │ │                                            │   │
│ 📊 Proj│ │ 👋 Welcome, Sarah (HR Manager)               │   │
│ 💰 Fin │ │                                            │   │
│ 🧠Brain│ │ 📊 Quick Stats                              │   │
│────────│ │ • 150 Active Employees                       │   │
│ ⚙️ Set │ │ • 8 Open Positions                          │   │
│ ❓ Help│ │ • 12 Pending Approvals                       │   │
│ 🚪 Exit│ │ • 3 Reviews Due This Week                    │   │
│        │ │                                            │   │
│        │ │ 🚀 Quick Actions                            │   │
│        │ │ [📝 Post Job] [👥 Add Employee] [📊 Report] │   │
│        │ └──────────────────────────────────────────────┘   │
└────────┴────────────────────────────────────────────────────┘
```

#### Universal Search Integration

**HR data searchable through Core's universal search:**

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Search: "Abebe"                                [✕]    │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ 📄 EMPLOYEES                                                │
│ ┌────────────────────────────────────────────────────┐    │
│ │ 👤 Abebe Tesfaye                                   │    │
│ │    Senior Software Developer • Engineering         │    │
│ │    abebe.t@blih.com • +251911234567               │    │
│ │    [View Profile] [Send Message]                 │    │
│ └────────────────────────────────────────────────────┘    │
│                                                              │
│ 📋 DOCUMENTS                                                │
│ ┌────────────────────────────────────────────────────┐    │
│ │ 📄 Abebe_Tesfaye_Resume.pdf                      │    │
│ │    Uploaded: Feb 1, 2026 • HR: Recruitment       │    │
│ │    [View] [Download]                             │    │
│ └────────────────────────────────────────────────────┘    │
│                                                              │
│ 📅 ACTIVITY                                                 │
│ ┌────────────────────────────────────────────────────┐    │
│ │ ✅ Performance Review Completed - Abebe Tesfaye   │    │
│ │    Feb 5, 2026 • HR: Performance Management     │    │
│ │    [View Details]                                 │    │
│ └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

### 13.4 Core Authentication & Security Integration

#### Unified Identity Management

**HR leverages Core's Keycloak integration:**

```
┌─────────────────────────────────────────────────────────────┐
│                BLIH AUTHENTICATION                             │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Email Address                                     │    │
│  │  [sarah.hr@blih.com_______________________]       │    │
│  │                                                   │    │
│  │  Password                                        │    │
│  │  [•••••••••••••••••••]                    [👁] │    │
│  │                                                   │    │
│  │  ☐ Remember me for 30 days                      │    │
│  │                                                   │    │
│  │  [           Login           ]                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  🔐 Secured by Keycloak • Single Sign-On Enabled        │
└─────────────────────────────────────────────────────────────┘

↓ Successful Login

┌─────────────────────────────────────────────────────────────┐
│                    MODULE ACCESS                             │
│                                                              │
│  Welcome, Sarah! Select your workspace:                     │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ ☑ HR Team   │  │ ☐ CRM       │  │ ☐ Projects  │         │
│  │   👥        │  │   🤝        │  │    📊       │         │
│  │ Full Access │  │ Read Only  │  │ Read Only  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐                         │
│  │ ☑ Finance   │  │ ☑ Brain    │                         │
│  │   💰        │  │   🧠        │                         │
│  │ Full Access │  │ Full Access │                         │
│  └─────────────┘  └─────────────┘                         │
│                                                              │
│                    [Continue to HR Dashboard →]              │
└─────────────────────────────────────────────────────────────┘
```

#### Role-Based Access Control

**HR permissions managed through Core's RBAC system:**

| HR Role | Core Permissions | Module Access |
|---------|------------------|---------------|
| **HR Manager** | hr.admin, finance.read, projects.read | HR: Full, Finance: Read, Projects: Read |
| **HR Specialist** | hr.manage, hr.reports | HR: Full, Other: Limited |
| **Team Lead** | hr.team.read, hr.team.approve | HR: Team Only, Projects: Full |
| **Employee** | hr.self.read, hr.self.write | HR: Self Only |

---

### 13.5 Mobile & Accessibility Integration

#### Core Mobile Framework

**HR module inherits Core's mobile optimizations:**

```
┌─────────────────────────────────┐
│ ☰  BLIH HR         🔔  👤   │
├─────────────────────────────────┤
│                               │
│   📊 HR Dashboard             │
│                               │
│   Quick Actions               │
│   ┌─────────────────────┐     │
│   │ 👤 Approve Leave   │     │
│   │ (3 pending)        │     │
│   └─────────────────────┘     │
│   ┌─────────────────────┐     │
│   │ 📝 Post Job       │     │
│   │ [Create New]       │     │
│   └─────────────────────┘     │
│                               │
│   Recent Activity             │
│   ┌─────────────────────┐     │
│   │ ✅ New hire onboard │     │
│   │ completed: Abebe    │     │
│   └─────────────────────┘     │
│                               │
├─────────────────────────────────┤
│ Home  HR  More                 │
└─────────────────────────────────┘
```

#### Accessibility Features

**HR module follows Core's WCAG 2.1 AA compliance:**

- ✅ **Screen reader support** for all HR forms and dashboards
- ✅ **Keyboard navigation** throughout HR workflows
- ✅ **High contrast mode** for HR data visualization
- ✅ **Voice commands** for common HR actions
- ✅ **Ethiopian calendar support** for leave and performance dates
- ✅ **Multi-language support** (English, Amharic, Oromo)

---

### 13.6 Integration Benefits Summary

| Aspect | Core Integration Benefit | HR Module Enhancement |
|---------|------------------------|----------------------|
| **User Experience** | Consistent UI/UX across modules | Seamless navigation, familiar patterns |
| **Data Consistency** | Single source of truth | Real-time data sync across HR processes |
| **Security** | Centralized authentication | Enterprise-grade security for HR data |
| **Mobile Access** | Responsive framework | Full HR functionality on mobile devices |
| **Notifications** | Unified notification system | Timely alerts for all HR events |
| **Search** | Universal search capability | Find any HR data instantly |
| **Reporting** | Cross-module analytics | Comprehensive HR insights |
| **Workflow** | Standardized approval engine | Consistent approval patterns |

---

*Document Version: 2.0*  
*Updated: February 2026*  
*Based on: MODULE_HR_COMPLETE.md (50 forms, 8 sub-systems)*  
*Integrated with: BLIH Core USER_FLOWS.md*  
*For: BLIH HR Module Implementation*
