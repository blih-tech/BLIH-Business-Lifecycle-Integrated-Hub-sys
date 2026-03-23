# BLIH HR Module - Complete Forms Documentation

**Module:** BLIH Team (Human Resources)  
**Version:** 2.0  
**Last Updated:** February 2026  
**Status:** Production Ready  
**Total Forms:** 50

---

## Table of Contents
1. [Module Overview](#module-overview)
2. [System Architecture - 8 Sub-Systems](#system-architecture---8-sub-systems)
3. [Sub-System 1: Recruitment & Hiring](#sub-system-1-recruitment--hiring)
4. [Sub-System 2: Onboarding & Probation](#sub-system-2-onboarding--probation)
5. [Sub-System 3: Employee Profiles & Records](#sub-system-3-employee-profiles--records)
6. [Sub-System 4: Attendance, Leave & Time](#sub-system-4-attendance-leave--time-management)
7. [Sub-System 5: Performance, OKRs & Career](#sub-system-5-performance-okrs--career-development)
8. [Sub-System 6: Training & Skill Development](#sub-system-6-training--skill-development)
9. [Sub-System 7: Employee Relations](#sub-system-7-employee-relations)
10. [Sub-System 8: Exit, Offboarding & Compliance](#sub-system-8-exit-offboarding--compliance)
11. [HR Automation Opportunities](#hr-automation-opportunities)
12. [Integration Points](#integration-points)

---

## Module Overview

The BLIH HR Module ("BLIH Team") provides comprehensive employee lifecycle management through **50 integrated forms** organized across **8 functional sub-systems**. Each form is designed with standardized components: Objectives, Usage Timing, Roles & Workflow, Automated Features, Connected Systems, Data Utilization, and detailed Form Fields.

### Key Metrics
| Metric | Value |
|--------|-------|
| Total Forms | 50 |
| Automation Rate | ~85% |
| Sub-Systems | 8 |
| Integration Points | 15+ |

---

## System Architecture - 8 Sub-Systems

| # | Sub-System | Forms | Primary Function |
|---|------------|-------|------------------|
| 1 | Recruitment & Hiring | 6 | Attract, evaluate, and hire talent |
| 2 | Onboarding & Probation | 7 | Integrate new hires and evaluate trial periods |
| 3 | Employee Profiles & Records | 5 | Maintain comprehensive employee data |
| 4 | Attendance, Leave & Time | 6 | Track presence, absence, and work hours |
| 5 | Performance, OKRs & Career | 9 | Evaluate and develop talent |
| 6 | Training & Skill Development | 4 | Build organizational capability |
| 7 | Employee Relations | 7 | Maintain culture and handle issues |
| 8 | Exit, Offboarding & Compliance | 6 | Manage departures and ensure compliance |

---

## Sub-System 1: Recruitment & Hiring (6 Forms)

### Form 01: Recruitment Request Form

**Objective:** Authorize hiring for new or replacement positions, confirming budget alignment.

**Usage Timing:** When a team lead identifies a staffing gap.

**Roles:**
- Submitter: Team Lead
- Approvers: Finance → Executive Director → HR

**Workflow:** `Team Lead → Finance → Executive Director → HR`

**Automated Features:**
- Alert Finance and HR on submission
- Confirm budget availability at Finance approval
- Trigger Job Posting Form generation at Executive approval
- Link to future employee's onboarding file

**Connected Systems:** Finance (budgeting), HR (hiring tracker), Employee Records

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Role Specifications** | Team, Job Name, Supervisor, Type (New/Replacement), Prior Employee Name (if applicable) |
| **B. Rationale** | Hiring Motivation, Role Overview, Organizational Impact |
| **C. Staffing & Financials** | Current vs. Needed Staff, Salary Bracket (ETB), Perks |
| **D. Schedule** | Target Join Date, Priority (Low/Medium/High) |
| **E. Authorization** | Finance Lead Verdict + Feedback, HR Assessment + Feedback, CEO Sign-Off |

---

### Form 02: Job Posting Form

**Objective:** Transform authorized hiring request into polished job advertisement.

**Usage Timing:** Post-approval of Recruitment Request.

**Roles:** Submitter: HR; Approvers: Team Lead → CEO

**Workflow:** `HR → Team Lead → CEO`

**Automated Features:**
- Auto-import from Request Form + Job Description Repository
- Deploy to career site and generate application URL at CEO approval
- Save in Knowledge Base "Position Archives"

**Connected Systems:** Knowledge Base (Descriptions), Company Site/Careers, Application Form

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Fundamental Role Data** | Job Name, Team, Work Type (Full-time/Part-time/Contract), Work Mode (Office/Hybrid/Remote) |
| **B. Description Overview** | Role Synopsis, Core Duties, Qualifications |
| **C. Prerequisites** | Academic, Experience, Languages, Tech Skills |
| **D. Metrics & Goals** | Primary KPIs for the role |
| **E. Distribution Options** | Platforms: Site/LinkedIn/Telegram/Internal/Others |
| **F. Authorization** | Team Lead Sign-Off, CEO Final Sign-Off |

---

### Form 03: Recruitment Application Form

**Objective:** Gather candidate information and filter applicants for targeted roles.

**Usage Timing:** When job ad is active.

**Roles:** Submitter: Candidate; Approvers: HR → Team Lead

**Workflow:** `Candidate → HR Filter → Team Lead Selection → Automated Ranking`

**Automated Features:**
- Alert HR on submission
- Tag as "Selected" and forward to Team Lead
- Arrange interview and dispatch invites via SMS/email
- Automated rejection emails
- AI resume analysis + scoring (upcoming)

**Connected Systems:** HR, Employee Records, AI Screening

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Personal Data** | Full Name, Gender, Birth Date, Contact Number, Email, Location, Resume Upload |
| **B. Career Data** | Academics, Professional History, Qualifications, Work Samples Link |
| **C. Role-Tailored Queries** | Experience, Obstacles, BLIH Knowledge, Contributions, Salary Expectations (ETB), Availability, Motivation |
| **D. Interest Statement** | Self-Introduction, Extra Comments |

---

### Form 04: CV Screening Form

**Objective:** Assess and rate applicant submissions prior to interview calls.

**Usage Timing:** Following application receipts.

**Roles:** Submitter: HR/Team Lead; Approver: Team Lead

**Workflow:** `HR Assessment → Team Lead Verdict`

**Automated Features:**
- Automated rating on core factors
- Advance to "Selected" and initiate interview setup
- Automated notification via email/SMS for denials

**Connected Systems:** Application Form, Interview Setup, Knowledge Base (hiring guidelines)

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Applicant Identifier** | Name, Applied Role, Submission ID, Origin |
| **B. Assessment Factors** | Qualifications, Background, Technical Abilities, Sector Compatibility, Written Expression (Importance, Rating 1-5, Notes) |
| **C. Comprehensive Assessment** | Aggregate Rating (auto), Suggestion (Select/Pause/Deny), Observations |
| **D. Verdict** | Team Lead Choice, Next Phase (Interview/Deny/Reserve Pool) |

---

### Form 05: Job Interview Feedback Form

**Objective:** Uniformly appraise candidates via standardized ratings.

**Usage Timing:** Post each interview session.

**Roles:** Submitter: Evaluators; Approver: HR

**Workflow:** `Evaluators → HR (compile → order candidates)`

**Automated Features:**
- Instant score aggregation
- Automated candidate ordering by score

**Connected Systems:** Hiring Request, Application Form

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Applicant Data** | Name (auto), Role (auto), Session Date (auto), Evaluator (auto) |
| **B. Rating Categories** | Technical Proficiency, Analytical Skills, Expression, Group Compatibility, Organizational Fit, Poise & Demeanor (Score 1-5, Observations) |
| **C. General Appraisal** | Total Rating (auto-average), Endorsement (Strong Yes/Yes/Uncertain/No), Remarks |
| **D. Next Actions** | Recommendation (Follow-Up/Assign/Hire/Deny) |

---

### Form 06: Hiring Decision & Offer Approval Form

**Objective:** Conclude selection, outline offer terms, secure leadership endorsement.

**Usage Timing:** After all interviews.

**Roles:** Submitter: HR/Team Lead; Approvers: Finance Lead → CEO

**Workflow:** `HR/Team Lead → Finance Lead → CEO`

**Automated Features:**
- Append resume, feedback, and pay suggestion
- Check budget and pay bracket
- Create Offer Document and alert candidate
- Shift to "Employed" and launch Onboarding

**Connected Systems:** Finance, HR, Knowledge Base, Onboarding

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Applicant & Role Reference** | Name, Role, Team, Submission ID |
| **B. Offer Specifications** | Suggested Total Pay (ETB), Perks/Incentives, Trial Phase, Target Start, Work Type |
| **C. Selection Rationale** | Choice Reasoning, Key Assets |
| **D. Supporting Files** | Resume, Feedback Overview, Assessment Outcomes |
| **E. Authorization** | Finance Lead Endorsement, CEO Endorsement, Outcome (Offer OK/Denied/Suspended) |

---

## Sub-System 2: Onboarding & Probation (7 Forms)

### Form 07: Onboarding Checklist Form

**Objective:** Comprehensive onboarding covering HR, cultural orientation, compliance, access, and team assimilation.

**Usage Timing:** After "Employed" status from Hiring Form.

**Roles:** Submitter: HR; Approvers: Team Lead → CEO

**Workflow:** `HR → Team Lead → CEO`

**Automated Features:**
- Generate profile + account + tasks
- Alert IT, Admin, Finance
- Task progress tracking
- Update to "Active Staff"

**Connected Systems:** HR, IT, Admin, Finance, Knowledge Base

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Details** | Full Name, Role, Team, Join Date, Overseer |
| **B. HR Duties List** | Agreement Executed, ID Secured, Backup Contact Recorded, Policies Distributed, Orientation Agenda Shared |
| **C. IT Duties List** | Email Setup, Platform Permissions Granted, Applications Allocated |
| **D. Admin Duties List** | Station Readied, Entry Pass Issued, Equipment Delivered |
| **E. Team Duties List** | Group Introduction, Learning/Observation Schedule, Initial Assignments |
| **F. Authorization** | Team Lead Verification, CEO Sign-Off (if senior) |

---

### Form 08: New Hire Profile Creation Form

**Objective:** Establish full electronic staff record prior to day one.

**Usage Timing:** Post-hiring approval, pre-onboarding.

**Roles:** Submitter: HR; Approver: HR Lead

**Workflow:** `HR → HR Lead`

**Automated Features:**
- Assign ID + account
- Document sync to Finance, IT, Projects

**Connected Systems:** HR, Finance, Knowledge Base

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Core Data** | Full Name, Gender, Birth Date, Contacts, Location |
| **B. Work Data** | Role, Team, Supervisor, Compensation & Perks, Join Date, Work Type |
| **C. Files** | Resume, Identification, Agreement, Qualifications |
| **D. Authorization** | HR Lead Verification |

---

### Form 09: Asset & Access Provisioning Form

**Objective:** Distribute equipment and provide platform access.

**Usage Timing:** Onboarding or role shifts.

**Roles:** Submitter: HR/IT; Approvers: IT Supervisor → Admin → Finance

**Workflow:** `HR → IT Supervisor → Admin → Finance (if over limit)`

**Automated Features:**
- Alert IT + Admin
- Refresh permissions
- Tag as "Allocated" in stock
- Record equipment timeline

**Connected Systems:** IT, Stock Management, Finance

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Data** | Name, Team, Role |
| **B. Equipment Allocated** | Item, ID Number, Status, Remarks (table) |
| **C. Platform Permissions** | Email/Storage, HR Platform, Projects Platform, Client Management, Creative Applications, Other |
| **D. Authorization** | IT Supervisor Sign-Off, Admin Sign-Off, Finance Sign-Off (if required) |

---

### Form 10: Policy Acknowledgement Form

**Objective:** Confirm staff acceptance of essential organizational rules.

**Usage Timing:** In onboarding, pre-access grant.

**Roles:** Submitter: Staff; Approver: HR

**Workflow:** `Staff → HR`

**Automated Features:**
- Log time and archive in file
- Mandate acceptance for access activation
- Preserve acceptance records for audits

**Connected Systems:** Knowledge Base, HR, IT

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Data** | Name, Team, Role |
| **B. Rules Inventory** | Behavior Code, Time Policy, Tech & IT Rules, Time Off Policy, Privacy Rules, No-Harassment Policy, Data Security Policy |
| **C. Confirmation** | "I acknowledge and comprehend all rules." (tick) |
| **D. Authorization** | HR Check |

---

### Form 11: Probation KPI Plan (60 Days)

**Objective:** Outline achievement goals and development path during trial phase.

**Usage Timing:** Within first 3 days of start.

**Roles:** Submitter: Supervisor; Approver: HR

**Workflow:** `Supervisor → HR → Staff Confirmation`

**Automated Features:**
- Alert HR
- Set alerts (Day 30 check, Day 55 review)
- Archive in staff file

**Connected Systems:** Compensation, Permissions, Metrics, Projects

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Details** | Staff, Supervisor, Team, Title, Trial Start, Trial End (auto + editable) |
| **B. Goal Configuration** | Goal, Measure, Goal Value, Importance (%), Notes (min 3, max 5) |
| **C. Development Path** | Scheduled Sessions, Guide Assigned, Milestones (Day 30/55 dates) |
| **D. Endorsements** | Staff (electronic), Supervisor (electronic), HR (electronic) |

---

### Form 12: Probation Evaluation Form

**Objective:** Review performance at trial conclusion (Days 55-60).

**Usage Timing:** Days 55-60 post-start.

**Roles:** Submitter: Supervisor; Approvers: HR → CEO

**Workflow:** `Supervisor → HR → CEO`

**Automated Features:**
- Alert HR
- Confirm: Set to "Permanent"
- Extend: New 30-day plan
- End: Launch exit process

**Connected Systems:** Staff Profile, Compensation, Metrics

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Info** | Auto-populated |
| **B. Goal Review** | Name, Goal, Outcome, Rating (1-5), Remark (auto from Plan) |
| **C. Conduct & Ethics** | Timekeeping, Collaboration, Drive, Expression (Rating 1-5 each) |
| **D. Supervisor Overview** | Assets, Improvements, Suggestion (Confirm/Extend/End) |
| **E. HR Assessment** | Remark, Verdict |
| **F. Endorsements** | Staff, Supervisor, HR, CEO (if needed) |

---

### Form 13: Probation Confirmation / Termination Form

**Objective:** Finalize trial success or begin separation.

**Usage Timing:** End of 60-day trial.

**Roles:** Submitter: Team Lead; Approvers: HR → CEO

**Workflow:** `Team Lead → HR → CEO`

**Automated Features:**
- Check score vs. standard
- If End: Create end letter + halt pay
- If Confirm: Create confirm letter + update status

**Connected Systems:** HR Archives, Finance, Knowledge Base

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Details** | Name, Role, Team, Start |
| **B. Review Overview** | Goal Rating, Time & Attendance, Conduct, Fit, Remarks |
| **C. Verdict** | Confirm, Extend (days), End |
| **D. Authorization** | HR Check, CEO Sign-Off |

---

## Sub-System 3: Employee Profiles & Records (5 Forms)

### Form 14: Employee Profile Form

**Objective:** Main staff record for onboarding or changes.

**Usage Timing:** On hire, advancement, or info updates.

**Roles:** Submitter: HR; Approver: HR Supervisor/CEO (for pay/title shifts)

**Workflow:** `HR → CEO (if pay/title involved)`

**Automated Features:**
- Setup account (Keycloak), assign permissions
- Alert supervisor, start onboarding

**Connected Systems:** Compensation, Permissions, Metrics, Projects

**Form Components:**

| Section | Key Fields |
|---------|------------|
| **A. Personal Info** | Full Name, Gender, DOB, Nationality, Phone, Email, Emergency Contact |
| **B. Employment Info** | Employment Type, Department, Position Title, Reporting Manager, Work Location, Job Grade, Date of Hire, Employment Status, Probation End Date, Contract Expiry |
| **C. Compensation & Payroll** | Basic Salary (ETB), Allowances, Gross Salary (auto), Payment Method, Bank Details, Payroll Cycle, Tax Category (auto) |
| **D. Job Description & KPI Links** | Job Description Upload, KPIs, OKR Role Mapping |
| **E. Documents Upload** | Signed Contract, ID/Passport, Educational Certificates, Clearance/Medical, Portfolio |
| **F. Access & Permissions** | System Email (auto), Access Level, Tools Access, Asset Assigned, Asset Serial |
| **G. HR & Lifecycle** | Leave Balance (auto), Overtime Eligibility, Shift Hours, Disciplinary Flags (auto), Performance Score (auto), Renewal Alerts (auto) |

---

### Form 15: Job Description & KPI Upload Form

**Objective:** Load and assign formal descriptions and metrics.

**Usage Timing:** Onboarding or position changes.

**Roles:** Submitter: HR/Team Lead; Approvers: HR Supervisor → CEO

**Workflow:** `Team Lead → HR Supervisor → CEO`

**Automated Features:**
- Archive in Knowledge Base "Position Archives"
- Attach metrics to goal system
- Sync skills to review forms

**Connected Systems:** Goal module, HR, Knowledge Base, Performance

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Position Data** | Team, Title, Level, Supervisor, Code (auto) |
| **B. Description Content** | Text or PDF: Summary, Duties, Tools, Hours, Skills |
| **C. Metric Definition** | Title, Metric, Target, Frequency, Weight (%) |
| **D. Skills Needed** | Skill, Level (1-5), Notes |
| **E. System Links** | Team Goals, Personal Goal Suggestions, Review Form (auto) |

---

### Form 16: Contract Upload Form

**Objective:** Archive agreements, extensions, changes.

**Usage Timing:** Onboarding, renewals, term alterations.

**Roles:** Submitter: HR; Approver: HR Supervisor

**Workflow:** `HR → HR Supervisor`

**Automated Features:**
- End date alerts (30/60/90 days)
- Sync terms to Finance
- Archive signed in file

**Connected Systems:** Finance, Compensation, Knowledge Base

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Contract Info** | Staff Name, ID, Type (Initial/Renewal/Change), Length, Start/End, Trial? |
| **B. Pay Overview** | Base Pay, Perks, Hours, OT Rules, Leave Rights |
| **C. Upload** | PDF File, Version (auto), Notes |

---

### Form 17: Salary History Update Form

**Objective:** Track pay evolutions, raises, advancements.

**Usage Timing:** Post-raise, advancement, adjustment.

**Roles:** Submitter: HR/Finance; Approvers: Finance Supervisor → CEO

**Workflow:** `HR/Finance → Finance Supervisor → CEO`

**Automated Features:**
- Refresh compensation system
- Archive history in file
- Sync to performance data
- Alert staff

**Connected Systems:** Finance, HR, Goal performance, Knowledge Base

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Info** | Name, ID, Role, Team |
| **B. Change Details** | Prior Pay (auto), New Pay, Difference (auto), Reason (Promotion/Increment/Adjustment/Correction), Effective Date |
| **C. Files** | Approval Document, Advancement Document |

---

### Form 18: Employee Document Update Form

**Objective:** Refresh or add staff files.

**Usage Timing:** For document changes.

**Roles:** Submitter: HR/Staff; Approver: HR Supervisor

**Workflow:** `Staff/HR → HR Supervisor`

**Automated Features:**
- Replace old while archiving
- Alert for expiries
- Sync quals to training library

**Connected Systems:** HR, Training, Knowledge Base

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Details** | Name, ID, Team, Role |
| **B. File Type** | ID Renew, Qual, Health Report, Academic, Work Samples, Other |
| **C. Upload** | File, Issue Date, Expiry (alert trigger) |

---

## Sub-System 4: Attendance, Leave & Time Management (6 Forms)

### Form 19: Leave Request Form

**Objective:** Apply for time off.

**Usage Timing:** For approved absences.

**Roles:** Submitter: Staff; Approvers: Supervisor → HR

**Workflow:** `Staff → Supervisor → HR → Record`

**Automated Features:**
- Alert Supervisor
- Reduce balance; lock dates
- Denial alert to staff
- File in record

**Validation:** Start ≥ Today, End ≥ Start, Type mandatory, Balance check

**Connected Systems:** HR, Compensation

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Info** | Auto-populated |
| **B. Leave Specs** | Type, Start/End, Days (auto), Rationale, Contact, Cover Staff |
| **C. Files** | Optional |
| **D. Auto Calcs** | Balance, Remaining |

---

### Form 20: Punctuality Log/Exception Form

**Objective:** Document delays, early exits, or anomalies.

**Usage Timing:** On attendance issues.

**Roles:** Submitter: Staff/HR; Approvers: Supervisor → HR

**Workflow:** `Staff → Supervisor → HR`

**Automated Features:**
- Refresh logs
- Record for data

**Connected Systems:** Time, Compensation, Projects

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Info** | Auto-populated |
| **B. Anomaly Specs** | Date, Type (Late/Early/Issue/Other), Explanation, Length (auto) |
| **C. Supervisor Remarks** | Notes |

---

### Form 21: Timesheet Form (Weekly)

**Objective:** Record hours, OT, billable time.

**Usage Timing:** Weekly by end of Friday.

**Roles:** Submitter: Staff; Approvers: Supervisor → HR

**Workflow:** `Staff → Supervisor → HR (OT check)`

**Automated Features:**
- Alert Supervisor
- Update OT report, push to Finance
- Weekly file

**Connected Systems:** Projects, Finance, Compensation

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Info** | Auto-populated |
| **B. Day Log** | Day, Date, Project, Task, Hours, Billable?, OT?, Remark (table) |
| **C. Totals** | Regular, OT, Billable (auto) |
| **D. Remarks** | Staff notes, Supervisor notes |

---

### Form 22: Attendance Correction Request Form

**Objective:** Request fixes for erroneous time records.

**Usage Timing:** When time logs are incorrect.

**Roles:** Submitter: Staff; Approvers: Supervisor → HR

**Workflow:** `Staff → Supervisor → HR`

**Automated Features:**
- Update time logs
- Notification to affected systems

**Connected Systems:** Time, Finance, Projects

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Info** | Auto-populated |
| **B. Correction Details** | Date, Current Entry, Requested Entry, Reason |
| **C. Evidence** | Supporting files |

---

### Form 23: Overtime Request Form (Finance Link)

**Objective:** Pre-approve overtime work with budget check.

**Usage Timing:** Before OT work begins.

**Roles:** Submitter: Staff/Supervisor; Approvers: Supervisor → Finance

**Workflow:** `Staff → Supervisor → Finance`

**Automated Features:**
- Update OT budget
- Alert timesheet system

**Connected Systems:** Finance, Projects, Timesheet

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Info** | Auto-populated |
| **B. OT Details** | Date, Expected Hours, Project, Task, Reason |
| **C. Budget Check** | Remaining OT Budget (auto), Approval Status |

---

### Form 24: Work-from-Home / Flex Request Form

**Objective:** Request remote or flexible work arrangements.

**Usage Timing:** For non-standard work arrangements.

**Roles:** Submitter: Staff; Approvers: Supervisor → HR

**Workflow:** `Staff → Supervisor → HR`

**Automated Features:**
- Update work location
- Calendar sync

**Connected Systems:** HR, Calendar, Security

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Info** | Auto-populated |
| **B. Request Details** | Dates, Frequency, Reason, Work Plan |
| **C. Equipment Check** | Home Setup Confirmation |

---

## Sub-System 5: Performance, OKRs & Career Development (9 Forms)

### Form 25: Performance Review (Quarterly)

**Objective:** Assess quarterly achievements.

**Usage Timing:** Quarterly.

**Roles:** Submitter: Staff + Supervisor; Approvers: Team Lead → HR

**Workflow:** `Staff Self → Supervisor → Team Lead → HR Close`

**Automated Features:**
- Alert HR
- Refresh goal progress
- Dashboard push

**Connected Systems:** Goal, Compensation, Team Metrics

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Info** | Auto-populated |
| **B. Metrics & Goals** | Objective, Result, Goal, Met, % Score, Remark (auto from OKR) |
| **C. Self-Review** | Successes, Improvements, Self Rate (1-5) |
| **D. Supervisor Review** | Wins, Issues, Rate (1-5), Reward Suggestion |
| **E. Close** | Team Lead, HR, Avg Score |

---

### Form 26: Personal OKR Creation

**Objective:** Staff define quarterly objectives aligned with team goals.

**Usage Timing:** Start of quarter.

**Roles:** Submitter: Staff; Approver: Supervisor

**Workflow:** `Staff → Supervisor → OKR Module`

**Automated Features:**
- Sync to OKR module
- Cascade to team objectives

**Connected Systems:** OKR Module, Performance

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Info** | Auto-populated |
| **B. Objective Definition** | Objective Statement, Alignment (Team Goal), Key Results (3-5), Metrics, Targets |
| **C. Timeline** | Start, End, Check-in Dates |

---

### Form 27: Manager OKR Review

**Objective:** Supervisor reviews and aligns team member OKRs.

**Usage Timing:** After staff submission.

**Roles:** Submitter: Supervisor; Approver: Department Head

**Workflow:** `Supervisor → Department Head → OKR Module`

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Info** | Auto-populated |
| **B. OKR Review** | Objective, Key Results, Suggested Changes, Priority Level |
| **C. Alignment Check** | Team Objective Link, Dependencies, Resources Needed |

---

### Form 28: Annual Performance Summary

**Objective:** Comprehensive year-end performance evaluation.

**Usage Timing:** End of year.

**Roles:** Submitter: HR (aggregates); Approvers: Supervisor → Department Head → CEO

**Workflow:** `Aggregated from quarterly → Supervisor → Department Head → CEO`

**Automated Features:**
- Pull from 4 quarterly reviews
- Average scores, goal completion %

**Connected Systems:** OKR Module, Performance, Compensation

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Year Overview** | Staff Info, Review Period |
| **B. Quarterly Summary** | Q1, Q2, Q3, Q4 Scores (auto-aggregated) |
| **C. OKR Achievement** | Objectives Set, Completed, Completion % |
| **D. 360 Feedback** | Peer, Subordinate, Cross-functional ratings |
| **E. Annual Rating** | Overall Score, Promotion Eligible, Bonus Recommendation |

---

### Form 29: Training Needs Assessment Form

**Objective:** Identify skill gaps and development needs.

**Usage Timing:** Post-performance review or role change.

**Roles:** Submitter: Staff/Supervisor; Approver: Team Lead → HR

**Workflow:** `Staff/Supervisor → Team Lead → HR`

**Connected Systems:** Training, Skills Matrix

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Info** | Auto-populated |
| **B. Current Skills** | Skills, Proficiency Level (1-5) |
| **C. Required Skills** | For Current Role, For Career Goal, Gap Analysis |
| **D. Training Needs** | Technical, Soft Skills, Compliance, Leadership |
| **E. Priority** | Urgent, Medium, Long-term |

---

### Form 30: Career Development Plan Form

**Objective:** Create structured career progression roadmap.

**Usage Timing:** After performance review or promotion discussion.

**Roles:** Submitter: Staff/Supervisor; Approver: Department Head → HR

**Workflow:** `Staff/Supervisor → Department Head → HR`

**Connected Systems:** Performance, Training, Succession Planning

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Info** | Auto-populated |
| **B. Career Goal** | Target Role, Target Timeline, Motivation |
| **C. Current State** | Strengths, Development Areas, Readiness Gap |
| **D. Development Actions** | Training, Mentoring, Stretch Assignments, Job Rotation |
| **E. Milestones** | 6-month, 1-year, 2-year checkpoints |

---

### Form 31: Internal Transfer Request

**Objective:** Request move to different team or role.

**Usage Timing:** When seeking lateral move.

**Roles:** Submitter: Staff; Approvers: Current Manager → Target Manager → HR → CEO

**Workflow:** `Staff → Current Manager → Target Manager → HR → CEO`

**Connected Systems:** Profile, Performance, Projects

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Info** | Auto-populated |
| **B. Current Position** | Team, Role, Tenure |
| **C. Requested Position** | Target Team, Target Role, Reason |
| **D. Justification** | Skills Match, Career Alignment, Business Need |
| **E. Timing** | Preferred Start Date, Transition Plan |

---

### Form 32: Promotion Request Form

**Objective:** Request role upgrade with pay increase.

**Usage Timing:** When ready for advancement.

**Roles:** Submitter: Supervisor/Staff; Approvers: Team Lead → HR → CEO

**Workflow:** `Staff/Supervisor → Team Lead → HR → CEO`

**Automated Features:**
- Refresh Profile, alert HR, new agreement
- Alert applicant on denial

**Connected Systems:** Profile, Compensation

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Details** | Name, Team, Current Role, Current Level |
| **B. Request Details** | Requested Role, Requested Level, Requested Pay |
| **C. Justification** | Tenure, Performance History, Skills Acquired, Business Case |
| **D. Supporting Docs** | Performance Reviews, Training Certificates, Project List |
| **E. Approvals** | Team Lead, HR, CEO Verdict |

---

### Form 33: Salary Adjustment Form

**Objective:** Request non-promotion pay adjustment.

**Usage Timing:** Special circumstances.

**Roles:** Submitter: HR/Supervisor; Approvers: Finance → CEO

**Workflow:** `HR/Supervisor → Finance → CEO`

**Connected Systems:** Finance, Profile, Compensation

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Details** | Auto-populated |
| **B. Current Compensation** | Current Salary, Last Adjustment Date, Last Adjustment % |
| **C. Requested Adjustment** | New Salary, Increase %, Increase Amount, Effective Date |
| **D. Justification Type** | Market Adjustment, Retention, Exceptional Performance, Role Expansion |
| **E. Supporting Data** | Market Data, Compa-Ratio, Risk of Loss |
| **F. Budget Impact** | Annual Impact, Budget Source |

---

## Sub-System 6: Training & Skill Development (4 Forms)

### Form 34: Training Request Form

**Objective:** Suggest training for skill enhancement.

**Usage Timing:** On gap identification.

**Roles:** Submitter: Staff/Supervisor; Approvers: Team Lead → HR

**Workflow:** `Staff → Team Lead → HR`

**Automated Features:**
- Calendar add + reminders
- Completion report

**Connected Systems:** Knowledge Base, Goal

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Request Data** | Staff, Team, Title, Type (Skill/Compliance/Leadership), Provider, Dates/Duration |
| **B. Aims** | Gap Addressed, Expected Results |
| **C. Expenses** | Cost, Payer (company/self) |
| **D. Follow-Up** | Auto link to completion form |

---

### Form 35: Training Feedback Form

**Objective:** Evaluate training effectiveness.

**Usage Timing:** Within 1 week of training end.

**Roles:** Submitter: Staff; Approver: HR

**Workflow:** `Staff → HR`

**Connected Systems:** Training, Performance

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Training Info** | Course Name, Provider, Dates, Staff (auto) |
| **B. Satisfaction** | Content Quality (1-5), Instructor (1-5), Materials (1-5), Venue (1-5) |
| **C. Application** | Relevance to Role, Skill Improvement, On-the-Job Application |
| **D. ROI** | Worth Time Investment, Would Recommend, Suggested Improvements |

---

### Form 36: Skill Gap Assessment Form

**Objective:** Team-level skills inventory and gap analysis.

**Usage Timing:** Quarterly or pre-planning.

**Roles:** Submitter: Supervisor; Approver: Department Head → HR

**Workflow:** `Supervisor → Department Head → HR`

**Connected Systems:** Skills Matrix, Training, Succession

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Team Info** | Team, Supervisor, Assessment Date |
| **B. Required Skills** | Skill, Required Level (1-5), Criticality |
| **C. Current State** | Staff Name, Current Level (1-5), Gap (table) |
| **D. Gap Summary** | Critical Gaps, Training Needs, Hire Needs |

---

### Form 37: Training Completion & Certification Form

**Objective:** Record completed training and certifications.

**Usage Timing:** Upon training completion.

**Roles:** Submitter: Staff/HR; Approver: HR

**Workflow:** `Staff/HR → HR`

**Automated Features:**
- Update skills profile
- Expiry alerts for certifications
- Sync to performance data

**Connected Systems:** Profile, Skills Matrix, Knowledge Base

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Training Info** | Course Name, Provider, Start/End Date, Staff (auto) |
| **B. Completion** | Status (Completed/Partial/Dropped), Score/Grade, Certificate Number |
| **C. Certification** | Certificate File, Expiry Date, CEU Credits |
| **D. Skills Acquired** | New Skills, Skill Level Improvement |

---

## Sub-System 7: Employee Relations (7 Forms)

### Form 38: Employee Satisfaction Survey

**Objective:** Gauge overall morale and cultural vibe.

**Usage Timing:** Quarterly or semi-annually.

**Roles:** Submitter: Staff; Approver: HR Analysis

**Workflow:** `Collection → HR Review → CEO Summary`

**Automated Features:**
- Dashboard add
- Team trend reports

**Connected Systems:** HR Data, Goal

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Environment** | Satisfaction (1-5), Supervisor Support (1-5), Resources (1-5) |
| **B. Culture & Communication** | Transparency (1-5), Connection (1-5), Suggestions |
| **C. Growth** | Opportunities (1-5), Feedback (Y/N), Desired Training |
| **D. Overall** | Recommend (1-10 NPS), Open Input |
| **E. Settings** | Anonymous Option |

---

### Form 39: Disciplinary Action / Grievance Form

**Objective:** Log and monitor discipline or complaints.

**Usage Timing:** On violations or reports.

**Roles:** Submitter: Supervisor/HR; Approvers: HR → CEO

**Workflow:** `Supervisor → HR → CEO`

**Automated Features:**
- Alert HR + log
- File attach
- Status close

**Connected Systems:** HR Data, Legal

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Event Details** | Staff, Date, Description, Reporter, Team |
| **B. Proof** | Files, Witnesses |
| **C. Measures** | Action (Warning/Suspension/End), HR/CEO Notes |

---

### Form 40: Incident Report Form

**Objective:** Document workplace incidents (safety, security, conflicts).

**Usage Timing:** When incident occurs.

**Roles:** Submitter: Any employee; Approvers: Supervisor → HR → CEO

**Workflow:** `Staff → Supervisor → HR → CEO`

**Connected Systems:** Safety, Security, HR

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Incident Details** | Date/Time, Location, Type (Safety/Security/Conflict/Other), Description |
| **B. People Involved** | Reporter, Victim(s), Witness(es), Perpetrator |
| **C. Immediate Action** | First Aid Given, Authorities Called, Area Secured |
| **D. Investigation** | Root Cause, Contributing Factors, Preventive Actions |

---

### Form 41: Employee Suggestion Form

**Objective:** Capture improvement ideas from staff.

**Usage Timing:** Any time.

**Roles:** Submitter: Any employee; Approver: Department Head → HR

**Workflow:** `Staff → Department Head → HR`

**Connected Systems:** Brain, Management Review

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Suggester** | Name, Team, Contact (anonymous option) |
| **B. Suggestion** | Category (Process/Product/Culture/Other), Current State, Proposed Change |
| **C. Impact** | Benefits, Implementation Complexity, Resources Needed |
| **D. Review** | Reviewer, Status (Under Review/Accepted/Declined), Implementation Plan |

---

### Form 42: Employee Recognition / Appreciation Form

**Objective:** Nominate peers for recognition and awards.

**Usage Timing:** Any time.

**Roles:** Submitter: Any employee; Approver: Supervisor → HR → CEO

**Workflow:** `Staff → Supervisor → HR → CEO`

**Connected Systems:** Performance, Culture dashboard

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Nominator** | Name, Team |
| **B. Nominee** | Name, Team, Role |
| **C. Recognition** | Category (Excellence/Teamwork/Innovation/Service), Specific Actions, Impact |
| **D. Award** | Suggested Award (Certificate/Gift/Bonus), Public Recognition (Y/N) |

---

### Form 43: Culture Check Pulse Survey

**Objective:** Quick temperature check on specific culture topics.

**Usage Timing:** Monthly or after events.

**Roles:** Submitter: Staff; Approver: HR

**Workflow:** `Distribution → Collection → HR Dashboard`

**Connected Systems:** Culture metrics, Brain

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Topic Focus** | Communication/Recognition/Wellness/Inclusion/Leadership |
| **B. Quick Rating** | 3-5 questions, scale 1-5 |
| **C. Open Comment** | One thing to keep, one thing to change |

---

### Form 44: Conflict Resolution Mediation Form

**Objective:** Formal request for mediation between conflicting parties.

**Usage Timing:** When interpersonal conflict arises.

**Roles:** Submitter: Staff/Supervisor; Approver: HR → Mediator

**Workflow:** `Staff/Supervisor → HR → Assigned Mediator`

**Connected Systems:** HR, Legal

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Parties** | Requester, Other Party, Relationship |
| **B. Conflict** | Nature of Dispute, Duration, Attempted Resolutions |
| **C. Impact** | Work Impact, Team Impact, Desired Outcome |
| **D. Mediation** | Mediator Assigned, Session Dates, Agreement Reached |

---

## Sub-System 8: Exit, Offboarding & Compliance (6 Forms)

### Form 45: Employee Resignation Form

**Objective:** Records voluntary exit and starts offboarding.

**Usage Timing:** On resignation decision.

**Roles:** Submitter: Staff; Approvers: Supervisor → HR → CEO

**Workflow:** `Staff → Supervisor → HR → CEO`

**Automated Features:**
- Alert Supervisor & HR
- Start clearance & handover
- Set exit date
- Disable access

**Connected Systems:** Profile, Permissions, Finance, Knowledge Base

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Info** | Auto-populated |
| **B. Exit Specs** | Effective Date, Reason (Growth/Pay/Culture/Other), Remarks, Suggested Replacement |
| **C. Clearance** | Checklist placeholder (auto-generated) |

---

### Form 46: Exit Interview Form

**Objective:** Gather feedback from departing employees.

**Usage Timing:** During notice period.

**Roles:** Submitter: HR; Approver: HR Director

**Workflow:** `HR conducts → Documentation → HR Director review`

**Connected Systems:** Brain, Culture dashboard

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Exit Details** | Staff Name, Role, Tenure, Exit Date, Reason for Leaving |
| **B. Experience** | Best Aspect, Worst Aspect, Would Recommend (Y/N), Return (Y/N) |
| **C. Feedback** | Manager Feedback, Team Feedback, Workload Feedback, Pay Satisfaction |
| **D. Improvement** | One Thing to Change, What Would Have Kept You |

---

### Form 47: Offboarding Checklist Form

**Objective:** Ensure complete departure process.

**Usage Timing:** After resignation or termination.

**Roles:** Submitter: HR; Approvers: Supervisor → IT → Admin → Finance → HR

**Workflow:** `HR → Supervisor → IT → Admin → Finance → HR`

**Automated Features:**
- Auto-created from resignation form
- Real-time checklist tracking
- Auto-disable access on exit date

**Connected Systems:** All systems

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Info** | Auto-populated |
| **B. Supervisor Tasks** | Work Handover, Client Transfers, Documentation Complete |
| **C. IT Tasks** | Email Forwarding, Account Disabled, Equipment Returned, Access Revoked |
| **D. Admin Tasks** | Badge Returned, Parking Pass, Locker Cleared |
| **E. Finance Tasks** | Final Pay Calculated, Expenses Settled, Loans Cleared |
| **F. HR Tasks** | Exit Interview Complete, Certificate Prepared, Reference Policy Explained |

---

### Form 48: Asset Return & Clearance Form

**Objective:** Track return of company property.

**Usage Timing:** During offboarding.

**Roles:** Submitter: Staff; Approvers: IT → Admin → Finance

**Workflow:** `Staff → IT → Admin → Finance`

**Connected Systems:** Asset Management, Finance

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Asset List** | Item, Asset ID, Condition (Good/Damaged/Missing), Return Date (table) |
| **B. Financial** | Deposit Return, Deductions for Damage, Net Amount |
| **C. Clearance** | IT Sign-off, Admin Sign-off, Finance Sign-off |

---

### Form 49: Experience Letter & Final Pay Request Form

**Objective:** Process final documentation and payment.

**Usage Timing:** At exit completion.

**Roles:** Submitter: HR; Approvers: Finance → CEO

**Workflow:** `HR → Finance → CEO`

**Connected Systems:** Finance, Profile

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Staff Info** | Auto-populated |
| **B. Final Pay** | Last Working Day, Leave Balance Payout, Gratuity, Deductions, Net Final Pay |
| **C. Documents** | Experience Letter (Y/N), Relieving Letter (Y/N), Reference Letter (Y/N), Payslip Copies |
| **D. Delivery** | Personal Email, Address for Hard Copies |

---

### Form 50: Compliance Checklist (Labor Law)

**Objective:** Ensure legal compliance for all terminations.

**Usage Timing:** For every exit.

**Roles:** Submitter: HR; Approver: Legal/Compliance

**Workflow:** `HR → Legal/Compliance`

**Connected Systems:** Legal, Audit

**Form Components:**

| Section | Fields |
|---------|--------|
| **A. Termination Type** | Resignation/End of Contract/Termination/Layoff |
| **B. Notice Period** | Contractual Notice, Actual Notice Given, Pay in Lieu (Y/N) |
| **C. Final Dues** | Salary, Leave, Gratuity, Severance, Total |
| **D. Documentation** | Termination Letter (Y/N), Exit Interview (Y/N), Clearance Certificate (Y/N) |
| **E. Legal Check** | Union Notification, Labor Office Filing, No Pending Claims |

---

## HR Automation Opportunities

### Automation Priority Matrix

| # | Domain | Automation Element | Potential |
|---|--------|---------------------|-----------|
| 1 | Leave Handling | Balance auto-reduction | 95% |
| 2 | Time & Attendance | Delay spotting & log generation | 85% |
| 3 | OT Monitoring | Data pull from projects | 90% |
| 4 | Hiring Request | Tiered approvals | 80% |
| 5 | Application Oversight | Rating, invites, denials | 75% (95% with AI) |
| 6 | Interview Assessment | Instant ordering | 85% |
| 7 | Onboarding | Setup, checks, verification | 90% |
| 8 | Trial Reviews | Alerts & planning | 95% |
| 9 | Achievement Reviews | Goal fetch & scoring | 80% |
| 10 | Training | Schedule + alerts | 85% |
| 11 | Morale Surveys | Gather & overview | 90% |
| 12 | Advance/Moves | Status & pay sync | 85% |
| 13 | Exit & Resign | Process start | 95% |
| 14 | Pay Generation | Slips & notifications | 90% |
| 15 | Staff Insights | Auto-reports | 80% |
| 16 | Insight Capture | Exit/performance lessons | 70% |

### Automation by Sub-System

| Sub-System | Rate | Key Automated Flows |
|------------|------|----------------------|
| 1. Recruitment | 75-95% | Auto-routing, interview scheduling, rejection emails |
| 2. Onboarding | 90-95% | Account creation, task generation, probation alerts |
| 3. Profiles | 85-90% | ID generation, permission sync, document archival |
| 4. Attendance | 85-95% | Balance updates, timesheet reminders, OT calculations |
| 5. Performance | 80-85% | Goal cascade, review reminders, promotion workflows |
| 6. Training | 85-90% | Calendar invites, completion tracking, skill updates |
| 7. Relations | 70-80% | Survey distribution, incident routing, recognition |
| 8. Exit | 90-95% | Checklist generation, access revocation, final pay |
| **Overall** | **~85%** | **High automation across all 50 forms** |

---

## Integration Points

### Outbound Events

| Event | Trigger | Subscribers |
|-------|---------|-------------|
| `hr.employee.hired` | Hiring approved | Finance, IT, Brain |
| `hr.employee.terminated` | Exit complete | Finance, IT, Projects |
| `hr.leave.approved` | Leave OK | Projects, Calendar, Finance |
| `hr.payroll.processed` | Payroll run | Finance, Brain |
| `hr.training.completed` | Training done | Brain, Performance |
| `hr.probation.confirmed` | Trial complete | Profile, Access |

### External Integrations

| System | Type | Purpose |
|--------|------|---------|
| Keycloak | SSO/SCIM | Authentication, profile sync |
| Payroll Provider | REST API | Salary processing, tax filing |
| Calendar | CalDAV/Graph | Leave blocking, scheduling |
| Slack/Teams | Webhook | Notifications, approvals |
| Job Boards | API | Post openings, applications |

---

*Documentation Version: 2.0*  
*Module Version: 1.0*  
*Last Updated: February 2026*  
*Total Forms Documented: 50*
