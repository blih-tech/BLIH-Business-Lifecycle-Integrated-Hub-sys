# HR Implementation Plan 4: Attendance & Leave Subsystem

**Version:** 1.0  
**Last Updated:** March 2026  
**Status:** Implemented (Phase 1–2)  
**Implementation order:** 5 (can parallel with Onboarding)

---

## 1. Overview and Objectives

### 1.1 Purpose

The Attendance & Leave subsystem covers **leave requests** (submit, approve/reject, balance checks, overlap validation), **leave balance** calculation by type and employment, and **attendance logs** (check-in/check-out, status). It supports lifecycle status ON_LEAVE when approved leave covers today.

### 1.2 Goals

- Leave requests: create, list, get, approve, reject; validate balance, notice, overlapping dates, handover for long leave.
- Leave balance: entitlements by employment type and leave type; used/pending/available.
- Attendance logs: record check-in/check-out per user per date; status (PRESENT, ON_LEAVE, LATE, etc.).
- Optional: update UserLifecycle to ON_LEAVE when approved leave covers current date (job or on approve).

### 1.3 Reference Documentation

| Document                                                  | Section / Use                                                        |
| --------------------------------------------------------- | -------------------------------------------------------------------- |
| [HR_LOGIC.md](../modules/HR_LOGIC.md)                     | §5 Attendance & Leave Logic (balance, validation, attendance events) |
| [DATABASE_SCHEMA_HR.md](../modules/DATABASE_SCHEMA_HR.md) | Sub-System 4: hr_leave_requests, hr_attendance_logs                  |

---

## 2. Schema Design (Prisma)

### 2.1 Enums

- **LeaveType:** ANNUAL, SICK, MATERNITY, PATERNITY, BEREAVEMENT, UNPAID, STUDY, EMERGENCY, COMPASSIONATE
- **LeaveRequestStatus:** DRAFT, PENDING, APPROVED, REJECTED, CANCELLED
- **AttendanceStatus:** PRESENT, ABSENT, LATE, EARLY_DEPARTURE, ON_LEAVE, HALF_DAY, REMOTE, BUSINESS_TRIP
- **LifecycleStatus:** added ON_LEAVE

### 2.2 Models

- **LeaveRequest** — id, requestId (unique), userId, leaveType, startDate, endDate, daysRequested, reason, description, contactDuringLeave (JSON), handoverDelegateId, handoverNotes, balanceSnapshot (JSON), submittedAt, approvals (JSON), status, approvedById, approvedAt, rejectionReason.
- **AttendanceLog** — id, userId, date, checkInAt, checkOutAt, totalMinutes, status, checkInMethod, checkOutMethod, notes; unique(userId, date).

---

## 3. API Design

### 3.1 Base Path

- `/api/v1/hr/leave`
- `/api/v1/hr/attendance`

### 3.2 Leave Endpoints

| Method | Path                        | Description                                    |
| ------ | --------------------------- | ---------------------------------------------- |
| POST   | /leave/requests             | Create leave request (draft or submit)         |
| GET    | /leave/requests             | List (filter: userId, status)                  |
| GET    | /leave/requests/:id         | Get one                                        |
| PATCH  | /leave/requests/:id         | Update draft / cancel                          |
| POST   | /leave/requests/:id/submit  | Submit for approval                            |
| POST   | /leave/requests/:id/approve | Approve (manager/HR)                           |
| POST   | /leave/requests/:id/reject  | Reject                                         |
| GET    | /leave/balance              | Get balance for user (and optional leave type) |

### 3.3 Attendance Endpoints

| Method | Path                 | Description                               |
| ------ | -------------------- | ----------------------------------------- |
| POST   | /attendance/logs     | Create or update log (check-in/check-out) |
| GET    | /attendance/logs     | List by userId, date range                |
| GET    | /attendance/logs/:id | Get one                                   |

---

## 4. Implementation Status

- [x] Schema: enums (LeaveType, LeaveRequestStatus, AttendanceStatus) and models (LeaveRequest, AttendanceLog); User relations; LifecycleStatus ON_LEAVE added.
- [x] Types package: `packages/types/src/hr/leave` and `hr/attendance` DTOs; LifecycleStatus in users includes ON_LEAVE.
- [x] Leave: create (with balance check, overlap and handover validation), list, get, submit, approve, reject; GET balance by userId (optional leaveType).
- [x] Attendance: upsert log (create or update by userId+date), list by userId and optional fromDate/toDate, get by id.
- [x] RBAC: LeavePermissions (VIEW, CREATE, APPROVE, REJECT); AttendancePermissions (VIEW, CREATE, UPDATE).
- [ ] Optional: lifecycle ON_LEAVE auto-set when approved leave covers today; scheduled job to revert.
- [ ] Optional: punctuality records, timesheets, attendance corrections (future phases).

### Migration

Run when DB is ready:  
`cd apps/api && npx prisma migrate dev --name attendance_leave_subsystem`
