# BLIH Database Schema - HR Module

**Database:** PostgreSQL (Primary)
**Module:** HR (Human Resources / BLIH Team)
**Version:** 1.0
**Last Updated:** February 2026  
**Total Entities:** 50+ Collections/Tables

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Core Employee Collections](#core-employee-collections)
3. [Sub-System 1: Recruitment & Hiring (6 Tables)](#sub-system-1-recruitment--hiring)
4. [Sub-System 2: Onboarding & Probation (7 Tables)](#sub-system-2-onboarding--probation)
5. [Sub-System 3: Employee Profiles & Records (5 Tables)](#sub-system-3-employee-profiles--records)
6. [Sub-System 4: Attendance, Leave & Time (6 Tables)](#sub-system-4-attendance-leave--time-management)
7. [Sub-System 5: Performance, OKRs & Career (9 Tables)](#sub-system-5-performance-okrs--career-development)
8. [Sub-System 6: Training & Skill Development (4 Tables)](#sub-system-6-training--skill-development)
9. [Sub-System 7: Employee Relations (7 Tables)](#sub-system-7-employee-relations)
10. [Sub-System 8: Exit, Offboarding & Compliance (6 Tables)](#sub-system-8-exit-offboarding--compliance)
11. [Common Enums & Types](#common-enums--types)
12. [Indexes & Performance](#indexes--performance)

---

## Schema Overview

### Database Architecture

| Database       | Purpose                                                                | Tables                                                               |
| -------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **PostgreSQL** | All HR data including documents, relational data, reporting, analytics | employees, forms, workflows, payroll, attendance, structured queries |
| **Qdrant**     | Vector embeddings for semantic search                                  | N/A (AI/ML purposes)                                                 |

### Naming Conventions

- **Collections:** `hr_{entity_name}` (e.g., `hr_employees`, `hr_leave_requests`)
- **Fields:** snake_case (e.g., `employee_id`, `created_at`)
- **Foreign Keys:** `{entity}_id` (e.g., `employee_id`, `department_id`)
- **Enums:** UPPER_SNAKE_CASE values

---

## Core Employee Collections

### 1. employees (Master Employee Record)

**Database:** PostgreSQL  
**Description:** Central employee registry with all core data

```sql
{
  _id: ObjectId("..."),

  // System Fields
  employee_id: "BLIH-EMP-000001",           // Unique employee identifier
  keycloak_user_id: "uuid",                 // SSO identity

  // Personal Information
  personal_info: {
    first_name: "Jane",
    last_name: "Smith",
    gender: "FEMALE",                       // Enum: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
    date_of_birth: ISODate("1990-05-15"),
    nationality: "Ethiopian",
    marital_status: "SINGLE",               // Enum: SINGLE, MARRIED, DIVORCED, WIDOWED

    contact: {
      personal_email: "jane@example.com",
      work_email: "jane.smith@blihmarketing.com",
      phone_primary: "+251911234567",
      phone_secondary: "+251922345678",
      emergency_contact: {
        name: "John Smith",
        relationship: "SPOUSE",            // Enum: PARENT, SPOUSE, SIBLING, FRIEND, OTHER
        phone: "+251933456789"
      }
    },

    address: {
      street: "Bole Road",
      city: "Addis Ababa",
      region: "Addis Ababa",
      country: "Ethiopia",
      postal_code: "1000"
    }
  },

  // Employment Information
  employment: {
    status: "ACTIVE",                       // Enum: ACTIVE, ON_PROBATION, SUSPENDED, TERMINATED, RESIGNED
    type: "FULL_TIME",                      // Enum: FULL_TIME, PART_TIME, CONTRACT, INTERN
    department_id: ObjectId("..."),
    position_id: ObjectId("..."),
    job_grade: "SENIOR",                    // Enum: JUNIOR, MID, SENIOR, LEAD, MANAGER, DIRECTOR, EXECUTIVE
    reporting_manager_id: ObjectId("..."),

    hire_date: ISODate("2026-02-01"),
    probation_end_date: ISODate("2026-04-01"),
    contract_expiry: null,                  // Null for permanent
    termination_date: null,

    work_location: "HYBRID",                // Enum: ON_SITE, REMOTE, HYBRID
    work_schedule: "STANDARD",            // Enum: STANDARD, SHIFT, FLEXIBLE
  },

  // Compensation & Payroll
  compensation: {
    basic_salary: 45000.00,                 // ETB
    currency: "ETB",

    allowances: [
      { type: "TRANSPORT", amount: 3000.00 },
      { type: "HOUSING", amount: 8000.00 },
      { type: "MOBILE", amount: 500.00 }
    ],

    gross_salary: 56500.00,                 // Calculated

    bank_details: {
      account_name: "Jane Smith",
      bank_name: "CBE",                     // Enum: CBE, AWASH, DASHEN, etc.
      account_number: "1000123456789",
      branch_code: "001"
    },

    payroll_cycle: "MONTHLY",               // Enum: MONTHLY, BI_WEEKLY
    tax_category: "A",                      // Ethiopian tax category
    pension_number: "PN12345678"
  },

  // Access & Security
  access: {
    system_email: "jane.smith@blihmarketing.com",
    access_level: "EMPLOYEE",               // Enum: EMPLOYEE, MANAGER, ADMIN, SUPER_ADMIN

    assigned_assets: [
      { asset_id: ObjectId("..."), type: "LAPTOP", serial: "SN123456", assigned_date: ISODate(...) }
    ],

    system_access: ["EMAIL", "CRM", "PROJECTS", "HR_PORTAL"],

    permissions: [
      { module: "HR", resource: "leave", actions: ["view", "create", "edit"] }
    ]
  },

  // Lifecycle Tracking
  lifecycle: {
    leave_balance: {
      annual: { entitled: 20, used: 5, remaining: 15 },
      sick: { entitled: 10, used: 0, remaining: 10 },
      emergency: { entitled: 5, used: 0, remaining: 5 }
    },

    disciplinary_flags: 0,
    performance_score: 4.2,

    renewal_alerts: [
      { type: "CONTRACT", due_date: ISODate("2027-02-01"), days_remaining: 365 }
    ]
  },

  // Documents
  documents: [
    {
      document_id: ObjectId("..."),
      type: "CONTRACT",                     // Enum: CONTRACT, ID, CERTIFICATE, MEDICAL, RESUME, POLICY_ACK
      file_url: "/storage/docs/contract_001.pdf",
      uploaded_at: ISODate("2026-02-01"),
      expiry_date: null,
      verified: true
    }
  ],

  // Metadata
  created_at: ISODate("2026-02-01T09:00:00Z"),
  updated_at: ISODate("2026-02-15T14:30:00Z"),
  created_by: ObjectId("..."),              // HR admin
  updated_by: ObjectId("..."),

  // Soft Delete
  deleted_at: null,
  deleted_by: null,
  is_deleted: false
}
```

**Indexes:**

```javascript
db.hr_employees.createIndex({ employee_id: 1 }, { unique: true });
db.hr_employees.createIndex({ keycloak_user_id: 1 }, { unique: true });
db.hr_employees.createIndex(
  { 'personal_info.work_email': 1 },
  { unique: true, sparse: true },
);
db.hr_employees.createIndex({
  'employment.status': 1,
  'employment.department_id': 1,
});
db.hr_employees.createIndex({ 'employment.reporting_manager_id': 1 });
db.hr_employees.createIndex({
  'personal_info.last_name': 1,
  'personal_info.first_name': 1,
});
db.hr_employees.createIndex({ is_deleted: 1 });
```

---

## Sub-System 1: Recruitment & Hiring

### 2. hr_recruitment_requests

```javascript
{
  _id: ObjectId("..."),
  request_id: "REQ-2026-015",               // Format: REQ-{YYYY}-{NNN}

  // Request Info
  position: {
    job_name: "Senior Backend Engineer",
    team_id: ObjectId("..."),
    supervisor_id: ObjectId("..."),
    type: "NEW",                            // Enum: NEW, REPLACEMENT
    replacement_employee_id: null,            // If type=REPLACEMENT
  },

  rationale: {
    motivation: "EXPANSION",                // Enum: EXPANSION, REPLACEMENT, NEW_OFFERING, SUCCESSION
    role_overview: "Responsible for API development...",
    organizational_impact: "Enable scaling of platform..."
  },

  staffing: {
    current_count: 5,
    needed_count: 6,
    salary_bracket_min: 40000,
    salary_bracket_max: 60000,
    currency: "ETB",
    additional_perks: ["HEALTH_INSURANCE", "TRANSPORT"]
  },

  schedule: {
    target_join_date: ISODate("2026-04-01"),
    priority: "HIGH",                       // Enum: LOW, MEDIUM, HIGH, URGENT
  },

  // Workflow
  submitted_by: ObjectId("..."),            // Team Lead
  submitted_at: ISODate("2026-02-01T10:00:00Z"),

  approvals: [
    {
      level: 1,
      role: "FINANCE_LEAD",
      approver_id: ObjectId("..."),
      status: "APPROVED",                   // Enum: PENDING, APPROVED, REJECTED, CHANGES_REQUESTED
      decision: "APPROVE",
      comments: "Budget available",
      acted_at: ISODate("2026-02-01T14:00:00Z")
    },
    {
      level: 2,
      role: "CEO",
      approver_id: ObjectId("..."),
      status: "APPROVED",
      decision: "APPROVE",
      comments: "Proceed with posting",
      acted_at: ISODate("2026-02-02T09:00:00Z")
    }
  ],

  status: "COMPLETED",                      // Enum: DRAFT, PENDING, APPROVED, REJECTED, COMPLETED

  // References
  linked_job_posting_id: ObjectId("..."),   // Once created
  linked_employee_id: ObjectId("..."),    // Once hired

  created_at: ISODate("2026-02-01T10:00:00Z"),
  updated_at: ISODate("2026-02-02T09:00:00Z")
}
```

**Indexes:**

```javascript
db.hr_recruitment_requests.createIndex({ request_id: 1 }, { unique: true });
db.hr_recruitment_requests.createIndex({ 'position.team_id': 1, status: 1 });
db.hr_recruitment_requests.createIndex({
  'approvals.approver_id': 1,
  'approvals.status': 1,
});
db.hr_recruitment_requests.createIndex({ created_at: -1 });
```

---

### 3. hr_job_postings

```javascript
{
  _id: ObjectId("..."),
  posting_id: "POST-2026-012",

  // Link to Request
  recruitment_request_id: ObjectId("..."),

  // Position Details
  position: {
    job_name: "Senior Backend Engineer",
    team_id: ObjectId("..."),
    work_type: "FULL_TIME",                  // Enum: FULL_TIME, PART_TIME, CONTRACT
    work_mode: "HYBRID",                    // Enum: ON_SITE, REMOTE, HYBRID
  },

  // Content
  description: {
    synopsis: "We're looking for an experienced backend engineer...",
    duties: [
      "Design and implement RESTful APIs",
      "Optimize database queries",
      "Mentor junior developers"
    ],
    qualifications: [
      "5+ years of experience",
      "Proficiency in Node.js or Python",
      "Experience with PostgreSQL and advanced database concepts"
    ]
  },

  prerequisites: {
    education: "Bachelor's in Computer Science or equivalent",
    experience_years: 5,
    languages: ["English"],
    tech_skills: ["Node.js", "Python", "PostgreSQL", "Docker", "Kubernetes"]
  },

  kpis: [
    { metric: "API response time", target: "< 200ms" },
    { metric: "Code review participation", target: "100%" }
  ],

  // Distribution
  platforms: ["COMPANY_SITE", "LINKEDIN", "TELEGRAM"],
  external_urls: {
    company_site: "https://blihmarketing.com/careers/senior-backend-engineer",
    linkedin: "https://linkedin.com/jobs/view/..."
  },

  // Status
  status: "ACTIVE",                         // Enum: DRAFT, ACTIVE, PAUSED, CLOSED, FILLED

  // Dates
  posted_at: ISODate("2026-02-03T08:00:00Z"),
  expires_at: ISODate("2026-03-03T23:59:59Z"),
  closed_at: null,

  // Approvals
  approved_by: [ObjectId("..."), ObjectId("...")], // Team Lead, CEO

  // Knowledge Base
  archived_in_kb: true,
  kb_document_id: ObjectId("..."),

  created_at: ISODate("2026-02-02T10:00:00Z"),
  updated_at: ISODate("2026-02-03T08:00:00Z")
}
```

---

### 4. hr_candidates

```javascript
{
  _id: ObjectId("..."),
  candidate_id: "CAND-2026-1042",

  // Source
  job_posting_id: ObjectId("..."),
  source: "LINKEDIN",                       // Enum: COMPANY_SITE, LINKEDIN, TELEGRAM, REFERRAL, AGENCY
  referral_employee_id: null,

  // Personal Info
  personal_info: {
    first_name: "Alex",
    last_name: "Johnson",
    gender: "MALE",
    date_of_birth: ISODate("1988-03-20"),
    email: "alex.johnson@email.com",
    phone: "+251944556677",
    location: "Addis Ababa, Ethiopia"
  },

  // Career Data
  career: {
    education: [
      {
        institution: "Addis Ababa University",
        degree: "BSc Computer Science",
        year_completed: 2010
      }
    ],
    work_history: [
      {
        company: "TechCorp",
        position: "Backend Developer",
        duration: "2018-2023",
        description: "Developed microservices architecture..."
      }
    ],
    skills: ["Node.js", "Python", "AWS", "Kubernetes"],

    resume_url: "/storage/resumes/alex_johnson.pdf",
    portfolio_url: "https://alexjohnson.dev",
    linkedin_url: "https://linkedin.com/in/alexjohnson"
  },

  // Role-Specific Responses
  application_responses: {
    relevant_experience: "8 years building scalable APIs...",
    anticipated_obstacles: "Understanding domain-specific requirements...",
    blih_knowledge: "BLIH is a marketing agency focusing on...",
    potential_contributions: "Bring expertise in microservices...",
    salary_expectation: 55000,
    availability: "2 weeks",
    motivation: "Excited about the tech stack and growth opportunities...",
    self_introduction: "I'm a passionate backend engineer..."
  },

  // Pipeline Status
  status: "INTERVIEW_STAGE",                // Enum: NEW, SCREENING, SHORTLISTED, INTERVIEW_STAGE, OFFER_PENDING, HIRED, REJECTED, WITHDRAWN

  pipeline: {
    applied_at: ISODate("2026-02-05T11:30:00Z"),
    screened_at: ISODate("2026-02-06T09:00:00Z"),
    screened_by: ObjectId("..."),
    screening_score: 4.5,

    interviews: [
      {
        round: 1,
        type: "TECHNICAL",
        scheduled_at: ISODate("2026-02-10T14:00:00Z"),
        interviewers: [ObjectId("..."), ObjectId("...")],
        feedback_id: ObjectId("..."),
        average_score: 4.2,
        recommendation: "PROCEED"
      }
    ],

    offer_extended_at: null,
    hired_at: null
  },

  // Rejection (if applicable)
  rejection: {
    rejected_at: null,
    rejected_by: null,
    reason: null,
    notification_sent: false
  },

  created_at: ISODate("2026-02-05T11:30:00Z"),
  updated_at: ISODate("2026-02-10T16:00:00Z")
}
```

**Indexes:**

```javascript
db.hr_candidates.createIndex({ candidate_id: 1 }, { unique: true });
db.hr_candidates.createIndex({ 'personal_info.email': 1 });
db.hr_candidates.createIndex({ job_posting_id: 1, status: 1 });
db.hr_candidates.createIndex({ 'pipeline.screening_score': -1 });
db.hr_candidates.createIndex({ status: 1, 'pipeline.applied_at': -1 });
```

---

### 5. hr_cv_screenings

```javascript
{
  _id: ObjectId("..."),

  candidate_id: ObjectId("..."),
  job_posting_id: ObjectId("..."),

  // Screening Data
  assessments: [
    {
      factor: "QUALIFICATIONS",
      importance: "HIGH",                   // Enum: LOW, MEDIUM, HIGH, CRITICAL
      rating: 4,                          // 1-5 scale
      notes: "Strong CS background from top university"
    },
    {
      factor: "RELEVANT_EXPERIENCE",
      importance: "CRITICAL",
      rating: 5,
      notes: "8 years directly relevant experience"
    },
    {
      factor: "TECHNICAL_ABILITIES",
      importance: "CRITICAL",
      rating: 4,
      notes: "Good tech stack match"
    },
    {
      factor: "SECTOR_COMPATIBILITY",
      importance: "MEDIUM",
      rating: 3,
      notes: "Some marketing industry exposure"
    },
    {
      factor: "WRITTEN_EXPRESSION",
      importance: "MEDIUM",
      rating: 4,
      notes: "Clear, professional communication"
    }
  ],

  // Calculated
  aggregate_rating: 4.0,                    // Weighted average

  // Decision
  recommendation: "SELECT",                 // Enum: SELECT, PAUSE, DECLINE
  observations: "Strong candidate, proceed to interview",

  next_phase: "INTERVIEW",                // Enum: INTERVIEW, DECLINE, RESERVE_POOL

  // Workflow
  screened_by: ObjectId("..."),
  screened_at: ISODate("2026-02-06T09:15:00Z"),

  approved_by: ObjectId("..."),             // Team Lead
  approved_at: ISODate("2026-02-06T14:00:00Z"),

  // Actions
  interview_scheduled: true,
  interview_id: ObjectId("..."),

  rejection_sent: false,
  rejection_sent_at: null,

  created_at: ISODate("2026-02-06T09:15:00Z"),
  updated_at: ISODate("2026-02-06T14:00:00Z")
}
```

---

### 6. hr_interview_feedback

```javascript
{
  _id: ObjectId("..."),

  candidate_id: ObjectId("..."),
  interview_round: 1,
  interview_type: "TECHNICAL",              // Enum: HR_SCREENING, TECHNICAL, BEHAVIORAL, PANEL, FINAL

  // Interview Details
  scheduled_at: ISODate("2026-02-10T14:00:00Z"),
  completed_at: ISODate("2026-02-10T15:30:00Z"),

  interviewers: [
    {
      employee_id: ObjectId("..."),
      name: "Michael Chen",
      role: "Lead Developer"
    },
    {
      employee_id: ObjectId("..."),
      name: "Sarah Johnson",
      role: "HR Manager"
    }
  ],

  // Ratings (1-5 scale)
  ratings: {
    technical_proficiency: { score: 5, notes: "Excellent problem-solving skills" },
    analytical_skills: { score: 4, notes: "Good approach to complex problems" },
    communication: { score: 4, notes: "Clear and articulate" },
    teamwork: { score: 5, notes: "Strong collaborative examples" },
    organizational_fit: { score: 4, notes: "Aligns with company values" },
    poise_demeanor: { score: 5, notes: "Professional and confident"
  },

  total_rating: 4.5,                      // Average of all ratings

  // Overall
  endorsement: "STRONG_YES",                // Enum: STRONG_YES, YES, UNCERTAIN, NO
  remarks: "Exceptional candidate, highly recommend for hire",

  next_action: "OFFER",                   // Enum: FOLLOW_UP_INTERVIEW, ASSIGNMENT, OFFER, DECLINE

  // Compiled by HR
  compiled_by: ObjectId("..."),
  compiled_at: ISODate("2026-02-10T16:00:00Z"),

  // Ranking (if multiple candidates)
  ranking: 1,                               // 1 = top candidate

  created_at: ISODate("2026-02-10T15:30:00Z"),
  updated_at: ISODate("2026-02-10T16:00:00Z")
}
```

---

### 7. hr_hiring_decisions

```javascript
{
  _id: ObjectId("..."),
  decision_id: "DEC-2026-008",

  // References
  candidate_id: ObjectId("..."),
  recruitment_request_id: ObjectId("..."),
  job_posting_id: ObjectId("..."),

  // Candidate Info
  candidate_summary: {
    name: "Alex Johnson",
    position: "Senior Backend Engineer",
    team_id: ObjectId("..."),
    candidate_id: "CAND-2026-1042"
  },

  // Offer Details
  offer: {
    total_pay: 55000,
    currency: "ETB",
    perks: ["HEALTH_INSURANCE", "TRANSPORT", "MOBILE"],
    probation_period_days: 60,
    target_start_date: ISODate("2026-03-01"),
    work_type: "FULL_TIME"
  },

  // Rationale
  selection_reasoning: "Top performer in interviews, excellent technical skills, good cultural fit",
  key_assets: ["8 years experience", "Strong Node.js background", "Leadership potential"],

  // Supporting Files
  attachments: [
    { type: "RESUME", file_url: "/storage/...", uploaded_at: ISODate(...) },
    { type: "FEEDBACK", file_url: "/storage/...", uploaded_at: ISODate(...) },
    { type: "ASSESSMENT", file_url: "/storage/...", uploaded_at: ISODate(...) }
  ],

  // Workflow
  submitted_by: ObjectId("..."),
  submitted_at: ISODate("2026-02-12T10:00:00Z"),

  approvals: [
    {
      level: 1,
      role: "FINANCE_LEAD",
      approver_id: ObjectId("..."),
      status: "APPROVED",
      decision: "APPROVE",
      comments: "Within budget, approve",
      acted_at: ISODate("2026-02-12T14:00:00Z")
    },
    {
      level: 2,
      role: "CEO",
      approver_id: ObjectId("..."),
      status: "APPROVED",
      decision: "APPROVE",
      comments: "Welcome aboard Alex!",
      acted_at: ISODate("2026-02-13T09:00:00Z")
    }
  ],

  final_decision: "OFFER_APPROVED",       // Enum: OFFER_APPROVED, OFFER_DECLINED, SUSPENDED

  // Post-Approval Actions
  offer_document_generated: true,
  offer_document_url: "/storage/offers/offer_alex_johnson.pdf",
  candidate_notified_at: ISODate("2026-02-13T10:00:00Z"),

  // Result
  offer_accepted: true,
  accepted_at: ISODate("2026-02-14T08:30:00Z"),

  employee_created: true,
  employee_id: ObjectId("..."),
  onboarding_initiated: true,
  onboarding_id: ObjectId("..."),

  created_at: ISODate("2026-02-12T10:00:00Z"),
  updated_at: ISODate("2026-02-14T08:30:00Z")
}
```

---

## Sub-System 2: Onboarding & Probation

### 8. hr_onboarding_checklists

```javascript
{
  _id: ObjectId("..."),
  checklist_id: "ONB-2026-015",

  // Employee Reference
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  position: "Senior Backend Engineer",
  team_id: ObjectId("..."),
  join_date: ISODate("2026-03-01"),
  overseer_id: ObjectId("..."),

  // Checklist Items by Department
  hr_duties: [
    { item: "Agreement Executed", status: "COMPLETED", completed_at: ISODate("2026-02-28"), completed_by: ObjectId("...") },
    { item: "Identification Secured", status: "COMPLETED", completed_at: ISODate("2026-02-28"), completed_by: ObjectId("...") },
    { item: "Backup Contact Recorded", status: "COMPLETED", completed_at: ISODate("2026-02-28"), completed_by: ObjectId("...") },
    { item: "Policies Distributed", status: "COMPLETED", completed_at: ISODate("2026-02-28"), completed_by: ObjectId("...") },
    { item: "Orientation Agenda Shared", status: "PENDING", due_date: ISODate("2026-03-01"), assigned_to: ObjectId("...") }
  ],

  it_duties: [
    { item: "Email Setup", status: "COMPLETED", completed_at: ISODate("2026-02-28"), completed_by: ObjectId("...") },
    { item: "Platform Permissions Granted", status: "IN_PROGRESS", due_date: ISODate("2026-03-01"), assigned_to: ObjectId("...") },
    { item: "Applications Allocated", status: "PENDING", due_date: ISODate("2026-03-01"), assigned_to: ObjectId("...") }
  ],

  admin_duties: [
    { item: "Station Readied", status: "COMPLETED", completed_at: ISODate("2026-02-28"), completed_by: ObjectId("...") },
    { item: "Entry Pass Issued", status: "PENDING", due_date: ISODate("2026-03-01"), assigned_to: ObjectId("...") },
    { item: "Equipment Delivered", status: "IN_PROGRESS", due_date: ISODate("2026-03-01"), assigned_to: ObjectId("...") }
  ],

  team_duties: [
    { item: "Group Introduction", status: "SCHEDULED", scheduled_for: ISODate("2026-03-01T09:00:00Z"), assigned_to: ObjectId("...") },
    { item: "Learning/Observation Schedule", status: "PENDING", due_date: ISODate("2026-03-03"), assigned_to: ObjectId("...") },
    { item: "Initial Assignments", status: "PENDING", due_date: ISODate("2026-03-05"), assigned_to: ObjectId("...") }
  ],

  // Progress
  total_items: 14,
  completed_items: 5,
  in_progress_items: 2,
  pending_items: 7,
  completion_percentage: 35.7,

  // Approvals
  team_lead_verified: false,
  team_lead_verified_at: null,

  ceo_sign_off_required: true,              // For senior positions
  ceo_sign_off: false,
  ceo_sign_off_at: null,

  // Status
  status: "IN_PROGRESS",                  // Enum: NOT_STARTED, IN_PROGRESS, COMPLETED, OVERDUE

  created_at: ISODate("2026-02-28T10:00:00Z"),
  updated_at: ISODate("2026-02-28T16:00:00Z")
}
```

---

### 9. hr_new_hire_profiles

```javascript
{
  _id: ObjectId("..."),
  profile_id: "NHP-2026-015",

  // Link to Hiring Decision
  hiring_decision_id: ObjectId("..."),

  // Core Data
  core_data: {
    full_name: "Alex Johnson",
    gender: "MALE",
    date_of_birth: ISODate("1988-03-20"),
    contacts: {
      email: "alex.johnson@blihmarketing.com",
      phone: "+251944556677"
    },
    location: {
      city: "Addis Ababa",
      country: "Ethiopia"
    }
  },

  // Work Data
  work_data: {
    role: "Senior Backend Engineer",
    team_id: ObjectId("..."),
    supervisor_id: ObjectId("..."),
    compensation: {
      basic: 55000,
      currency: "ETB",
      perks: ["HEALTH_INSURANCE", "TRANSPORT"]
    },
    join_date: ISODate("2026-03-01"),
    work_type: "FULL_TIME"
  },

  // Documents
  documents: [
    { type: "RESUME", file_url: "/storage/...", uploaded_at: ISODate(...) },
    { type: "ID", file_url: "/storage/...", uploaded_at: ISODate(...) },
    { type: "AGREEMENT", file_url: "/storage/...", uploaded_at: ISODate(...) },
    { type: "QUALIFICATIONS", file_url: "/storage/...", uploaded_at: ISODate(...) }
  ],

  // System Account
  employee_id_generated: "BLIH-EMP-000045",
  account_created: true,
  account_created_at: ISODate("2026-02-28T12:00:00Z"),

  // Workflow
  submitted_by: ObjectId("..."),
  submitted_at: ISODate("2026-02-28T10:00:00Z"),

  approved_by: ObjectId("..."),             // HR Lead
  approved_at: ISODate("2026-02-28T14:00:00Z"),

  // Sync Status
  synced_to_finance: true,
  synced_to_finance_at: ISODate("2026-02-28T14:30:00Z"),

  synced_to_it: true,
  synced_to_it_at: ISODate("2026-02-28T14:30:00Z"),

  synced_to_projects: true,
  synced_to_projects_at: ISODate("2026-02-28T14:30:00Z"),

  created_at: ISODate("2026-02-28T10:00:00Z"),
  updated_at: ISODate("2026-02-28T14:30:00Z")
}
```

---

### 10. hr_asset_provisioning

```javascript
{
  _id: ObjectId("..."),
  provisioning_id: "AST-2026-045",

  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  team_id: ObjectId("..."),
  role: "Senior Backend Engineer",

  // Equipment Allocated
  equipment: [
    {
      item: "MacBook Pro 16-inch",
      asset_id: "LAPTOP-2026-128",
      serial_number: "SN-C02XL0DGJHD3",
      status: "ALLOCATED",                  // Enum: ALLOCATED, PENDING, RETURNED, DAMAGED
      allocated_at: ISODate("2026-03-01T09:00:00Z"),
      returned_at: null,
      condition_notes: "New, in box"
    },
    {
      item: "iPhone 15 Pro",
      asset_id: "PHONE-2026-089",
      serial_number: "SN-FL9X2L8H4JK3",
      status: "ALLOCATED",
      allocated_at: ISODate("2026-03-01T09:00:00Z"),
      returned_at: null,
      condition_notes: "New"
    },
    {
      item: "Monitor 27-inch",
      asset_id: "MONITOR-2026-234",
      serial_number: "SN-DELL-9876543",
      status: "PENDING",
      estimated_delivery: ISODate("2026-03-03"),
      condition_notes: "Ordered, pending delivery"
    }
  ],

  // Platform Permissions
  platform_permissions: {
    email_storage: { granted: true, account_created: ISODate("2026-02-28") },
    hr_portal: { granted: true, access_level: "EMPLOYEE" },
    projects_platform: { granted: true, role: "DEVELOPER" },
    crm: { granted: false, reason: "Not required for role" },
    creative_apps: { granted: false, reason: "Not required for role" },
    other: ["GitHub Enterprise", "AWS Console", "Docker Hub"]
  },

  // Approvals
  it_supervisor_approved: true,
  it_supervisor_approved_at: ISODate("2026-02-28T11:00:00Z"),
  it_supervisor_id: ObjectId("..."),

  admin_approved: true,
  admin_approved_at: ISODate("2026-02-28T13:00:00Z"),
  admin_id: ObjectId("..."),

  finance_approval_required: false,         // Only if total value > threshold

  // Status
  status: "COMPLETED",                    // Enum: PENDING, IN_PROGRESS, COMPLETED, PARTIAL

  created_at: ISODate("2026-02-28T10:00:00Z"),
  updated_at: ISODate("2026-03-01T09:00:00Z")
}
```

---

### 11. hr_policy_acknowledgements

```javascript
{
  _id: ObjectId("..."),
  acknowledgement_id: "PA-2026-045",

  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  team_id: ObjectId("..."),
  role: "Senior Backend Engineer",

  // Policies Acknowledged
  policies: [
    {
      policy_id: ObjectId("..."),
      policy_name: "Code of Conduct",
      policy_version: "3.2",
      acknowledged: true,
      acknowledged_at: ISODate("2026-03-01T10:30:00Z"),
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0..."
    },
    {
      policy_id: ObjectId("..."),
      policy_name: "Time and Attendance Policy",
      policy_version: "2.1",
      acknowledged: true,
      acknowledged_at: ISODate("2026-03-01T10:32:00Z"),
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0..."
    },
    {
      policy_id: ObjectId("..."),
      policy_name: "IT and Security Policy",
      policy_version: "4.0",
      acknowledged: true,
      acknowledged_at: ISODate("2026-03-01T10:35:00Z"),
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0..."
    },
    {
      policy_id: ObjectId("..."),
      policy_name: "Leave Policy",
      policy_version: "2.5",
      acknowledged: true,
      acknowledged_at: ISODate("2026-03-01T10:38:00Z"),
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0..."
    },
    {
      policy_id: ObjectId("..."),
      policy_name: "Privacy Policy",
      policy_version: "3.0",
      acknowledged: true,
      acknowledged_at: ISODate("2026-03-01T10:40:00Z"),
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0..."
    },
    {
      policy_id: ObjectId("..."),
      policy_name: "Anti-Harassment Policy",
      policy_version: "2.0",
      acknowledged: true,
      acknowledged_at: ISODate("2026-03-01T10:42:00Z"),
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0..."
    },
    {
      policy_id: ObjectId("..."),
      policy_name: "Data Security Policy",
      policy_version: "3.1",
      acknowledged: true,
      acknowledged_at: ISODate("2026-03-01T10:45:00Z"),
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0..."
    }
  ],

  all_acknowledged: true,

  // Confirmation
  confirmation_statement: "I acknowledge and comprehend all policies",
  confirmed_at: ISODate("2026-03-01T10:45:00Z"),

  // Access Activation
  system_access_granted: true,
  access_granted_at: ISODate("2026-03-01T10:46:00Z"),

  // Verification
  verified_by: ObjectId("..."),             // HR
  verified_at: ISODate("2026-03-01T11:00:00Z"),

  // Audit
  created_at: ISODate("2026-03-01T10:30:00Z"),
  updated_at: ISODate("2026-03-01T11:00:00Z")
}
```

---

### 12. hr_probation_kpi_plans

```javascript
{
  _id: ObjectId("..."),
  plan_id: "KPI-2026-045",

  // Employee
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  supervisor_id: ObjectId("..."),
  team_id: ObjectId("..."),
  position: "Senior Backend Engineer",

  // Timeline
  probation_start: ISODate("2026-03-01"),
  probation_end: ISODate("2026-04-30"),     // 60 days

  // Goals (3-5 goals)
  goals: [
    {
      goal_id: "G1",
      goal: "Complete system architecture documentation",
      measure: "Number of modules documented",
      target_value: "5 modules",
      importance_percentage: 25,
      notes: "Focus on core API services"
    },
    {
      goal_id: "G2",
      goal: "Deliver first feature independently",
      measure: "Feature completion and deployment",
      target_value: "1 production feature",
      importance_percentage: 30,
      notes: "User authentication enhancement"
    },
    {
      goal_id: "G3",
      goal: "Code review participation",
      measure: "Reviews completed per week",
      target_value: "Minimum 3 per week",
      importance_percentage: 20,
      notes: "Provide constructive feedback"
    },
    {
      goal_id: "G4",
      goal: "Team collaboration and knowledge sharing",
      measure: "Technical presentations/KT sessions",
      target_value: "1 session",
      importance_percentage: 25,
      notes: "Share expertise with team"
    }
  ],

  // Development Path
  development: {
    scheduled_sessions: [
      { type: "1-on-1", with: "Supervisor", frequency: "Weekly" },
      { type: "Technical Review", with: "Tech Lead", frequency: "Bi-weekly" }
    ],
    mentor_assigned: ObjectId("..."),
    mentor_name: "Senior Developer X",
    milestones: [
      { name: "30-Day Check-in", date: ISODate("2026-03-31"), type: "CHECKPOINT" },
      { name: "55-Day Evaluation", date: ISODate("2026-04-25"), type: "EVALUATION" },
      { name: "60-Day Decision", date: ISODate("2026-04-30"), type: "DECISION" }
    ]
  },

  // Notifications
  day_30_alert_sent: false,
  day_55_alert_sent: false,
  day_60_alert_sent: false,

  // Endorsements
  employee_endorsed: true,
  employee_endorsed_at: ISODate("2026-03-03T14:00:00Z"),

  supervisor_endorsed: true,
  supervisor_endorsed_at: ISODate("2026-03-03T15:00:00Z"),

  hr_endorsed: true,
  hr_endorsed_at: ISODate("2026-03-04T10:00:00Z"),

  // Status
  status: "ACTIVE",                       // Enum: DRAFT, ACTIVE, COMPLETED, CANCELLED

  created_at: ISODate("2026-03-03T09:00:00Z"),
  updated_at: ISODate("2026-03-04T10:00:00Z")
}
```

---

### 13. hr_probation_evaluations

```javascript
{
  _id: ObjectId("..."),
  evaluation_id: "EVAL-2026-045",

  // Link to Plan
  kpi_plan_id: ObjectId("..."),

  // Employee
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  position: "Senior Backend Engineer",

  // Evaluation Round (30-day, 55-day, or 60-day)
  evaluation_round: "DAY_60_FINAL",
  evaluation_date: ISODate("2026-04-30"),

  // Goal Review
  goal_reviews: [
    {
      goal_id: "G1",
      goal: "Complete system architecture documentation",
      outcome: "Completed 6 modules, exceeded target",
      rating: 5,                            // 1-5
      remark: "Excellent documentation quality"
    },
    {
      goal_id: "G2",
      goal: "Deliver first feature independently",
      outcome: "Successfully deployed auth enhancement",
      rating: 5,
      remark: "Delivered ahead of schedule"
    },
    {
      goal_id: "G3",
      goal: "Code review participation",
      outcome: "Averaged 4 reviews per week",
      rating: 4,
      remark: "Consistent participation"
    },
    {
      goal_id: "G4",
      goal: "Team collaboration and knowledge sharing",
      outcome: "Conducted 2 KT sessions",
      rating: 5,
      remark: "Proactive knowledge sharing"
    }
  ],

  // Conduct & Ethics (1-5 ratings)
  conduct: {
    timekeeping: { score: 5, notes: "Always punctual" },
    collaboration: { score: 5, notes: "Excellent team player" },
    drive: { score: 5, notes: "Highly motivated and proactive" },
    communication: { score: 4, notes: "Clear and professional" }
  },

  average_rating: 4.6,                      // Calculated

  // Supervisor Overview
  supervisor_assessment: {
    assets: ["Strong technical skills", "Quick learner", "Good team fit"],
    improvements: ["Can deepen domain knowledge", "Continue building stakeholder relationships"],
    recommendation: "CONFIRM"              // Enum: CONFIRM, EXTEND, TERMINATE
  },

  // HR Assessment
  hr_remarks: "Strong performance throughout probation period",
  hr_verdict: "CONFIRM",

  // Approvals
  employee_acknowledged: true,
  employee_acknowledged_at: ISODate("2026-04-30T14:00:00Z"),

  supervisor_approved: true,
  supervisor_approved_at: ISODate("2026-04-30T15:00:00Z"),
  supervisor_id: ObjectId("..."),

  hr_approved: true,
  hr_approved_at: ISODate("2026-05-01T10:00:00Z"),
  hr_id: ObjectId("..."),

  ceo_approved: true,                       // For senior positions
  ceo_approved_at: ISODate("2026-05-01T11:00:00Z"),
  ceo_id: ObjectId("..."),

  // Result
  final_decision: "CONFIRMED",              // Enum: CONFIRMED, EXTENDED, TERMINATED

  // If Extended
  extension_days: null,
  new_end_date: null,
  extension_reason: null,

  // System Updates
  employee_status_updated: true,
  status_updated_at: ISODate("2026-05-01T12:00:00Z"),

  created_at: ISODate("2026-04-30T09:00:00Z"),
  updated_at: ISODate("2026-05-01T12:00:00Z")
}
```

---

### 14. hr_probation_confirmations

```javascript
{
  _id: ObjectId("..."),
  confirmation_id: "CONF-2026-045",

  // Employee
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  role: "Senior Backend Engineer",
  team_id: ObjectId("..."),
  start_date: ISODate("2026-03-01"),

  // Review Overview
  review_summary: {
    goal_rating_average: 4.75,
    time_and_attendance_score: 5,
    conduct_score: 4.6,
    overall_fit_score: 5,
    general_remarks: "Exceeded expectations in all areas"
  },

  // Verdict
  verdict: "CONFIRM",                       // Enum: CONFIRM, EXTEND, TERMINATE

  // If Extended
  extension: {
    extended: false,
    extension_days: null,
    new_end_date: null,
    conditions: null
  },

  // If Terminated
  termination: {
    terminated: false,
    termination_date: null,
    termination_reason: null,
    severance_details: null
  },

  // If Confirmed
  confirmation: {
    confirmed: true,
    confirmed_effective_date: ISODate("2026-05-01"),
    confirmation_letter_generated: true,
    confirmation_letter_url: "/storage/letters/confirmation_alex.pdf",
    status_updated_to: "ACTIVE"
  },

  // Approvals
  hr_checked: true,
  hr_checked_at: ISODate("2026-05-01T10:00:00Z"),
  hr_id: ObjectId("..."),

  ceo_sign_off: true,
  ceo_sign_off_at: ISODate("2026-05-01T11:00:00Z"),
  ceo_id: ObjectId("..."),

  // Notifications
  employee_notified: true,
  notified_at: ISODate("2026-05-01T12:00:00Z"),
  notification_method: "EMAIL",

  // Archive
  archived_in_employee_file: true,
  archived_at: ISODate("2026-05-01T12:00:00Z"),

  created_at: ISODate("2026-04-30T09:00:00Z"),
  updated_at: ISODate("2026-05-01T12:00:00Z")
}
```

---

## Sub-System 3: Employee Profiles & Records

### 15. hr_job_descriptions

```javascript
{
  _id: ObjectId("..."),
  jd_id: "JD-ENG-001",

  // Position Info
  position: {
    team_id: ObjectId("..."),
    title: "Senior Backend Engineer",
    level: "SENIOR",                        // Enum: JUNIOR, MID, SENIOR, LEAD, PRINCIPAL
    supervisor_level: "TEAM_LEAD",
    code: "ENG-BE-SR-001"
  },

  // Content
  description: {
    summary: "Responsible for designing and implementing scalable backend services...",
    duties: [
      "Design RESTful APIs and microservices",
      "Optimize database performance",
      "Implement security best practices",
      "Mentor junior developers",
      "Participate in code reviews"
    ],
    tools_and_tech: ["Node.js", "Python", "PostgreSQL", "Redis", "Docker", "Kubernetes"],
    work_hours: "40 hours/week, flexible timing",

    required_skills: [
      { skill: "Node.js or Python", level: "EXPERT" },
      { skill: "SQL and NoSQL databases", level: "ADVANCED" },
      { skill: "API design", level: "EXPERT" },
      { skill: "Git version control", level: "INTERMEDIATE" }
    ],

    preferred_skills: [
      { skill: "AWS/GCP/Azure", level: "INTERMEDIATE" },
      { skill: "Microservices architecture", level: "ADVANCED" },
      { skill: "GraphQL", level: "INTERMEDIATE" }
    ]
  },

  // KPIs
  kpis: [
    { title: "API Performance", metric: "Response time < 200ms", target: "95% of requests", frequency: "MONTHLY", weight: 25 },
    { title: "Code Quality", metric: "Test coverage", target: "> 80%", frequency: "MONTHLY", weight: 25 },
    { title: "Feature Delivery", metric: "On-time delivery", target: "90%", frequency: "QUARTERLY", weight: 25 },
    { title: "Team Contribution", metric: "Code reviews completed", target: "> 20/month", frequency: "MONTHLY", weight: 25 }
  ],

  // Skills Matrix
  skills_matrix: [
    { skill: "Communication", level_required: 4, description: "Clear technical communication" },
    { skill: "Ownership", level_required: 5, description: "Takes full responsibility for features" },
    { skill: "Teamwork", level_required: 4, description: "Collaborates effectively" },
    { skill: "Leadership", level_required: 3, description: "Mentors junior developers" }
  ],

  // System Links
  links: {
    team_goal_id: ObjectId("..."),
    okr_suggestions: ["Improve API performance", "Reduce technical debt"],
    review_form_template_id: ObjectId("...")
  },

  // Document
  document_url: "/storage/jd/senior_backend_engineer_v3.pdf",
  version: 3,
  effective_date: ISODate("2026-01-01"),

  // Approvals
  created_by: ObjectId("..."),
  approved_by: [ObjectId("..."), ObjectId("...")], // HR Supervisor, CEO

  // Archive in KB
  archived_in_kb: true,
  kb_document_id: ObjectId("..."),

  created_at: ISODate("2026-01-01T10:00:00Z"),
  updated_at: ISODate("2026-01-15T14:00:00Z")
}
```

---

### 16. hr_contracts

```javascript
{
  _id: ObjectId("..."),
  contract_id: "CONT-EMP-000045-001",

  // Employee
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  employee_id_short: "BLIH-EMP-000045",

  // Contract Info
  contract_type: "INITIAL",                 // Enum: INITIAL, RENEWAL, AMENDMENT, ADDENDUM
  contract_number: 1,                       // Sequence per employee

  // Dates
  start_date: ISODate("2026-03-01"),
  end_date: null,                           // Null for permanent
  duration_months: null,

  // Trial Period
  trial_period: {
    applies: true,
    duration_days: 60,
    start_date: ISODate("2026-03-01"),
    end_date: ISODate("2026-04-30"),
    confirmed: true,
    confirmed_at: ISODate("2026-05-01")
  },

  // Compensation
  compensation: {
    basic_salary: 55000,
    currency: "ETB",
    perks: ["HEALTH_INSURANCE", "TRANSPORT_ALLOWANCE", "MOBILE_ALLOWANCE"],
    work_hours_per_week: 40,
    overtime_policy: "PAID_1.5X",           // Paid at 1.5x rate
    leave_entitlement: {
      annual_days: 20,
      sick_days: 10,
      emergency_days: 5,
      maternity_days: 90,
      paternity_days: 5
    }
  },

  // Document
  contract_document_url: "/storage/contracts/alex_johnson_contract_001.pdf",
  signed_by_employee: true,
  employee_signed_at: ISODate("2026-02-28T15:00:00Z"),
  signed_by_company_rep: true,
  company_rep_id: ObjectId("..."),
  company_rep_signed_at: ISODate("2026-02-28T16:00:00Z"),

  // Status
  status: "ACTIVE",                         // Enum: DRAFT, ACTIVE, EXPIRED, TERMINATED, RENEWED

  // Alerts
  expiry_alert_30_sent: false,
  expiry_alert_60_sent: false,
  expiry_alert_90_sent: false,

  // Sync to Finance
  synced_to_finance: true,
  synced_at: ISODate("2026-02-28T17:00:00Z"),

  // Archive
  archived_in_kb: true,
  kb_document_id: ObjectId("..."),

  // Audit
  created_by: ObjectId("..."),
  approved_by: ObjectId("..."),

  created_at: ISODate("2026-02-28T10:00:00Z"),
  updated_at: ISODate("2026-05-01T12:00:00Z")
}
```

---

### 17. hr_salary_history

```javascript
{
  _id: ObjectId("..."),

  // Employee
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  employee_number: "BLIH-EMP-000045",
  role: "Senior Backend Engineer",
  team_id: ObjectId("..."),

  // Change Details
  change: {
    prior_salary: 45000,
    new_salary: 55000,
    difference: 10000,
    percentage_increase: 22.2,

    reason: "PROMOTION",                    // Enum: PROMOTION, INCREMENT, ADJUSTMENT, CORRECTION, MARKET_ADJUSTMENT
    effective_date: ISODate("2026-03-01"),

    description: "Promotion to Senior Backend Engineer",
    approved_by: [ObjectId("..."), ObjectId("...")] // HR, CEO
  },

  // Documents
  supporting_documents: [
    { type: "APPROVAL_DOCUMENT", url: "/storage/...", uploaded_at: ISODate(...) },
    { type: "PROMOTION_LETTER", url: "/storage/...", uploaded_at: ISODate(...) }
  ],

  // Workflow
  submitted_by: ObjectId("..."),
  submitted_at: ISODate("2026-02-25T10:00:00Z"),

  approved_by_finance_supervisor: ObjectId("..."),
  finance_approval_at: ISODate("2026-02-26T14:00:00Z"),

  approved_by_ceo: ObjectId("..."),
  ceo_approval_at: ISODate("2026-02-27T10:00:00Z"),

  // System Updates
  payroll_system_updated: true,
  payroll_updated_at: ISODate("2026-02-28T09:00:00Z"),

  employee_notified: true,
  employee_notified_at: ISODate("2026-02-28T10:00:00Z"),
  notification_method: "EMAIL",

  // Archive
  archived_in_employee_file: true,
  archived_at: ISODate("2026-02-28T10:00:00Z"),

  created_at: ISODate("2026-02-25T10:00:00Z"),
  updated_at: ISODate("2026-02-28T10:00:00Z")
}
```

**Indexes:**

```javascript
db.hr_salary_history.createIndex({
  employee_id: 1,
  'change.effective_date': -1,
});
db.hr_salary_history.createIndex({ 'change.reason': 1, created_at: -1 });
```

---

### 18. hr_document_updates

```javascript
{
  _id: ObjectId("..."),
  update_id: "DOCUP-2026-089",

  // Employee
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  employee_number: "BLIH-EMP-000045",
  team_id: ObjectId("..."),
  role: "Senior Backend Engineer",

  // Document Info
  document_type: "QUALIFICATION",           // Enum: ID_RENEW, QUALIFICATION, HEALTH_REPORT, ACADEMIC, WORK_SAMPLES, OTHER
  document_type_other: null,

  // Previous Document (if replacement)
  previous_document_id: ObjectId("..."),
  previous_document_archived: true,

  // New Document
  new_document: {
    file_url: "/storage/docs/alex_masters_certificate.pdf",
    file_name: "alex_masters_certificate.pdf",
    file_size_bytes: 1245678,
    mime_type: "application/pdf",

    issue_date: ISODate("2020-06-15"),
    expiry_date: null,                      // For permanent docs

    verified: true,
    verified_by: ObjectId("..."),
    verified_at: ISODate("2026-02-20T11:00:00Z"),

    // Expiry Alert (if applicable)
    expiry_alert_triggered: false,
    expiry_alert_date: null
  },

  // Description
  description: "Master's degree in Computer Science from AAU",

  // Workflow
  submitted_by: ObjectId("..."),            // Employee or HR
  submitted_at: ISODate("2026-02-19T14:00:00Z"),

  approved_by: ObjectId("..."),             // HR Supervisor
  approved_at: ISODate("2026-02-20T11:00:00Z"),

  // Sync to Training (for qualifications)
  synced_to_training_library: true,
  training_synced_at: ISODate("2026-02-20T12:00:00Z"),

  // Update Employee Record
  employee_record_updated: true,
  employee_record_updated_at: ISODate("2026-02-20T12:00:00Z"),

  created_at: ISODate("2026-02-19T14:00:00Z"),
  updated_at: ISODate("2026-02-20T12:00:00Z")
}
```

---

## Sub-System 4: Attendance, Leave & Time Management

### 19. hr_leave_requests

```javascript
{
  _id: ObjectId("..."),
  request_id: "LV-2026-0456",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  employee_number: "BLIH-EMP-000045",
  team_id: ObjectId("..."),
  supervisor_id: ObjectId("..."),
  leave_type: "ANNUAL",
  start_date: ISODate("2026-03-10"),
  end_date: ISODate("2026-03-12"),
  days_requested: 3,
  reason: "Family vacation",
  description: "Taking family to visit relatives in Hawassa",
  contact_during_leave: {
    available: true,
    phone: "+251944556677",
    email: "alex.johnson@blihmarketing.com",
    best_time: "After 2 PM"
  },
  handover: {
    delegate_id: ObjectId("..."),
    delegate_name: "Sarah Williams",
    tasks_delegated: ["Code review backlog", "Standup facilitation"],
    handover_notes: "All active tickets documented in Jira"
  },
  balance: {
    annual_entitled: 20,
    annual_used_before: 5,
    annual_remaining_before: 15,
    annual_remaining_after: 12
  },
  submitted_at: ISODate("2026-03-01T09:00:00Z"),
  approvals: [
    {
      level: 1,
      role: "SUPERVISOR",
      approver_id: ObjectId("..."),
      status: "APPROVED",
      decision: "APPROVE",
      comments: "Team coverage arranged",
      acted_at: ISODate("2026-03-01T14:00:00Z")
    },
    {
      level: 2,
      role: "HR",
      approver_id: ObjectId("..."),
      status: "APPROVED",
      decision: "APPROVE",
      comments: "Balance sufficient",
      acted_at: ISODate("2026-03-02T10:00:00Z")
    }
  ],
  status: "APPROVED",
  added_to_calendar: true,
  calendar_event_id: "evt_123456",
  supervisor_notified: true,
  supervisor_notified_at: ISODate("2026-03-01T09:01:00Z"),
  team_notified: true,
  team_notified_at: ISODate("2026-03-02T10:01:00Z"),
  actual_start: ISODate("2026-03-10"),
  actual_end: ISODate("2026-03-12"),
  days_taken: 3,
  returned: true,
  returned_at: ISODate("2026-03-13T09:00:00Z"),
  return_report: "Vacation completed as planned",
  created_at: ISODate("2026-03-01T09:00:00Z"),
  updated_at: ISODate("2026-03-13T09:00:00Z")
}
```

---

### 20. hr_attendance_logs

```javascript
{
  _id: ObjectId("..."),
  employee_id: ObjectId("..."),
  employee_number: "BLIH-EMP-000045",
  date: ISODate("2026-03-01"),
  day_of_week: "MONDAY",
  shift: "STANDARD",
  expected_start: ISODate("2026-03-01T08:00:00Z"),
  expected_end: ISODate("2026-03-01T17:00:00Z"),
  expected_hours: 8,
  actual_start: ISODate("2026-03-01T07:55:00Z"),
  actual_end: ISODate("2026-03-01T17:30:00Z"),
  breaks: [
    { start: ISODate("2026-03-01T12:00:00Z"), end: ISODate("2026-03-01T13:00:00Z"), duration_minutes: 60, type: "LUNCH" }
  ],
  total_worked_hours: 8.58,
  overtime_hours: 0.5,
  late_minutes: 0,
  early_departure_minutes: 0,
  status: "PRESENT",
  check_in_method: "BIOMETRIC",
  check_in_location: "Main Office",
  check_in_ip: "192.168.1.100",
  check_in_geo: { lat: 9.005, lng: 38.755 },
  check_out_method: "BIOMETRIC",
  check_out_location: "Main Office",
  is_holiday: false,
  is_weekend: false,
  is_leave_day: false,
  notes: "Normal working day",
  corrected: false,
  created_at: ISODate("2026-03-01T07:55:00Z"),
  updated_at: ISODate("2026-03-01T17:30:00Z")
}
```

---

### 21. hr_punctuality_records

```javascript
{
  _id: ObjectId("..."),
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  employee_number: "BLIH-EMP-000045",
  team_id: ObjectId("..."),
  violation_date: ISODate("2026-03-05"),
  violation_type: "TARDINESS",
  scheduled_time: ISODate("2026-03-05T08:00:00Z"),
  actual_time: ISODate("2026-03-05T09:15:00Z"),
  delay_minutes: 75,
  employee_explanation: "Traffic due to road construction on Bole Road",
  evidence_provided: false,
  decision: "EXCUSED",
  decision_reason: "Construction verified via news reports",
  decided_by: ObjectId("..."),
  decided_at: ISODate("2026-03-05T10:00:00Z"),
  payroll_impact: {
    affected: false,
    deduction_amount: 0,
    deduction_type: null
  },
  employee_notified: true,
  notified_at: ISODate("2026-03-05T10:01:00Z"),
  is_recurring: false,
  previous_violations_30_days: 0,
  created_at: ISODate("2026-03-05T09:15:00Z"),
  updated_at: ISODate("2026-03-05T10:00:00Z")
}
```

---

### 22. hr_timesheets

```javascript
{
  _id: ObjectId("..."),
  timesheet_id: "TS-2026-045-03",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  year: 2026,
  month: 3,
  week_number: 10,
  start_date: ISODate("2026-03-02"),
  end_date: ISODate("2026-03-08"),
  entries: [
    {
      date: ISODate("2026-03-02"),
      regular_hours: 8,
      overtime_hours: 0,
      project_hours: [
        { project_id: ObjectId("..."), project_name: "CRM Upgrade", hours: 6 },
        { project_id: ObjectId("..."), project_name: "Internal Tools", hours: 2 }
      ],
      tasks: "API development, bug fixes",
      status: "SUBMITTED"
    }
  ],
  total_regular_hours: 40,
  total_overtime_hours: 2.5,
  total_hours: 42.5,
  status: "APPROVED",
  submitted_at: ISODate("2026-03-09T09:00:00Z"),
  approved_by: ObjectId("..."),
  approved_at: ISODate("2026-03-09T14:00:00Z"),
  synced_to_payroll: true,
  payroll_synced_at: ISODate("2026-03-10T00:00:00Z"),
  payroll_period: "2026-03",
  finance_calculations: {
    regular_pay_hours: 40,
    overtime_pay_hours: 2.5,
    overtime_rate_multiplier: 1.5,
    total_payable_hours: 43.75
  },
  created_at: ISODate("2026-03-02T08:00:00Z"),
  updated_at: ISODate("2026-03-10T00:00:00Z")
}
```

---

### 23. hr_attendance_corrections

```javascript
{
  _id: ObjectId("..."),
  correction_id: "AC-2026-0156",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  original_attendance_id: ObjectId("..."),
  original_date: ISODate("2026-03-05"),
  error_description: "I forgot to check out when leaving for client meeting",
  correction: {
    field: "actual_end",
    old_value: ISODate("2026-03-05T12:00:00Z"),
    new_value: ISODate("2026-03-05T17:00:00Z"),
    reason: "Was at client site, returned at 5 PM"
  },
  evidence_provided: true,
  evidence_files: [
    { type: "CLIENT_EMAIL", url: "/storage/...", description: "Meeting confirmation email" }
  ],
  submitted_at: ISODate("2026-03-06T09:00:00Z"),
  supervisor_reviewed: true,
  supervisor_id: ObjectId("..."),
  supervisor_comments: "Confirmed, Alex was at client meeting",
  supervisor_approved: true,
  supervisor_reviewed_at: ISODate("2026-03-06T11:00:00Z"),
  hr_reviewed: true,
  hr_id: ObjectId("..."),
  hr_comments: "Correction approved",
  hr_approved: true,
  hr_reviewed_at: ISODate("2026-03-06T14:00:00Z"),
  status: "APPROVED",
  applied_to_record: true,
  applied_at: ISODate("2026-03-06T14:01:00Z"),
  employee_notified: true,
  notified_at: ISODate("2026-03-06T14:02:00Z"),
  created_at: ISODate("2026-03-06T09:00:00Z"),
  updated_at: ISODate("2026-03-06T14:02:00Z")
}
```

---

### 24. hr_overtime_requests

```javascript
{
  _id: ObjectId("..."),
  ot_request_id: "OT-2026-0234",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  date: ISODate("2026-03-15"),
  start_time: ISODate("2026-03-15T17:00:00Z"),
  end_time: ISODate("2026-03-15T20:00:00Z"),
  hours_requested: 3,
  reason: "Critical deployment - need to complete before weekend",
  urgency: "HIGH",
  tasks_to_complete: "Database migration, final testing",
  expected_outcome: "Production deployment completed",
  compensation_type: "PAID",
  rate_multiplier: 1.5,
  estimated_payout: 937.5,
  submitted_at: ISODate("2026-03-15T14:00:00Z"),
  approvals: [
    {
      level: 1,
      role: "SUPERVISOR",
      approver_id: ObjectId("..."),
      status: "APPROVED",
      comments: "Deployment is critical, approved",
      acted_at: ISODate("2026-03-15T14:30:00Z")
    },
    {
      level: 2,
      role: "HR",
      approver_id: ObjectId("..."),
      status: "APPROVED",
      comments: "Within monthly OT limits",
      acted_at: ISODate("2026-03-15T15:00:00Z")
    }
  ],
  status: "APPROVED",
  actual_start: ISODate("2026-03-15T17:00:00Z"),
  actual_end: ISODate("2026-03-15T19:30:00Z"),
  actual_hours: 2.5,
  processed_in_payroll: true,
  payroll_period: "2026-03",
  payout_amount: 781.25,
  created_at: ISODate("2026-03-15T14:00:00Z"),
  updated_at: ISODate("2026-03-31T00:00:00Z")
}
```

---

## Sub-System 5: Performance, OKRs & Career Development

### 25. hr_performance_reviews

```javascript
{
  _id: ObjectId("..."),
  review_id: "PERF-2026-Q1-045",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  position: "Senior Backend Engineer",
  supervisor_id: ObjectId("..."),
  review_period: {
    year: 2026,
    quarter: 1,
    start_date: ISODate("2026-01-01"),
    end_date: ISODate("2026-03-31")
  },
  self_assessment: {
    status: "COMPLETED",
    completed_at: ISODate("2026-04-05T10:00:00Z"),
    goal_ratings: [
      { goal_id: "G1", goal: "Improve API response time", self_rating: 4, evidence: "Reduced avg response from 350ms to 180ms" }
    ],
    achievements: "Led database migration project successfully",
    challenges: "Learning curve with new tech stack",
    support_needed: "More access to cloud training resources",
    career_aspirations: "Move to Tech Lead role within 2 years"
  },
  manager_review: {
    status: "COMPLETED",
    completed_at: ISODate("2026-04-08T14:00:00Z"),
    goal_ratings: [
      { goal_id: "G1", manager_rating: 5, comments: "Exceeded target significantly" }
    ],
    overall_rating: 4.8,
    rating_category: "EXCEEDS_EXPECTATIONS",
    strengths: ["Technical excellence", "Leadership potential", "Collaboration"],
    development_areas: ["Strategic thinking", "Stakeholder management"],
    feedback: "Alex has shown tremendous growth this quarter...",
    recognition: "Star Performer Award nomination"
  },
  one_on_one: {
    scheduled_at: ISODate("2026-04-10T14:00:00Z"),
    completed_at: ISODate("2026-04-10T15:00:00Z"),
    notes: "Discussed career progression, agreed on Tech Lead track",
    employee_acknowledged: true,
    manager_acknowledged: true
  },
  final_rating: 4.8,
  final_comments: "Exceptional quarter, ready for increased responsibilities",
  employee_signed: true,
  employee_signed_at: ISODate("2026-04-12T09:00:00Z"),
  supervisor_signed: true,
  supervisor_signed_at: ISODate("2026-04-12T10:00:00Z"),
  hr_reviewed: true,
  hr_reviewed_at: ISODate("2026-04-13T11:00:00Z"),
  recommended_promotion: true,
  recommended_raise_percentage: 10,
  archived_in_employee_file: true,
  archived_at: ISODate("2026-04-15T00:00:00Z"),
  created_at: ISODate("2026-04-01T00:00:00Z"),
  updated_at: ISODate("2026-04-15T00:00:00Z")
}
```

---

### 26. hr_okrs

```javascript
{
  _id: ObjectId("..."),
  okr_id: "OKR-2026-Q1-ENG-001",
  owner_type: "TEAM",
  owner_id: ObjectId("..."),
  owner_name: "Engineering Team",
  year: 2026,
  quarter: 1,
  start_date: ISODate("2026-01-01"),
  end_date: ISODate("2026-03-31"),
  objective: {
    title: "Improve System Performance and Reliability",
    description: "Focus on making our platform faster and more stable",
    priority: "HIGH",
    alignment: { parent_okr_id: ObjectId("..."), parent_objective: "Enhance Customer Experience" }
  },
  key_results: [
    { kr_id: "KR1", title: "Reduce API response time to under 200ms", type: "NUMERIC", target_value: 200, current_value: 180, unit: "ms", progress_percentage: 100, status: "ACHIEVED" },
    { kr_id: "KR2", title: "Achieve 99.9% uptime", type: "PERCENTAGE", target_value: 99.9, current_value: 99.95, progress_percentage: 100, status: "ACHIEVED" }
  ],
  overall_progress: 100,
  overall_status: "ACHIEVED",
  contributors: [
    { employee_id: ObjectId("..."), name: "Alex Johnson", contribution_percentage: 40 }
  ],
  updates: [
    { updated_at: ISODate("2026-02-15T10:00:00Z"), updated_by: ObjectId("..."), kr_id: "KR1", old_value: 350, new_value: 250, note: "Implemented caching layer" }
  ],
  final_score: 1.0,
  scoring_rationale: "All KRs achieved or exceeded",
  status: "COMPLETED",
  created_at: ISODate("2026-01-01T00:00:00Z"),
  updated_at: ISODate("2026-04-01T00:00:00Z")
}
```

---

### 27. hr_development_plans

```javascript
{
  _id: ObjectId("..."),
  plan_id: "DEV-2026-045",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  position: "Senior Backend Engineer",
  supervisor_id: ObjectId("..."),
  hr_partner_id: ObjectId("..."),
  based_on_review_id: ObjectId("..."),
  review_period: "2026-Q1",
  career_goals: {
    short_term: "Become Tech Lead within 12 months",
    long_term: "Move to Engineering Manager role",
    desired_roles: ["Tech Lead", "Senior Architect"]
  },
  development_areas: [
    {
      area: "Leadership Skills",
      gap_assessment: "Limited experience leading cross-functional teams",
      learning_plan: [
        { activity: "Lead 2 cross-functional projects", type: "ON_THE_JOB", deadline: ISODate("2026-06-30") },
        { activity: "Leadership training course", type: "TRAINING", deadline: ISODate("2026-05-30") }
      ]
    }
  ],
  overall_progress: 35,
  check_ins: [
    { date: ISODate("2026-02-15"), notes: "Progress on leadership track, completed first project", next_actions: "Continue mentoring, start architecture course" }
  ],
  support_needs: {
    budget_required: 15000,
    time_allocation: "10% of work time for learning",
    mentor_assigned: ObjectId("..."),
    sponsor_assigned: ObjectId("...")
  },
  employee_endorsed: true,
  employee_endorsed_at: ISODate("2026-04-10T09:00:00Z"),
  supervisor_endorsed: true,
  supervisor_endorsed_at: ISODate("2026-04-10T14:00:00Z"),
  hr_reviewed: true,
  hr_reviewed_at: ISODate("2026-04-11T10:00:00Z"),
  status: "ACTIVE",
  created_at: ISODate("2026-04-10T00:00:00Z"),
  updated_at: ISODate("2026-04-15T00:00:00Z")
}
```

---

### 28. hr_transfer_requests

```javascript
{
  _id: ObjectId("..."),
  transfer_id: "TRANS-2026-012",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  current_role: "Senior Backend Engineer",
  current_team_id: ObjectId("..."),
  current_supervisor_id: ObjectId("..."),
  proposed_role: "Tech Lead",
  proposed_team_id: ObjectId("..."),
  proposed_supervisor_id: ObjectId("..."),
  transfer_type: "PROMOTION",
  justification: {
    benefits_for_employee: "Leadership growth opportunity, aligns with career goals",
    benefits_for_company: "Strong technical leader needed for new team",
    team_impact: "Alex will mentor 4 junior developers",
    readiness_evidence: "Successfully led 2 projects, mentored juniors"
  },
  proposed_date: ISODate("2026-05-01"),
  submitted_by: ObjectId("..."),
  submitted_at: ISODate("2026-04-15T09:00:00Z"),
  approvals: [
    { level: 1, role: "CURRENT_SUPERVISOR", approver_id: ObjectId("..."), status: "APPROVED", comments: "Alex is ready for this move", acted_at: ISODate("2026-04-15T11:00:00Z") },
    { level: 2, role: "NEW_SUPERVISOR", approver_id: ObjectId("..."), status: "APPROVED", comments: "Excited to have Alex join the team", acted_at: ISODate("2026-04-15T14:00:00Z") },
    { level: 3, role: "HR", approver_id: ObjectId("..."), status: "APPROVED", comments: "All requirements met", acted_at: ISODate("2026-04-16T10:00:00Z") },
    { level: 4, role: "CEO", approver_id: ObjectId("..."), status: "APPROVED", comments: "Approved", acted_at: ISODate("2026-04-16T11:00:00Z") }
  ],
  status: "APPROVED",
  new_position_effective_date: ISODate("2026-05-01"),
  employee_record_updated: true,
  updated_at: ISODate("2026-04-16T12:00:00Z"),
  payroll_updated: true,
  payroll_updated_at: ISODate("2026-04-16T12:01:00Z"),
  systems_access_updated: true,
  access_updated_at: ISODate("2026-04-16T12:02:00Z"),
  archived_in_employee_file: true,
  archived_at: ISODate("2026-04-16T12:05:00Z"),
  created_at: ISODate("2026-04-15T09:00:00Z"),
  updated_at: ISODate("2026-04-16T12:05:00Z")
}
```

---

### 29. hr_promotion_letters

```javascript
{
  _id: ObjectId("..."),
  letter_id: "PROMO-2026-015",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  current_job_grade: "SENIOR",
  current_position: "Senior Backend Engineer",
  current_salary: 55000,
  new_job_grade: "LEAD",
  new_position: "Tech Lead",
  new_salary: 70000,
  changes: {
    salary_increase: 15000,
    salary_increase_percentage: 27.3,
    new_benefits: ["STOCK_OPTIONS", "BONUS_ELIGIBLE"],
    effective_date: ISODate("2026-05-01")
  },
  reasoning: "Exceptional performance over 18 months, demonstrated leadership capabilities, completed leadership training",
  letter_content: "Dear Alex, We are pleased to inform you of your promotion...",
  letter_url: "/storage/letters/promotion_alex_2026.pdf",
  prepared_by: ObjectId("..."),
  prepared_at: ISODate("2026-04-20T10:00:00Z"),
  approved_by_hr: ObjectId("..."),
  hr_approved_at: ISODate("2026-04-20T14:00:00Z"),
  approved_by_ceo: ObjectId("..."),
  ceo_approved_at: ISODate("2026-04-21T09:00:00Z"),
  delivered_to_employee: true,
  delivered_at: ISODate("2026-04-21T10:00:00Z"),
  delivery_method: "IN_PERSON",
  employee_acknowledged: true,
  acknowledged_at: ISODate("2026-04-21T10:30:00Z"),
  archived_in_employee_file: true,
  archived_in_kb: true,
  kb_document_id: ObjectId("..."),
  created_at: ISODate("2026-04-20T10:00:00Z"),
  updated_at: ISODate("2026-04-21T10:30:00Z")
}
```

---

### 30. hr_salary_adjustments

```javascript
{
  _id: ObjectId("..."),
  adjustment_id: "ADJ-2026-023",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  current_position: "Tech Lead",
  current_salary: 70000,
  proposed_salary: 75000,
  adjustment_amount: 5000,
  adjustment_percentage: 7.1,
  adjustment_type: "MERIT_INCREASE",
  effective_date: ISODate("2026-07-01"),
  employee_merits: "Exceeded all OKRs, led successful product launch, mentored 3 juniors",
  submitted_by: ObjectId("..."),
  submitted_at: ISODate("2026-06-15T09:00:00Z"),
  supervisor_approved: true,
  supervisor_id: ObjectId("..."),
  supervisor_approved_at: ISODate("2026-06-15T14:00:00Z"),
  hr_approved: true,
  hr_id: ObjectId("..."),
  hr_approved_at: ISODate("2026-06-16T10:00:00Z"),
  finance_approved: true,
  finance_id: ObjectId("..."),
  finance_approved_at: ISODate("2026-06-16T11:00:00Z"),
  ceo_approved: true,
  ceo_id: ObjectId("..."),
  ceo_approved_at: ISODate("2026-06-17T09:00:00Z"),
  status: "APPROVED",
  adjustment_implemented: true,
  implemented_at: ISODate("2026-07-01T00:00:00Z"),
  payroll_updated: true,
  payroll_updated_at: ISODate("2026-07-01T00:01:00Z"),
  employee_notified: true,
  employee_notified_at: ISODate("2026-06-20T10:00:00Z"),
  archived_in_employee_file: true,
  archived_at: ISODate("2026-07-01T00:02:00Z"),
  created_at: ISODate("2026-06-15T09:00:00Z"),
  updated_at: ISODate("2026-07-01T00:02:00Z")
}
```

---

### 31. hr_skill_assessments

```javascript
{
  _id: ObjectId("..."),
  assessment_id: "SKILL-2026-045-Q2",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  position: "Tech Lead",
  assessment_date: ISODate("2026-06-30"),
  assessed_by: ObjectId("..."),
  assessor_name: "Engineering Manager",
  skills: [
    { skill_id: "SK001", skill_name: "Node.js", category: "TECHNICAL", required_level: 5, current_level: 5, gap: 0, status: "MEETS" },
    { skill_id: "SK002", skill_name: "React", category: "TECHNICAL", required_level: 3, current_level: 4, gap: 1, status: "EXCEEDS" },
    { skill_id: "SK003", skill_name: "Leadership", category: "BEHAVIORAL", required_level: 4, current_level: 3, gap: -1, status: "DEVELOPING" }
  ],
  total_skills: 12,
  meets_requirements: 8,
  exceeds_requirements: 2,
  developing: 2,
  below_requirements: 0,
  overall_compliance: 83.3,
  recommended_trainings: [
    { skill: "Leadership", training_id: ObjectId("..."), priority: "HIGH" }
  ],
  assessor_notes: "Strong technical skills, building leadership capabilities",
  next_assessment_date: ISODate("2026-09-30"),
  created_at: ISODate("2026-06-30T14:00:00Z"),
  updated_at: ISODate("2026-06-30T14:00:00Z")
}
```

---

### 32. hr_successor_nominations

```javascript
{
  _id: ObjectId("..."),
  nomination_id: "SUCC-2026-003",
  position_id: ObjectId("..."),
  position_title: "Engineering Manager",
  incumbent_id: ObjectId("..."),
  incumbent_name: "Current Manager",
  vacancy_risk: "MEDIUM",
  risk_reason: "Incumbent exploring external opportunities",
  nominees: [
    {
      nominee_id: ObjectId("..."),
      nominee_name: "Alex Johnson",
      current_role: "Tech Lead",
      readiness: "READY_NOW",
      readiness_score: 85,
      strengths: ["Technical depth", "Team leadership", "Mentoring"],
      development_areas: ["Stakeholder management", "Budget management"],
      development_plan: {
        planned_trainings: ["Management Essentials", "Finance for Non-Finance Managers"],
        planned_experiences: ["Lead budget planning cycle", "Manage vendor relationship"]
      },
      backup_for_other_roles: ["Tech Lead"]
    }
  ],
  nominated_by: ObjectId("..."),
  nominated_at: ISODate("2026-04-15T10:00:00Z"),
  hr_reviewed: true,
  hr_reviewer_id: ObjectId("..."),
  hr_reviewed_at: ISODate("2026-04-20T14:00:00Z"),
  ceo_approved: true,
  ceo_approved_at: ISODate("2026-04-21T09:00:00Z"),
  status: "ACTIVE",
  next_review_date: ISODate("2026-07-15"),
  created_at: ISODate("2026-04-15T10:00:00Z"),
  updated_at: ISODate("2026-04-21T09:00:00Z")
}
```

---

### 33. hr_career_paths

```javascript
{
  _id: ObjectId("..."),
  path_id: "PATH-ENG-MANAGER",
  path_name: "Engineering Manager Track",
  department: "Engineering",
  levels: [
    {
      level: 1,
      title: "Junior Engineer",
      grade: "JUNIOR",
      years_experience: "0-2",
      competencies: [
        { competency: "Coding", required_level: 3 },
        { competency: "Debugging", required_level: 3 }
      ],
      key_responsibilities: ["Write code", "Fix bugs", "Learn codebase"]
    },
    {
      level: 2,
      title: "Senior Engineer",
      grade: "SENIOR",
      years_experience: "3-5",
      competencies: [
        { competency: "Coding", required_level: 5 },
        { competency: "Architecture", required_level: 4 }
      ],
      key_responsibilities: ["Lead features", "Mentor juniors", "Code review"]
    },
    {
      level: 3,
      title: "Tech Lead",
      grade: "LEAD",
      years_experience: "5-8",
      competencies: [
        { competency: "Leadership", required_level: 4 },
        { competency: "Architecture", required_level: 5 }
      ],
      key_responsibilities: ["Lead team", "Technical decisions", "Stakeholder mgmt"]
    },
    {
      level: 4,
      title: "Engineering Manager",
      grade: "MANAGER",
      years_experience: "8+",
      competencies: [
        { competency: "Leadership", required_level: 5 },
        { competency: "Budget Management", required_level: 4 }
      ],
      key_responsibilities: ["Manage team", "Hiring", "Budget", "Strategy"]
    }
  ],
  progression_rules: {
    min_time_in_level_months: 12,
    performance_requirement: "MEETS_EXPECTATIONS",
    approval_required: ["SUPERVISOR", "HR", "CEO"]
  },
  active: true,
  created_at: ISODate("2026-01-01T00:00:00Z"),
  updated_at: ISODate("2026-01-01T00:00:00Z")
}
```

---

## Sub-System 6: Training & Skill Development

### 34. hr_training_requests

```javascript
{
  _id: ObjectId("..."),
  request_id: "TRAIN-2026-078",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  team_id: ObjectId("..."),
  supervisor_id: ObjectId("..."),
  training_title: "Advanced System Design",
  training_type: "EXTERNAL_COURSE",
  provider: "Educative",
  preferred_start: ISODate("2026-05-01"),
  preferred_duration_weeks: 4,
  time_required_per_week: "5 hours",
  delivery_mode: "ONLINE",
  cost: {
    course_fee: 5000,
    materials: 500,
    travel: 0,
    accommodation: 0,
    total: 5500,
    currency: "ETB"
  },
  objectives: "Improve ability to design scalable distributed systems",
  linked_dev_plan_id: ObjectId("..."),
  linked_skill_gap: "System Architecture",
  submitted_at: ISODate("2026-04-15T09:00:00Z"),
  supervisor_approved: true,
  supervisor_approved_at: ISODate("2026-04-15T14:00:00Z"),
  hr_approved: true,
  hr_approved_at: ISODate("2026-04-16T10:00:00Z"),
  finance_approved: true,
  finance_approved_at: ISODate("2026-04-16T11:00:00Z"),
  status: "APPROVED",
  training_scheduled: true,
  scheduled_start: ISODate("2026-05-01"),
  enrollment_confirmed: true,
  created_at: ISODate("2026-04-15T09:00:00Z"),
  updated_at: ISODate("2026-04-16T11:00:00Z")
}
```

---

### 35. hr_training_feedback

```javascript
{
  _id: ObjectId("..."),
  feedback_id: "FB-2026-078",
  training_request_id: ObjectId("..."),
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  training_title: "Advanced System Design",
  provider: "Educative",
  completed_date: ISODate("2026-05-28"),
  ratings: {
    relevance: { score: 5, comment: "Directly applicable to my work" },
    content_quality: { score: 4, comment: "Good depth, some outdated examples" },
    instructor_quality: { score: 4, comment: "Knowledgeable but could be more engaging" },
    materials: { score: 5, comment: "Excellent resources provided" },
    organization: { score: 5, comment: "Well structured" }
  },
  overall_satisfaction: 4.6,
  learning_objectives_achieved: true,
  skills_gained: ["Distributed systems design", "Scalability patterns", "Load balancing"],
  applying_learnings: true,
  application_examples: "Redesigned our caching layer using patterns learned",
  value_for_money: 4,
  worth_recommending: true,
  recommend_to_roles: ["Senior Engineers", "Tech Leads", "Architects"],
  suggestions: "More hands-on labs would be beneficial",
  submitted_at: ISODate("2026-05-30T10:00:00Z"),
  follow_up_required: false,
  archived_in_training_records: true,
  archived_at: ISODate("2026-05-30T10:01:00Z"),
  created_at: ISODate("2026-05-30T10:00:00Z"),
  updated_at: ISODate("2026-05-30T10:01:00Z")
}
```

---

### 36. hr_skill_gap_analyses

```javascript
{
  _id: ObjectId("..."),
  analysis_id: "GAP-2026-045",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  current_role: "Tech Lead",
  career_goal: "Engineering Manager",
  assessment_date: ISODate("2026-06-30"),
  assessed_by: ObjectId("..."),
  current_skills: [
    { skill: "System Architecture", level: 5 },
    { skill: "Team Leadership", level: 4 },
    { skill: "Project Management", level: 3 }
  ],
  required_skills: [
    { skill: "System Architecture", level: 4 },
    { skill: "Team Leadership", level: 5 },
    { skill: "Budget Management", level: 4 },
    { skill: "Stakeholder Management", level: 4 }
  ],
  gaps: [
    { skill: "Budget Management", current_level: 2, required_level: 4, gap: 2, priority: "HIGH", impact: "Required for quarterly planning" },
    { skill: "Stakeholder Management", current_level: 3, required_level: 4, gap: 1, priority: "HIGH", impact: "Critical for cross-functional projects" }
  ],
  total_gaps: 3,
  critical_gaps: 2,
  estimated_closure_time_months: 12,
  recommended_trainings: [
    { skill: "Budget Management", training_id: ObjectId("..."), priority: "HIGH" }
  ],
  status: "ACTIVE",
  created_at: ISODate("2026-06-30T14:00:00Z"),
  updated_at: ISODate("2026-06-30T14:00:00Z")
}
```

---

### 37. hr_training_completions

```javascript
{
  _id: ObjectId("..."),
  completion_id: "TC-2026-045-078",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  training_request_id: ObjectId("..."),
  training_title: "Advanced System Design",
  provider: "Educative",
  start_date: ISODate("2026-05-01"),
  completion_date: ISODate("2026-05-28"),
  duration_weeks: 4,
  passed: true,
  score: 92,
  certificate_issued: true,
  certificate_url: "/storage/certificates/alex_system_design_2026.pdf",
  certificate_number: "CERT-ED-2026-45231",
  skills_acquired: [
    { skill: "Distributed Systems", proficiency: "ADVANCED" },
    { skill: "Scalability Patterns", proficiency: "ADVANCED" }
  ],
  skills_matrix_updated: true,
  skills_updated_at: ISODate("2026-05-28T15:00:00Z"),
  added_to_linkedin: false,
  archived_in_training_records: true,
  archived_at: ISODate("2026-05-28T15:01:00Z"),
  created_at: ISODate("2026-05-28T15:00:00Z"),
  updated_at: ISODate("2026-05-28T15:01:00Z")
}
```

---

## Sub-System 7: Employee Relations

### 38. hr_pulse_surveys

```javascript
{
  _id: ObjectId("..."),
  survey_id: "PULSE-2026-Q2",
  survey_name: "Quarterly Engagement Pulse",
  period: {
    year: 2026,
    quarter: 2,
    start_date: ISODate("2026-04-01"),
    end_date: ISODate("2026-04-15")
  },
  questions: [
    {
      question_id: "Q1",
      question: "I feel valued at work",
      category: "ENGAGEMENT",
      type: "RATING",
      scale: { min: 1, max: 5, labels: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"] }
    },
    {
      question_id: "Q2",
      question: "My manager provides regular feedback",
      category: "MANAGEMENT",
      type: "RATING",
      scale: { min: 1, max: 5 }
    }
  ],
  anonymous: true,
  target_audience: "ALL_EMPLOYEES",
  total_invited: 45,
  responses_received: 42,
  response_rate: 93.3,
  results: {
    overall_score: 4.2,
    category_scores: [
      { category: "ENGAGEMENT", score: 4.3 },
      { category: "MANAGEMENT", score: 4.1 }
    ],
    trend: "IMPROVING",
    previous_period_score: 4.0,
    key_insights: ["Growth opportunities identified as area for improvement"]
  },
  status: "COMPLETED",
  results_shared_with: ["MANAGEMENT", "TEAM_LEADS"],
  shared_at: ISODate("2026-04-25T10:00:00Z"),
  action_plans_created: 3,
  action_plan_ids: [ObjectId("..."), ObjectId("..."), ObjectId("...")],
  created_at: ISODate("2026-03-15T10:00:00Z"),
  updated_at: ISODate("2026-04-25T10:00:00Z")
}
```

---

### 39. hr_disciplinary_actions

```javascript
{
  _id: ObjectId("..."),
  action_id: "DA-2026-012",
  employee_id: ObjectId("..."),
  employee_name: "John Doe",
  employee_number: "BLIH-EMP-000032",
  team_id: ObjectId("..."),
  incident_type: "ATTENDANCE_VIOLATION",
  incident_date: ISODate("2026-03-15"),
  reported_by: ObjectId("..."),
  description: "Employee absent without notice for 3 consecutive days",
  evidence: [
    { type: "ATTENDANCE_RECORD", description: "No check-in for 3 days" },
    { type: "COMMUNICATION_LOG", description: "No response to supervisor calls" }
  ],
  employee_explanation: "Family emergency, phone was lost",
  supporting_documents: [
    { type: "MEDICAL_CERTIFICATE", url: "/storage/..." }
  ],
  decision: "WRITTEN_WARNING",
  decision_reason: "Pattern of unnotified absences, 2nd occurrence in 6 months",
  penalty: {
    type: "WRITTEN_WARNING",
    effective_date: ISODate("2026-03-20"),
    improvement_required_by: ISODate("2026-05-20")
  },
  requirements: [
    "Notify supervisor immediately if unable to attend",
    "Provide documentation for any absence within 24 hours"
  ],
  reviewed_by: ObjectId("..."),
  reviewed_at: ISODate("2026-03-18T10:00:00Z"),
  approved_by: ObjectId("..."),
  approved_at: ISODate("2026-03-19T14:00:00Z"),
  delivered_to_employee: true,
  delivered_at: ISODate("2026-03-20T09:00:00Z"),
  delivery_method: "IN_PERSON",
  witness_present: ObjectId("..."),
  employee_acknowledged: true,
  acknowledged_at: ISODate("2026-03-20T09:30:00Z"),
  follow_up_date: ISODate("2026-05-20"),
  improvement_status: "ON_TRACK",
  archived_in_employee_file: true,
  archived_at: ISODate("2026-03-20T10:00:00Z"),
  created_at: ISODate("2026-03-18T10:00:00Z"),
  updated_at: ISODate("2026-03-20T10:00:00Z")
}
```

---

### 40. hr_incident_reports

```javascript
{
  _id: ObjectId("..."),
  report_id: "INC-2026-045",
  reported_by: ObjectId("..."),
  reporter_name: "Sarah Williams",
  reporter_role: "Team Lead",
  incident_type: "SAFETY",
  severity: "MEDIUM",
  incident_date: ISODate("2026-04-10"),
  incident_time: "14:30",
  location: "Main Office - 3rd Floor",
  affected_persons: [
    { employee_id: ObjectId("..."), name: "Mike Chen", role: "AFFECTED" }
  ],
  witnesses: [
    { employee_id: ObjectId("..."), name: "Lisa Park", contact: "+251911111111" }
  ],
  description: "Employee slipped on wet floor near cafeteria entrance",
  immediate_response: "First aid provided, area cordoned off",
  injuries: {
    occurred: true,
    description: "Minor ankle sprain",
    medical_attention: true,
    hospital_referral: false
  },
  photos: [
    { url: "/storage/incidents/inc_045_floor.jpg", description: "Wet floor area" }
  ],
  investigation_required: true,
  investigator_assigned: ObjectId("..."),
  investigation_started: ISODate("2026-04-11"),
  root_cause: "Cleaning staff did not place warning signs",
  corrective_actions: [
    { action: "Retrain cleaning staff on safety protocols", assignee: ObjectId("..."), due_date: ISODate("2026-04-20"), status: "COMPLETED" }
  ],
  status: "CLOSED",
  closed_at: ISODate("2026-04-25T16:00:00Z"),
  closed_by: ObjectId("..."),
  archived_in_incident_log: true,
  archived_at: ISODate("2026-04-25T16:01:00Z"),
  created_at: ISODate("2026-04-10T15:00:00Z"),
  updated_at: ISODate("2026-04-25T16:01:00Z")
}
```

---

### 41. hr_suggestion_submissions

```javascript
{
  _id: ObjectId("..."),
  suggestion_id: "SUG-2026-089",
  submitted_by: ObjectId("..."),
  submitter_name: "Alex Johnson",
  submitter_team: "Engineering",
  title: "Implement Automated Code Review Tool",
  current_situation: "Manual code reviews take 2-3 days on average, creating bottlenecks",
  proposed_change: "Integrate automated code review tool for initial quality checks",
  expected_benefits: "Reduce review time by 50%, catch security issues early",
  category: "PROCESS_IMPROVEMENT",
  impact_assessment: {
    affected_areas: ["Engineering", "Quality Assurance"],
    estimated_savings: 200000,
    implementation_cost: 50000,
    roi_percentage: 300,
    implementation_complexity: "MEDIUM"
  },
  submitted_at: ISODate("2026-04-01T09:00:00Z"),
  anonymous: false,
  status: "UNDER_REVIEW",
  assigned_reviewer: ObjectId("..."),
  reviewer_name: "CTO",
  reviewed_at: ISODate("2026-04-05T14:00:00Z"),
  reviewer_comments: "Promising idea, needs technical evaluation",
  decision: "ACCEPTED",
  decision_reason: "ROI analysis supports implementation",
  decided_at: ISODate("2026-04-15T10:00:00Z"),
  decided_by: ObjectId("..."),
  implementation_plan: {
    owner: ObjectId("..."),
    start_date: ISODate("2026-05-01"),
    target_completion: ISODate("2026-06-15"),
    status: "IN_PROGRESS"
  },
  reward_eligible: true,
  reward_amount: 5000,
  reward_paid: false,
  archived_in_kb: true,
  kb_document_id: ObjectId("..."),
  created_at: ISODate("2026-04-01T09:00:00Z"),
  updated_at: ISODate("2026-05-01T10:00:00Z")
}
```

---

### 42. hr_employee_recognition

```javascript
{
  _id: ObjectId("..."),
  recognition_id: "REC-2026-156",
  nominee_id: ObjectId("..."),
  nominee_name: "Sarah Chen",
  nominee_team: "Engineering",
  nominated_by: ObjectId("..."),
  nominator_name: "Alex Johnson",
  award_type: "STAR_PERFORMER",
  justification: "Sarah led the critical database migration with zero downtime",
  specific_contributions: ["Planned and executed complex migration", "Worked overtime"],
  impact: "Saved company 2 days of downtime, worth ETB 500,000",
  nominated_at: ISODate("2026-04-10T09:00:00Z"),
  supervisor_endorsed: true,
  supervisor_id: ObjectId("..."),
  supervisor_endorsed_at: ISODate("2026-04-10T14:00:00Z"),
  hr_approved: true,
  hr_id: ObjectId("..."),
  hr_approved_at: ISODate("2026-04-11T10:00:00Z"),
  ceo_approved: true,
  ceo_id: ObjectId("..."),
  ceo_approved_at: ISODate("2026-04-12T09:00:00Z"),
  award: {
    certificate: true,
    certificate_url: "/storage/awards/sarah_star_2026.pdf",
    monetary_reward: 10000,
    extra_leave_days: 1,
    public_recognition: true
  },
  presented_at: ISODate("2026-04-15"),
  presented_by: ObjectId("..."),
  presentation_event: "Monthly Town Hall",
  team_notified: true,
  company_wide_post: true,
  archived_in_employee_file: true,
  archived_at: ISODate("2026-04-15T16:00:00Z"),
  created_at: ISODate("2026-04-10T09:00:00Z"),
  updated_at: ISODate("2026-04-15T16:00:00Z")
}
```

---

### 43. hr_complaints

```javascript
{
  _id: ObjectId("..."),
  complaint_id: "COMP-2026-023",
  complainant_id: ObjectId("..."),
  complainant_name: "Anonymous",
  complaint_type: "WORKPLACE_CONFLICT",
  subject: "Conflict with team member",
  description: "Consistent disagreements with colleague on project approach",
  against_employee_id: ObjectId("..."),
  against_employee_name: "John Doe",
  evidence: [
    { type: "EMAIL", description: "Email thread", url: "/storage/..." },
    { type: "WITNESS", name: "Sarah Williams", contact: "sarah@blih.com" }
  ],
  submitted_at: ISODate("2026-04-05T09:00:00Z"),
  anonymous: true,
  assigned_to: ObjectId("..."),
  assigned_at: ISODate("2026-04-05T10:00:00Z"),
  investigation: {
    started_at: ISODate("2026-04-06"),
    investigator: ObjectId("..."),
    findings: "Both parties contributed to conflict",
    conclusion: "Mediation recommended"
  },
  resolution_type: "MEDIATION",
  resolution_details: "Mediation session held, both parties agreed to protocol",
  resolved_at: ISODate("2026-04-20"),
  resolved_by: ObjectId("..."),
  follow_up_required: true,
  follow_up_date: ISODate("2026-05-20"),
  follow_up_status: "SCHEDULED",
  complainant_satisfied: true,
  status: "RESOLVED",
  confidential: true,
  access_restricted_to: [ObjectId("..."), ObjectId("...")],
  archived_at: ISODate("2026-05-21T10:00:00Z"),
  created_at: ISODate("2026-04-05T09:00:00Z"),
  updated_at: ISODate("2026-05-21T10:00:00Z")
}
```

---

### 44. hr_mediation_records

```javascript
{
  _id: ObjectId("..."),
  mediation_id: "MED-2026-008",
  related_complaint_id: ObjectId("..."),
  party_a: { employee_id: ObjectId("..."), name: "Alex Johnson", representative: null },
  party_b: { employee_id: ObjectId("..."), name: "John Doe", representative: null },
  mediator: { employee_id: ObjectId("..."), name: "HR Manager", external: false },
  issue_description: "Project ownership disagreement affecting collaboration",
  sessions: [
    {
      session_number: 1,
      date: ISODate("2026-04-10"),
      time: "14:00",
      duration_minutes: 90,
      location: "Conference Room B",
      party_a_perspective: "Feels John is overstepping on API design decisions",
      party_b_perspective: "Feels Alex is not open to feedback",
      key_points: ["Communication gap identified"],
      progress: "Both parties willing to find solution"
    },
    {
      session_number: 2,
      date: ISODate("2026-04-17"),
      time: "14:00",
      duration_minutes: 60,
      location: "Conference Room B",
      agreement_reached: true,
      agreement_details: "Clear ownership boundaries defined"
    }
  ],
  outcome: "RESOLVED",
  resolution_summary: "Parties agreed on role clarity and communication protocol",
  agreed_actions: [
    { party: "Alex", action: "Define API ownership in writing", deadline: ISODate("2026-04-20") },
    { party: "John", action: "Provide feedback through established channels", deadline: ISODate("2026-04-20") }
  ],
  follow_up_required: true,
  follow_up_date: ISODate("2026-05-17"),
  confidential: true,
  access_level: "HR_ONLY",
  status: "COMPLETED",
  completed_at: ISODate("2026-04-17T15:30:00Z"),
  created_at: ISODate("2026-04-10T13:00:00Z"),
  updated_at: ISODate("2026-04-17T15:30:00Z")
}
```

---

## Sub-System 8: Exit, Offboarding & Compliance

### 45. hr_resignation_notices

```javascript
{
  _id: ObjectId("..."),
  notice_id: "RES-2026-023",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  employee_number: "BLIH-EMP-000045",
  position: "Tech Lead",
  team_id: ObjectId("..."),
  supervisor_id: ObjectId("..."),
  employment_start_date: ISODate("2026-03-01"),
  resignation_date: ISODate("2026-06-15"),
  last_working_date: ISODate("2026-07-15"),
  notice_period_days: 30,
  notice_given_days: 45,
  reason_category: "CAREER_GROWTH",
  reason_description: "Accepted a senior position at a larger tech company",
  is_voluntary: true,
  counter_offer_made: false,
  counter_offer_accepted: false,
  exit_interview_scheduled: true,
  exit_interview_date: ISODate("2026-07-10"),
  handover_plan: {
    handover_to: ObjectId("..."),
    handover_tasks: ["Document architecture decisions", "Transfer project ownership", "Knowledge transfer sessions"],
    status: "IN_PROGRESS"
  },
  knowledge_transfer_sessions: 3,
  projects_handover_status: "IN_PROGRESS",
  supervisor_acknowledged: true,
  supervisor_acknowledged_at: ISODate("2026-06-15T14:00:00Z"),
  hr_acknowledged: true,
  hr_acknowledged_at: ISODate("2026-06-16T10:00:00Z"),
  offboarding_initiated: true,
  offboarding_id: ObjectId("..."),
  status: "ACTIVE",
  created_at: ISODate("2026-06-15T09:00:00Z"),
  updated_at: ISODate("2026-06-16T10:00:00Z")
}
```

---

### 46. hr_exit_interviews

```javascript
{
  _id: ObjectId("..."),
  interview_id: "EXIT-2026-023",
  resignation_notice_id: ObjectId("..."),
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  position: "Tech Lead",
  team_id: ObjectId("..."),
  employment_duration_months: 16,
  interview_date: ISODate("2026-07-10"),
  interviewer_id: ObjectId("..."),
  interviewer_name: "HR Manager",
  interview_mode: "IN_PERSON",
  leaving_reasons: ["Better compensation", "Career growth opportunities", "Want to work at larger scale"],
  satisfaction_ratings: {
    job_satisfaction: 4,
    management_satisfaction: 5,
    team_satisfaction: 5,
    compensation_satisfaction: 3,
    growth_opportunities: 3,
    work_life_balance: 4
  },
  what_liked_most: "The team culture and autonomy given to engineers",
  what_liked_least: "Limited budget for training and conferences",
  would_recommend: true,
  recommendation_score: 8,
  what_would_change: "More investment in professional development",
  return_possibility: "MAYBE",
  return_conditions: "If there were senior leadership opportunities",
  knowledge_transfer_completed: true,
  open_issues: "None",
  stay_interview_conducted: false,
  final_comments: "Great company, just time for next step in career",
  shared_with_management: true,
  shared_at: ISODate("2026-07-12T10:00:00Z"),
  action_items_created: 2,
  action_item_ids: [ObjectId("..."), ObjectId("...")],
  archived_in_employee_file: true,
  archived_at: ISODate("2026-07-15T10:00:00Z"),
  created_at: ISODate("2026-07-10T14:00:00Z"),
  updated_at: ISODate("2026-07-15T10:00:00Z")
}
```

---

### 47. hr_offboarding_checklists

```javascript
{
  _id: ObjectId("..."),
  checklist_id: "OFFB-2026-023",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  position: "Tech Lead",
  team_id: ObjectId("..."),
  resignation_notice_id: ObjectId("..."),
  last_working_date: ISODate("2026-07-15"),
  hr_tasks: [
    { item: "Conduct exit interview", status: "COMPLETED", completed_at: ISODate("2026-07-10"), assigned_to: ObjectId("...") },
    { item: "Process final payroll", status: "COMPLETED", completed_at: ISODate("2026-07-15"), assigned_to: ObjectId("...") },
    { item: "Prepare experience certificate", status: "COMPLETED", completed_at: ISODate("2026-07-15"), assigned_to: ObjectId("...") }
  ],
  it_tasks: [
    { item: "Revoke system access", status: "COMPLETED", completed_at: ISODate("2026-07-15T18:00:00Z"), assigned_to: ObjectId("...") },
    { item: "Backup and transfer data", status: "COMPLETED", completed_at: ISODate("2026-07-14"), assigned_to: ObjectId("...") },
    { item: "Wipe company devices", status: "COMPLETED", completed_at: ISODate("2026-07-15"), assigned_to: ObjectId("...") }
  ],
  admin_tasks: [
    { item: "Collect access badges", status: "COMPLETED", completed_at: ISODate("2026-07-15"), assigned_to: ObjectId("...") },
    { item: "Process asset returns", status: "COMPLETED", completed_at: ISODate("2026-07-15"), assigned_to: ObjectId("...") },
    { item: "Clear locker/ desk", status: "COMPLETED", completed_at: ISODate("2026-07-15"), assigned_to: ObjectId("...") }
  ],
  finance_tasks: [
    { item: "Calculate final settlement", status: "COMPLETED", completed_at: ISODate("2026-07-14"), assigned_to: ObjectId("...") },
    { item: "Process leave encashment", status: "COMPLETED", completed_at: ISODate("2026-07-14"), assigned_to: ObjectId("...") },
    { item: "Clear any dues/loans", status: "COMPLETED", completed_at: ISODate("2026-07-14"), assigned_to: ObjectId("...") }
  ],
  total_items: 12,
  completed_items: 12,
  completion_percentage: 100,
  offboarding_completed: true,
  offboarding_completed_at: ISODate("2026-07-15T18:00:00Z"),
  status: "COMPLETED",
  created_at: ISODate("2026-06-20T10:00:00Z"),
  updated_at: ISODate("2026-07-15T18:00:00Z")
}
```

---

### 48. hr_asset_returns

```javascript
{
  _id: ObjectId("..."),
  return_id: "RET-2026-023",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  resignation_notice_id: ObjectId("..."),
  last_working_date: ISODate("2026-07-15"),
  assets_returned: [
    {
      asset_id: "LAPTOP-2026-128",
      asset_type: "LAPTOP",
      description: "MacBook Pro 16-inch",
      serial_number: "SN-C02XL0DGJHD3",
      returned: true,
      returned_date: ISODate("2026-07-15"),
      condition: "GOOD",
      condition_notes: "Minor scratches, fully functional",
      verified_by: ObjectId("..."),
      repair_needed: false
    },
    {
      asset_id: "PHONE-2026-089",
      asset_type: "PHONE",
      description: "iPhone 15 Pro",
      serial_number: "SN-FL9X2L8H4JK3",
      returned: true,
      returned_date: ISODate("2026-07-15"),
      condition: "EXCELLENT",
      verified_by: ObjectId("..."),
      repair_needed: false
    },
    {
      asset_id: "CARD-2026-045",
      asset_type: "ACCESS_CARD",
      description: "Building Access Card",
      serial_number: "AC-45231",
      returned: true,
      returned_date: ISODate("2026-07-15"),
      condition: "GOOD",
      verified_by: ObjectId("...")
    }
  ],
  assets_not_returned: [],
  all_assets_returned: true,
  outstanding_items: false,
  damage_charges: 0,
  clearance_issued: true,
  clearance_issued_at: ISODate("2026-07-15T16:00:00Z"),
  admin_cleared: true,
  admin_cleared_at: ISODate("2026-07-15T16:00:00Z"),
  created_at: ISODate("2026-07-15T09:00:00Z"),
  updated_at: ISODate("2026-07-15T16:00:00Z")
}
```

---

### 49. hr_final_settlements

```javascript
{
  _id: ObjectId("..."),
  settlement_id: "SETTLE-2026-023",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  employee_number: "BLIH-EMP-000045",
  resignation_notice_id: ObjectId("..."),
  last_working_date: ISODate("2026-07-15"),
  settlement_calculation: {
    basic_salary_last: 70000,
    days_worked_last_month: 15,
    salary_for_days_worked: 35000,
    leave_balance_days: 12,
    leave_encashment: 42000,
    prorated_bonus: 15000,
    overtime_due: 5000,
    other_earnings: 0,
    gross_earnings: 97000,
    deductions: {
      tax_deduction: 15000,
      pension_contribution: 5000,
      loan_recovery: 0,
      advance_recovery: 0,
      damage_charges: 0,
      other_deductions: 0
    },
    total_deductions: 20000,
    net_settlement: 77000
  },
  settlement_breakdown_document: "/storage/settlements/settlement_alex_2026.pdf",
  employee_agreed: true,
  employee_agreed_at: ISODate("2026-07-14T10:00:00Z"),
  approved_by: ObjectId("..."),
  approved_at: ISODate("2026-07-14T14:00:00Z"),
  finance_processed: true,
  finance_processed_at: ISODate("2026-07-15T12:00:00Z"),
  payment_method: "BANK_TRANSFER",
  payment_reference: "TXN-20260715-789456",
  payment_date: ISODate("2026-07-15"),
  employee_acknowledged_receipt: true,
  acknowledged_at: ISODate("2026-07-15T14:00:00Z"),
  archived_in_finance: true,
  archived_in_employee_file: true,
  archived_at: ISODate("2026-07-15T14:00:00Z"),
  created_at: ISODate("2026-07-10T10:00:00Z"),
  updated_at: ISODate("2026-07-15T14:00:00Z")
}
```

---

### 50. hr_compliance_records

```javascript
{
  _id: ObjectId("..."),
  record_id: "COMP-2026-DOC-001",
  compliance_type: "ISO_DOCUMENTATION",
  record_category: "EMPLOYMENT_CONTRACT",
  employee_id: ObjectId("..."),
  employee_name: "Alex Johnson",
  employee_number: "BLIH-EMP-000045",
  document_type: "CONTRACT",
  document_id: ObjectId("..."),
  document_reference: "CONT-EMP-000045-001",
  document_url: "/storage/contracts/alex_johnson_contract_001.pdf",
  retention_period_years: 7,
  retention_start_date: ISODate("2026-07-15"),
  retention_end_date: ISODate("2033-07-15"),
  document_status: "ACTIVE",
  created_by: ObjectId("..."),
  created_at: ISODate("2026-03-01T10:00:00Z"),
  archived_in_compliance_system: true,
  compliance_system_id: "ISO-2026-0456",
  last_audit_check: ISODate("2026-07-20"),
  audit_status: "COMPLIANT",
  destruction_eligible_after: ISODate("2033-07-15"),
  destruction_scheduled: false,
  updated_at: ISODate("2026-07-20T10:00:00Z")
}
```

---

## Common Enums & Types

### Employee Status Enum

```javascript
const EmployeeStatus = {
  ACTIVE: 'ACTIVE',
  ON_PROBATION: 'ON_PROBATION',
  SUSPENDED: 'SUSPENDED',
  TERMINATED: 'TERMINATED',
  RESIGNED: 'RESIGNED',
  ON_LEAVE: 'ON_LEAVE',
};
```

### Employment Type Enum

```javascript
const EmploymentType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERN: 'INTERN',
  CONSULTANT: 'CONSULTANT',
};
```

### Job Grade Enum

```javascript
const JobGrade = {
  JUNIOR: 'JUNIOR',
  MID: 'MID',
  SENIOR: 'SENIOR',
  LEAD: 'LEAD',
  PRINCIPAL: 'PRINCIPAL',
  MANAGER: 'MANAGER',
  DIRECTOR: 'DIRECTOR',
  EXECUTIVE: 'EXECUTIVE',
  C_LEVEL: 'C_LEVEL',
};
```

### Workflow Status Enum

```javascript
const WorkflowStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
};
```

### Leave Type Enum

```javascript
const LeaveType = {
  ANNUAL: 'ANNUAL',
  SICK: 'SICK',
  MATERNITY: 'MATERNITY',
  PATERNITY: 'PATERNITY',
  BEREAVEMENT: 'BEREAVEMENT',
  UNPAID: 'UNPAID',
  STUDY: 'STUDY',
  EMERGENCY: 'EMERGENCY',
  COMPASSIONATE: 'COMPASSIONATE',
};
```

### Attendance Status Enum

```javascript
const AttendanceStatus = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
  EARLY_DEPARTURE: 'EARLY_DEPARTURE',
  ON_LEAVE: 'ON_LEAVE',
  HALF_DAY: 'HALF_DAY',
  REMOTE: 'REMOTE',
  BUSINESS_TRIP: 'BUSINESS_TRIP',
};
```

### Performance Rating Enum

```javascript
const PerformanceRating = {
  BELOW_EXPECTATIONS: 'BELOW_EXPECTATIONS',
  MEETS_EXPECTATIONS: 'MEETS_EXPECTATIONS',
  EXCEEDS_EXPECTATIONS: 'EXCEEDS_EXPECTATIONS',
  OUTSTANDING: 'OUTSTANDING',
};
```

### OKR Status Enum

```javascript
const OKRStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  AT_RISK: 'AT_RISK',
  DELAYED: 'DELAYED',
  ACHIEVED: 'ACHIEVED',
  PARTIALLY_ACHIEVED: 'PARTIALLY_ACHIEVED',
  MISSED: 'MISSED',
  COMPLETED: 'COMPLETED',
};
```

### Training Status Enum

```javascript
const TrainingStatus = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
};
```

### Incident Severity Enum

```javascript
const IncidentSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};
```

### Disciplinary Action Enum

```javascript
const DisciplinaryAction = {
  VERBAL_WARNING: 'VERBAL_WARNING',
  WRITTEN_WARNING: 'WRITTEN_WARNING',
  FINAL_WARNING: 'FINAL_WARNING',
  SUSPENSION: 'SUSPENSION',
  TERMINATION: 'TERMINATION',
};
```

### Offboarding Status Enum

```javascript
const OffboardingStatus = {
  INITIATED: 'INITIATED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_CLEARANCE: 'PENDING_CLEARANCE',
  CLEARED: 'CLEARED',
  COMPLETED: 'COMPLETED',
};
```

---

## Indexes & Performance

### Primary Indexes

```javascript
// Employee lookups
db.hr_employees.createIndex({ employee_id: 1 }, { unique: true });
db.hr_employees.createIndex({ keycloak_user_id: 1 }, { unique: true });
db.hr_employees.createIndex(
  { 'personal_info.work_email': 1 },
  { unique: true, sparse: true },
);

// Form lookups
db.hr_recruitment_requests.createIndex({ request_id: 1 }, { unique: true });
db.hr_job_postings.createIndex({ posting_id: 1 }, { unique: true });
db.hr_candidates.createIndex({ candidate_id: 1 }, { unique: true });

// Attendance, Leave & Time Management
db.hr_leave_requests.createIndex({ employee_id: 1, start_date: -1 });
db.hr_leave_requests.createIndex({ status: 1, submitted_at: -1 });
db.hr_attendance_logs.createIndex({ employee_id: 1, date: -1 });
db.hr_attendance_logs.createIndex({ date: 1, status: 1 });
db.hr_punctuality_records.createIndex({ employee_id: 1, violation_date: -1 });
db.hr_timesheets.createIndex({ employee_id: 1, year: 1, month: 1 });
db.hr_timesheets.createIndex({ status: 1, submitted_at: -1 });
db.hr_attendance_corrections.createIndex({ employee_id: 1, submitted_at: -1 });
db.hr_overtime_requests.createIndex({ employee_id: 1, date: -1 });
db.hr_overtime_requests.createIndex({ status: 1, submitted_at: -1 });

// Performance, OKRs & Career Development
db.hr_performance_reviews.createIndex({
  employee_id: 1,
  'review_period.year': -1,
  'review_period.quarter': -1,
});
db.hr_okrs.createIndex({ owner_id: 1, year: 1, quarter: 1 });
db.hr_okrs.createIndex({ overall_status: 1 });
db.hr_development_plans.createIndex({ employee_id: 1, status: 1 });
db.hr_transfer_requests.createIndex({ employee_id: 1, submitted_at: -1 });
db.hr_transfer_requests.createIndex({ status: 1 });
db.hr_promotion_letters.createIndex({ employee_id: 1, created_at: -1 });
db.hr_salary_adjustments.createIndex({ employee_id: 1, effective_date: -1 });
db.hr_skill_assessments.createIndex({ employee_id: 1, assessment_date: -1 });
db.hr_successor_nominations.createIndex({ position_id: 1, status: 1 });
db.hr_career_paths.createIndex({ department: 1, active: 1 });

// Training & Skill Development
db.hr_training_requests.createIndex({ employee_id: 1, submitted_at: -1 });
db.hr_training_requests.createIndex({ status: 1 });
db.hr_training_feedback.createIndex({ training_request_id: 1 });
db.hr_skill_gap_analyses.createIndex({ employee_id: 1, status: 1 });
db.hr_training_completions.createIndex({ employee_id: 1, completion_date: -1 });

// Employee Relations
db.hr_pulse_surveys.createIndex({ 'period.year': 1, 'period.quarter': 1 });
db.hr_pulse_surveys.createIndex({ status: 1 });
db.hr_disciplinary_actions.createIndex({ employee_id: 1, incident_date: -1 });
db.hr_incident_reports.createIndex({ incident_type: 1, status: 1 });
db.hr_incident_reports.createIndex({ incident_date: -1 });
db.hr_suggestion_submissions.createIndex({ submitted_by: 1, submitted_at: -1 });
db.hr_employee_recognition.createIndex({ nominee_id: 1, nominated_at: -1 });
db.hr_complaints.createIndex({ complainant_id: 1, submitted_at: -1 });
db.hr_complaints.createIndex({ status: 1 });
db.hr_mediation_records.createIndex({
  'party_a.employee_id': 1,
  created_at: -1,
});

// Exit, Offboarding & Compliance
db.hr_resignation_notices.createIndex({ employee_id: 1, resignation_date: -1 });
db.hr_resignation_notices.createIndex({ status: 1 });
db.hr_exit_interviews.createIndex({ employee_id: 1 });
db.hr_offboarding_checklists.createIndex({ employee_id: 1, status: 1 });
db.hr_asset_returns.createIndex({ employee_id: 1 });
db.hr_final_settlements.createIndex({ employee_id: 1 });
db.hr_compliance_records.createIndex({ employee_id: 1, retention_end_date: 1 });
```

### Performance Indexes

```javascript
// Common query patterns
db.hr_employees.createIndex({
  'employment.status': 1,
  'employment.department_id': 1,
});
db.hr_employees.createIndex({ 'employment.reporting_manager_id': 1 });
db.hr_employees.createIndex({
  'personal_info.last_name': 1,
  'personal_info.first_name': 1,
});

// Time-based queries
db.hr_leave_requests.createIndex({
  'leave_details.start_date': 1,
  'leave_details.end_date': 1,
});
db.hr_attendance_logs.createIndex({ date: -1, employee_id: 1 });

// Status-based queries
db.hr_candidates.createIndex({ job_posting_id: 1, status: 1 });
db.hr_onboarding_checklists.createIndex({ status: 1, join_date: 1 });
```

### Text Search Indexes

```javascript
// For searching candidates, employees
db.hr_candidates.createIndex({
  'personal_info.first_name': 'text',
  'personal_info.last_name': 'text',
  'career.skills': 'text',
});

db.hr_employees.createIndex({
  'personal_info.first_name': 'text',
  'personal_info.last_name': 'text',
  'employment.position': 'text',
});
```

---

_Schema Version: 1.0_  
_Last Updated: February 2026_  
_Total Collections Documented: 50_  
_Total Forms Mapped: 50_
