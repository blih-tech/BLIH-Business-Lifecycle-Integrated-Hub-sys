# BLIH Core - User Flows & Experience Design

**Version:** 1.0  
**Last Updated:** February 2026  
**Focus:** User-Centered Design & Intuitive Workflows

---

## Table of Contents

1. [UX Design Principles](#1-ux-design-principles)
2. [User Personas](#2-user-personas)
3. [Core Navigation Patterns](#3-core-navigation-patterns)
4. [Authentication & Onboarding](#4-authentication--onboarding)
5. [Module-Specific User Flows](#5-module-specific-user-flows)
6. [Cross-Module Workflows](#6-cross-module-workflows)
7. [Mobile Experience](#7-mobile-experience)
8. [Accessibility & Localization](#8-accessibility--localization)

---

## 1. UX Design Principles

### 1.1 Core Philosophy

**"Invisible Complexity, Visible Value"**

BLIH follows these UX principles:

| Principle | Implementation | User Benefit |
|-----------|---------------|--------------|
| **Progressive Disclosure** | Show basic info first, details on demand | Reduces cognitive load |
| **Consistency** | Same patterns across all modules | Faster learning curve |
| **Immediate Feedback** | Real-time validation, loading states | User confidence |
| **Forgiveness** | Undo actions, draft auto-save | Error recovery |
| **Contextual Help** | Tooltips, inline examples | Self-service learning |

### 1.2 Visual Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│  Primary Actions (Blue CTAs)                            │
│  • Most common user actions                             │
│  • High contrast, prominent placement                   │
│                                                          │
│  Secondary Actions (Outlined buttons)                   │
│  • Alternative paths                                    │
│  • Less visual weight                                   │
│                                                          │
│  Tertiary Actions (Text links)                          │
│  • Low-frequency actions                                │
│  • Minimal visual footprint                             │
│                                                          │
│  Destructive Actions (Red, requires confirmation)       │
│  • Delete, terminate, cancel                            │
│  • Modal confirmation required                          │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Response Time Standards

| Action | Target Time | User Experience |
|--------|-------------|-----------------|
| **Instant** (< 100ms) | Button clicks, form inputs | Feels immediate |
| **Fast** (< 1s) | Page loads, search results | No noticeable delay |
| **Acceptable** (< 3s) | Complex queries, reports | Progress indicator shown |
| **Long** (> 3s) | Bulk operations, exports | Background job with email notification |

---

## 2. User Personas

### 2.1 Primary Personas

#### Persona A: Sarah - HR Manager
**Profile:**
- 8 years HR experience
- Manages 150 employees
- Tech-savvy, expects efficiency
- Uses BLIH 3-4 hours/day

**Goals:**
- Complete hiring processes quickly
- Monitor team performance metrics
- Ensure compliance documentation
- Respond to employee requests

**Pain Points:**
- Too many clicks to complete tasks
- Repetitive data entry
- Can't find information quickly
- Unclear approval status

**BLIH Solutions:**
- Bulk actions for common tasks
- Smart forms with auto-fill
- Universal search
- Real-time status updates

#### Persona B: Mike - Sales Representative
**Profile:**
- 5 years in sales
- Manages 30+ active deals
- Mobile-heavy user
- Needs quick deal updates

**Goals:**
- Update deals on-the-go
- Access client history instantly
- Track pipeline progress
- Meet monthly targets

**Pain Points:**
- Desktop-only interfaces
- Slow loading times
- Complex navigation
- Missing notifications

**BLIH Solutions:**
- Responsive mobile design
- Kanban deal view
- Smart notifications
- Offline mode

#### Persona C: David - Project Manager
**Profile:**
- Technical background
- Runs 5-10 concurrent projects
- Detail-oriented
- Collaborates across departments

**Goals:**
- Resource allocation visibility
- Real-time project tracking
- Integrated time and budget
- Team collaboration

**Pain Points:**
- Disconnected tools
- Manual status updates
- Budget visibility gaps
- Communication overhead

**BLIH Solutions:**
- Unified project dashboard
- Auto-status from tasks
- Financial integration
- Built-in chat

---

## 3. Core Navigation Patterns

### 3.1 Application Shell

```
┌────────────────────────────────────────────────────────────┐
│  [Logo]  [Module Switcher ▼]      [Search]  [🔔]  [👤]    │ ← Top Bar
├────────────────────────────────────────────────────────────┤
│ ☰     │                                                     │
│ Menu  │         Page Content                               │
│       │                                                     │
│ 🏠 Home│                                                     │
│ 👥 HR  │         [Main Content Area]                        │
│ 🤝 CRM │                                                     │
│ 📊 Proj│                                                     │
│ 💰 Fin │                                                     │
│ 🧠Brain│                                                     │
│       │                                                     │
│ ─────  │                                                     │
│ ⚙️ Set │                                                     │
│ ❓ Help│                                                     │
│ 🚪 Exit│                                                     │
└────────┴─────────────────────────────────────────────────────┘
```

### 3.2 Breadcrumb Navigation

**Pattern:**
```
Home > CRM > Deals > Tech Corp Enterprise > Edit Details
```

**Rules:**
- Always show full path
- Each segment is clickable
- Current page is not a link
- Max 5 levels before truncation

### 3.3 Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Cmd/Ctrl + K` | Global search | Anywhere |
| `Cmd/Ctrl + B` | Toggle sidebar | Anywhere |
| `Esc` | Close modal/drawer | Modal open |
| `Cmd/Ctrl + S` | Save current form | Form editing |
| `Cmd/Ctrl + Enter` | Submit form | Form editing |
| `G then H` | Go to Home | Anywhere |
| `G then D` | Go to Dashboard | Anywhere |
| `/` | Focus search | Anywhere |

---

## 4. Authentication & Onboarding

### 4.1 Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     BLIH Login                               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Email Address                                     │    │
│  │  [john.doe@company.com________________]           │    │
│  │                                                     │    │
│  │  Password                                          │    │
│  │  [••••••••••••]                         [👁 Show] │    │
│  │                                                     │    │
│  │  ☐ Remember me for 30 days                        │    │
│  │                                                     │    │
│  │  [       Login       ]                             │    │
│  │                                                     │    │
│  │  Forgot password? • Need help?                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Secured by Keycloak                                        │
└─────────────────────────────────────────────────────────────┘
```

**MFA Flow (if enabled):**
```
1. Email + Password entered
   ↓
2. "Enter 6-digit code from authenticator app"
   [___] [___] [___] [___] [___] [___]
   ↓
3. Verification
   ↓
4. Dashboard
```

### 4.2 First-Time User Onboarding

```
Step 1: Welcome Screen
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                  👋 Welcome to BLIH!                        │
│                                                              │
│  Your workspace for managing all business operations        │
│                                                              │
│  Let's get you started with a quick setup...                │
│                                                              │
│  [← Skip for now]              [Get Started →]             │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Step 2: Profile Setup (Progress: 1/4)
┌─────────────────────────────────────────────────────────────┐
│  [●───────────]  1 of 4                                     │
│                                                              │
│  Complete Your Profile                                      │
│                                                              │
│  [Upload Photo]  [📷 Take Photo]                            │
│  [   Photo Preview   ]                                      │
│                                                              │
│  Timezone:  [Africa/Addis_Ababa ▼]                          │
│  Language:  [English ▼]                                     │
│                                                              │
│  Notification Preferences:                                  │
│  ☑ Email notifications                                      │
│  ☑ In-app notifications                                     │
│  ☐ SMS notifications (optional)                             │
│                                                              │
│  [← Back]                              [Next →]            │
└─────────────────────────────────────────────────────────────┘

Step 3: Module Selection (Progress: 2/4)
┌─────────────────────────────────────────────────────────────┐
│  [●●──────────]  2 of 4                                     │
│                                                              │
│  Which modules will you use most?                           │
│  (We'll personalize your dashboard)                         │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ ☑ HR Team│  │ ☑ CRM    │  │ ☐ Projects│                │
│  │   👥     │  │   🤝     │  │    📊     │                │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                                                              │
│  ┌──────────┐  ┌──────────┐                                │
│  │ ☑ Finance│  │ ☐ Brain  │                                │
│  │   💰     │  │   🧠     │                                │
│  └──────────┘  └──────────┘                                │
│                                                              │
│  [← Back]                              [Next →]            │
└─────────────────────────────────────────────────────────────┘

Step 4: Dashboard Tour (Progress: 3/4)
┌─────────────────────────────────────────────────────────────┐
│  [●●●─────────]  3 of 4                                     │
│                                                              │
│  Quick Tour of Your Dashboard                               │
│                                                              │
│  [Dashboard Preview with Annotations]                       │
│                                                              │
│  ① Tasks & To-dos                                           │
│  ② Recent Activity                                          │
│  ③ Quick Actions                                            │
│  ④ Module Shortcuts                                         │
│                                                              │
│  [← Back]    [Skip Tour]              [Next →]            │
└─────────────────────────────────────────────────────────────┘

Step 5: Ready! (Progress: 4/4)
┌─────────────────────────────────────────────────────────────┐
│  [●●●●────────]  4 of 4                                     │
│                                                              │
│              ✅ You're All Set!                             │
│                                                              │
│  Here are some things you can do:                           │
│                                                              │
│  📋 View your tasks and assignments                         │
│  👥 Explore your team directory                             │
│  📚 Read company policies (Brain)                           │
│  ⚙️  Customize your preferences                             │
│                                                              │
│  [← Back]                   [Go to Dashboard →]            │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Module-Specific User Flows

### 5.1 HR Module: Hiring a New Employee

**Scenario:** HR Manager Sarah wants to hire a software developer

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Create Job Posting                                 │
└─────────────────────────────────────────────────────────────┘

Navigation: HR > Recruitment > Create Job Posting

┌─────────────────────────────────────────────────────────────┐
│  New Job Posting                                  [Save Draft]│
│  ───────────────────────────────────────────────────────────│
│                                                              │
│  Basic Information                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Job Title *                                         │   │
│  │ [Senior Software Developer_______________]         │   │
│  │                                                      │   │
│  │ Department *     Position Type *     Headcount *    │   │
│  │ [Engineering ▼]  [Full-time ▼]      [1______]      │   │
│  │                                                      │   │
│  │ Location *                    Salary Range *        │   │
│  │ [Addis Ababa___]              [80k - 100k ETB/mo]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Job Description                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Rich text editor with formatting]                  │   │
│  │ • Responsibilities                                  │   │
│  │ • Requirements                                      │   │
│  │ • Nice-to-have skills                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [← Cancel]              [Save as Draft]  [Publish →]      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Review Applications                                 │
└─────────────────────────────────────────────────────────────┘

Navigation: HR > Recruitment > Active Postings > [View Applications]

┌─────────────────────────────────────────────────────────────┐
│  Applications: Senior Software Developer        [+ Invite]  │
│  ───────────────────────────────────────────────────────────│
│                                                              │
│  Filters: [All ▼] [Sort: Best Match ▼]          🔍 Search  │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ⭐ 95% Match                                        │    │
│  │ Abebe Tesfaye                                      │    │
│  │ 5 years experience • BSc Computer Science          │    │
│  │ Skills: Python, Django, PostgreSQL                 │    │
│  │ Applied: 2 days ago                                │    │
│  │                                                     │    │
│  │ [View CV] [📧 Email] [Schedule Interview →]       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ⭐ 88% Match                                        │    │
│  │ Marta Alemu                                        │    │
│  │ 3 years experience • BSc Software Engineering      │    │
│  │ ...                                                 │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Schedule Interview                                  │
└─────────────────────────────────────────────────────────────┘

[Click "Schedule Interview" button]

┌─────────────────────────────────────────────────────────────┐
│  Schedule Interview - Abebe Tesfaye               [✕ Close] │
│  ───────────────────────────────────────────────────────────│
│                                                              │
│  Interview Details                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Interview Type *                                    │   │
│  │ ◉ Technical Interview                               │   │
│  │ ○ HR Interview                                      │   │
│  │ ○ Culture Fit Interview                            │   │
│  │                                                      │   │
│  │ Date & Time *                                       │   │
│  │ [Feb 15, 2026 ▼]  at  [2:00 PM ▼]                  │   │
│  │                                                      │   │
│  │ Duration: [60 minutes ▼]                            │   │
│  │                                                      │   │
│  │ Interviewers *                                      │   │
│  │ [+ Add] John Doe (Engineering Manager)             │   │
│  │ [+ Add] Jane Smith (Senior Developer)              │   │
│  │                                                      │   │
│  │ Location                                            │   │
│  │ ◉ Video Call (automatic link generated)            │   │
│  │ ○ In-person: [____________]                        │   │
│  │                                                      │   │
│  │ Notes (optional)                                    │   │
│  │ [Prepare coding challenge_____________]            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ☑ Send calendar invitation to candidate                    │
│  ☑ Send reminder 1 day before                               │
│                                                              │
│  [Cancel]                           [Schedule Interview]    │
└─────────────────────────────────────────────────────────────┘

Confirmation Toast:
┌─────────────────────────────────────────────────────────────┐
│  ✅ Interview scheduled successfully!                        │
│  Calendar invite sent to Abebe Tesfaye                      │
│  [View Interview]  [Dismiss]                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Make Offer                                          │
└─────────────────────────────────────────────────────────────┘

After successful interviews...

Navigation: HR > Recruitment > [Candidate Name] > Make Offer

┌─────────────────────────────────────────────────────────────┐
│  Job Offer - Abebe Tesfaye                                  │
│  ───────────────────────────────────────────────────────────│
│                                                              │
│  Offer Details                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Position: Senior Software Developer                 │   │
│  │ Department: Engineering                             │   │
│  │                                                      │   │
│  │ Compensation Package                                │   │
│  │ Base Salary (ETB/month) *: [90,000_______]          │   │
│  │ Performance Bonus: [10% annually____]               │   │
│  │ Benefits:                                           │   │
│  │   ☑ Health Insurance                                │   │
│  │   ☑ Pension Contribution (11%)                      │   │
│  │   ☑ Transport Allowance (2,000 ETB/month)          │   │
│  │                                                      │   │
│  │ Start Date *: [March 1, 2026 ▼]                     │   │
│  │ Contract Type: [Permanent ▼]                        │   │
│  │                                                      │   │
│  │ Offer Valid Until: [Feb 25, 2026 ▼]                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Attachments                                                 │
│  📄 Employment Contract (auto-generated)                    │
│  [+ Upload additional documents]                            │
│                                                              │
│  [← Back]      [Save Draft]      [Send Offer Letter →]     │
└─────────────────────────────────────────────────────────────┘

Success:
┌─────────────────────────────────────────────────────────────┐
│  ✅ Offer letter sent successfully!                          │
│  Email sent to: abebe.tesfaye@email.com                     │
│  Status changed to: "Offer Extended"                        │
│  [Track Offer Status]  [Dismiss]                            │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 CRM Module: Managing a Sales Deal

**Scenario:** Sales Rep Mike converting a lead to a deal

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Lead Qualification                                  │
└─────────────────────────────────────────────────────────────┘

Navigation: CRM > Leads > [Lead Name]

┌─────────────────────────────────────────────────────────────┐
│  Lead: Tech Solutions Inc                    [Convert ▼]    │
│  Status: Qualified                                           │
│  ───────────────────────────────────────────────────────────│
│                                                              │
│  Contact Information          Activity Timeline             │
│  ┌────────────────────┐      ┌──────────────────────┐      │
│  │ Contact Name       │      │ Today, 2:30 PM       │      │
│  │ David Chen         │      │ 📞 Called - Interested│      │
│  │                    │      │                       │      │
│  │ Email              │      │ Yesterday            │      │
│  │ david@techsol.com  │      │ 📧 Sent proposal     │      │
│  │                    │      │                       │      │
│  │ Phone              │      │ 3 days ago           │      │
│  │ +251911234567      │      │ 🤝 Meeting completed │      │
│  │                    │      │                       │      │
│  │ Company Size       │      │ 1 week ago           │      │
│  │ 50-100 employees   │      │ ✉️ Initial contact    │      │
│  └────────────────────┘      └──────────────────────┘      │
│                                                              │
│  Estimated Value: $75,000                                   │
│  Expected Close: Q1 2026                                    │
│                                                              │
│  [Log Activity] [Send Email] [Convert to Deal →]           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Convert to Deal                                     │
└─────────────────────────────────────────────────────────────┘

[Click "Convert to Deal"]

┌─────────────────────────────────────────────────────────────┐
│  Convert Lead to Deal                              [✕ Close] │
│  ───────────────────────────────────────────────────────────│
│                                                              │
│  This will create:                                           │
│  ✅ New Deal: "Tech Solutions Inc - Enterprise Platform"    │
│  ✅ New Organization: "Tech Solutions Inc"                  │
│  ✅ New Contact: "David Chen"                               │
│                                                              │
│  Deal Details                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Deal Name *                                         │   │
│  │ [Tech Solutions Inc - Enterprise Platform____]     │   │
│  │                                                      │   │
│  │ Value (USD) *           Expected Close Date *       │   │
│  │ [75,000_______]         [Mar 31, 2026 ▼]           │   │
│  │                                                      │   │
│  │ Pipeline Stage *        Probability               │   │
│  │ [Proposal ▼]            [60%_____]                  │   │
│  │                                                      │   │
│  │ Products/Services                                   │   │
│  │ [+ Add] Enterprise License (1 year)                │   │
│  │ [+ Add] Implementation Services                    │   │
│  │ [+ Add] Training Package                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [Cancel]                              [Create Deal →]      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Deal Pipeline View                                  │
└─────────────────────────────────────────────────────────────┘

Navigation: CRM > Deals > Pipeline View

┌─────────────────────────────────────────────────────────────┐
│  Sales Pipeline                    [List] [Kanban] [Chart]  │
│  ───────────────────────────────────────────────────────────│
│                                                              │
│  Prospecting    Qualification   Proposal      Negotiation   │
│  $120K (5)      $380K (8)      $450K (6)     $290K (4)     │
│  ┌─────────┐   ┌─────────┐    ┌─────────┐   ┌─────────┐   │
│  │ ABC Inc │   │ XYZ Corp│    │Tech Sol │   │ Big Co  │   │
│  │ $25K    │   │ $50K    │    │ $75K ✨ │   │ $120K   │   │
│  │ 20%     │   │ 40%     │    │ 60%     │   │ 80%     │   │
│  └─────────┘   └─────────┘    └─────────┘   └─────────┘   │
│                                                              │
│  ┌─────────┐   ┌─────────┐    ┌─────────┐   ┌─────────┐   │
│  │ DEF Ltd │   │ ...     │    │ ...     │   │ ...     │   │
│  │ $30K    │   │         │    │         │   │         │   │
│  │ 15%     │   │         │    │         │   │         │   │
│  └─────────┘   └─────────┘    └─────────┘   └─────────┘   │
│                                                              │
│  Closed Won                     Closed Lost                 │
│  $650K (12) 🎯                  $85K (3)                    │
│  ┌─────────┐                   ┌─────────┐                 │
│  │ Won Deal│                   │ Lost 1  │                 │
│  │ $80K    │                   │ $25K    │                 │
│  └─────────┘                   └─────────┘                 │
└─────────────────────────────────────────────────────────────┘

[Drag & Drop deals between stages]
```

### 5.3 Projects Module: Project Dashboard

**Scenario:** Project Manager David viewing project health

```
┌─────────────────────────────────────────────────────────────┐
│  Project: Tech Solutions Implementation    [⚙️ Settings ▼]  │
│  Status: In Progress | Budget: 68% used | Timeline: On Track│
│  ───────────────────────────────────────────────────────────│
│                                                              │
│  Quick Stats                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Tasks    │  │ Team     │  │ Budget   │  │ Time     │   │
│  │ 24/45    │  │ 6 people │  │ $51K/75K │  │ 45/90d   │   │
│  │ Complete │  │ Assigned │  │ Remaining│  │ Remaining│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  Milestones                              [+ Add Milestone]  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✅ Phase 1: Planning         Completed 2 weeks ago  │   │
│  │ 🔵 Phase 2: Development      In Progress (65%)      │   │
│  │ ⚪ Phase 3: Testing          Starts in 3 weeks      │   │
│  │ ⚪ Phase 4: Deployment        Starts in 8 weeks      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Recent Activity                                             │
│  • Sarah completed "API Integration" task                   │
│  • Mike logged 8 hours on "Frontend Development"            │
│  • David added new task "Security Review"                   │
│                                                              │
│  Risk Alerts                                                 │
│  ⚠️ 1 high-priority issue requires attention                │
│  [View Details]                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Cross-Module Workflows

### 6.1 End-to-End: Sale to Delivery to Payment

```
CRM: Deal Won
     ↓
[Email Notification to Sales Rep]
"Congratulations! Your deal is closed. Project created automatically."
     ↓
Projects: Project Auto-Created
     ↓
[Notification to Project Manager]
"New project assigned to you from CRM deal."
     ↓
Project Manager: Assigns Team
     ↓
[Notifications to Team Members]
"You've been added to: Tech Solutions Implementation"
     ↓
Finance: Deposit Invoice Auto-Generated
     ↓
[Notification to Finance Team]
"New invoice ready for approval"
     ↓
Finance: Invoice Sent to Client
     ↓
[Email to Client with Payment Link]
     ↓
Client: Pays Invoice
     ↓
Finance: Payment Recorded
     ↓
[Notification to Project Manager]
"Payment received. Project can start."
```

---

## 7. Mobile Experience

### 7.1 Mobile Navigation

```
┌───────────────────────────┐
│ ☰  BLIH         🔔  👤   │
├───────────────────────────┤
│                           │
│   📊 Dashboard            │
│                           │
│   Recent Activity         │
│   ┌─────────────────────┐│
│   │ ✅ Task completed   ││
│   │ by Sarah            ││
│   │ 2 min ago           ││
│   └─────────────────────┘│
│                           │
│   ┌─────────────────────┐│
│   │ 💬 New comment on   ││
│   │ TechCorp Project    ││
│   │ 15 min ago          ││
│   └─────────────────────┘│
│                           │
│   My Tasks (5)            │
│   ┌─────────────────────┐│
│   │ ☐ Review proposal   ││
│   │ Due: Today          ││
│   └─────────────────────┘│
│                           │
│   [+ Quick Actions]       │
│                           │
├───────────────────────────┤
│ Home  Tasks  More         │
└───────────────────────────┘
```

### 7.2 Mobile Optimizations

| Feature | Mobile Behavior |
|---------|----------------|
| **Tables** | Horizontal scroll or card view |
| **Forms** | One column, larger inputs |
| **Modals** | Full-screen on mobile |
| **Charts** | Simplified, touch-optimized |
| **Filters** | Slide-up drawer |
| **Actions** | Floating action button |

---

## 8. Accessibility & Localization

### 8.1 Accessibility Features

✅ **WCAG 2.1 AA Compliant**

- Screen reader support (ARIA labels)
- Keyboard navigation throughout
- High contrast mode
- Resizable text (up to 200%)
- Focus indicators on all interactive elements
- Alt text for all images
- Captions for videos

### 8.2 Ethiopian Calendar Support

Users can toggle calendar display:

```
┌─────────────────────────────────┐
│ Calendar Preference             │
│ ◉ Gregorian (Feb 10, 2026)      │
│ ○ Ethiopian (Yekatit 2, 2018)   │
└─────────────────────────────────┘
```

All dates internally stored as UTC Gregorian, converted for display.

---

*Document Version: 1.0*  
*Last Updated: February 2026*  
*Maintained by: UX Team*
