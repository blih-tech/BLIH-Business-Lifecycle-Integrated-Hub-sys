# BLIH HR Module - User Flow & UX Documentation

**Purpose:** Clear, actionable user experience guide for HR module  
**Audience:** Designers, Developers, Product Managers  
**Version:** 1.0 | February 2026

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

### Flow 1: Leave Request (Employee)

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

### Flow 2: Approve Leave (Manager)

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

### Flow 3: New Hire Onboarding (HR)

```
Hiring Decision Approved → Click "Start Onboarding" → Fill Profile 
→ Assign Checklist → IT/Admin/Team Tasks → Monitor Progress → Complete
```

**Key Screens:**
1. **Trigger** - "Hiring Approved" alert with "Start Onboarding" CTA
2. **Profile Form** - Pre-filled from hiring data, 4 sections (Personal/Work/Comp/Access)
3. **Checklist Builder** - 4 tabs (HR/IT/Admin/Team), task checkboxes
4. **Monitor View** - Progress bars per department, overdue alerts
5. **Complete** - All checkmarks green, "Employee Active" status

**UX Principles:**
- Pre-fill from hiring decision (reduce typing)
- Progress bars for visual tracking
- Automated task assignment based on role
- Red alerts for overdue tasks

---

### Flow 4: Recruitment Pipeline (HR + Hiring Manager)

```
Create Job Post → Review Applications → Screen CVs → Schedule Interviews 
→ Collect Feedback → Make Decision → Send Offer
```

**Key Screens:**
1. **Pipeline Board** - Kanban columns: New → Screening → Interview → Offer → Hired
2. **Candidate Card** - Photo, name, rating stars, quick actions
3. **CV Viewer** - Inline PDF, score form sidebar
4. **Interview Scheduler** - Calendar integration, room booking
5. **Feedback Form** - 6 ratings + overall recommendation
6. **Decision Panel** - Compare candidates, approve offer

**UX Principles:**
- Drag-and-drop between pipeline stages
- Bulk actions (select multiple, mass email)
- Color-coded ratings (red/yellow/green)
- Comparison view for top 3 candidates

---

### Flow 5: Performance Review (Employee + Manager)

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

### Flow 6: Job Posting Creation (HR)

```
Recruitment Dashboard → Click "New Job Post" → Fill Position Details → Set Requirements 
→ Define Salary Range → Set Approval Chain → Submit for Approval → Publish
```

**Key Screens:**
1. **Dashboard** - "Active Openings" card with "New Job Post" CTA
2. **Position Form** - Title, department, reports to, employment type
3. **Requirements** - Experience, skills (tag input), education, certifications
4. **Compensation** - Salary range, benefits, bonus eligibility
5. **Approval** - Select approvers (HR Manager, Department Head, CEO)
6. **Publish** - Auto-post to careers page, social media toggle

**UX Principles:**
- Template library for common roles
- Auto-save drafts every 30 seconds
- Skill suggestions from database
- Salary benchmark data display

---

### Flow 7: CV Screening & Scoring (HR + Hiring Manager)

```
Application Received → Auto-parse CV → Score against Requirements 
→ Review Scored CVs → Add Manual Ratings → Move to Interview/Decline
```

**Key Screens:**
1. **Inbox** - New applications with auto-parsed summary cards
2. **CV Viewer** - Side-by-side: Original PDF | Parsed data | Score breakdown
3. **Scoring Panel** - 5 criteria sliders: Experience, Skills, Education, Culture Fit, Communication
4. **Quick Actions** - [Shortlist] [Reject] [Request More Info]
5. **Batch Actions** - Select multiple, bulk email templates

**UX Principles:**
- Color-coded match percentage (green >80%, yellow 50-80%, red <50%)
- One-click standard rejection with personalization
- Compare view for top 3 candidates
- Blind review option (hide names/photos)

---

### Flow 8: Timesheet Entry (Employee)

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

### Flow 9: Clock In/Out with Geo-Tracking (Employee)

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

### Flow 10: OKR Creation & Alignment (Manager + Employee)

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

### Flow 11: Training Request & Approval (Employee + Manager)

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

### Flow 12: Employee Recognition Nomination (All Employees)

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

### Flow 13: Pulse Survey Participation (Employee)

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

### Flow 14: Resignation & Exit Process (Employee + HR)

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

### Flow 15: Employee Profile Management (Employee + HR)

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
| Leave Request | 4. Attendance/Leave | 4 | 2 min | Speed, clarity |
| Approve Request | 4. Attendance/Leave | 2 | 30 sec | One-click action |
| Timesheet Entry | 4. Attendance/Leave | 5 | 5 min | Efficiency, copy-paste |
| Clock In/Out | 4. Attendance/Leave | 2 | 10 sec | One-tap, offline |
| New Hire Onboarding | 2. Onboarding | 5 | 15 min | Pre-fill, guidance |
| Recruitment Pipeline | 1. Recruitment | 6 | Varies | Visual tracking |
| Job Posting Creation | 1. Recruitment | 6 | 10 min | Templates, auto-save |
| CV Screening | 1. Recruitment | 4 | 3 min | Color-coding, batch |
| Performance Review | 5. Performance | 5 | 30 min | Save progress |
| OKR Creation | 5. Performance | 5 | 15 min | Alignment tree, templates |
| Training Request | 6. Training | 5 | 5 min | Skill gap link, ROI |
| Recognition Nomination | 7. Employee Relations | 4 | 5 min | Peer suggestions |
| Pulse Survey | 7. Employee Relations | 3 | 3 min | Anonymous, mobile |
| Resignation/Exit | 8. Offboarding | 5 | 10 min | Handover guidance |
| Profile Management | 3. Employee Records | 4 | 5 min | Progressive completion |

---

*Document Version: 1.0*  
*Created: February 2026*  
*For: BLIH HR Module Implementation*
