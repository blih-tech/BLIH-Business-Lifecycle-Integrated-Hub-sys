# HR Implementation Plan 5: Performance & OKR Subsystem

**Version:** 1.0  
**Last Updated:** February 2026  
**Status:** Ready for implementation  
**Implementation order:** 6

---

## 1. Overview and Objectives

**Purpose:** Quarterly and annual performance reviews, OKRs with key results and progress, final rating and category, raise recommendations at year-end, promotion eligibility.

**Reference docs:** [HR_LOGIC.md](../modules/HR_LOGIC.md) §6; [MODULE_HR_COMPLETE.md](../modules/MODULE_HR_COMPLETE.md) Forms 25–28, 32–33; [USER_FLOW_HR.md](../modules/USER_FLOW_HR.md) Flows 10–11, 18–20; [DATABASE_SCHEMA_HR.md](../modules/DATABASE_SCHEMA_HR.md) § Sub-System 5.

---

## 2. Schema (Prisma)

**Enums:** ReviewPeriodType, ReviewStatus, PerformanceCategory, OKRStatus, KeyResultType, KeyResultStatus.

**Models:**

- **ReviewPeriodConfig** — year, quarter, type, windowOpensAt, selfAssessmentDueAt, managerReviewDueAt, windowClosesAt.
- **PerformanceReview** — userId, periodYear, periodQuarter, selfAssessment (JSON), managerReview (JSON), finalRating, category, raiseRecommendation (JSON), promotionEligible, completedAt.
- **OKR** — userId, parentOkrId, periodYear, periodQuarter, title, description, status, overallProgress, overallStatus, startDate, endDate.
- **KeyResult** — okrId, title, type (NUMERIC/PERCENTAGE/BOOLEAN/MILESTONE), targetValue, currentValue, progress, status, weight.

---

## 3. API Endpoints

- GET/POST `/performance/periods`
- GET/POST/PATCH `/performance/reviews`; PATCH `.../self`, `.../manager`; POST `.../complete`
- GET/POST/PATCH `/okrs`; PATCH `/okrs/:id/key-results/:krId`; GET `.../progress`
- GET `/performance/summary/:userId/:year`

---

## 4. Business Logic (HR_LOGIC §6)

- **Windows:** Open 15 days before period end; self due 14 days after end; manager 7 days after; close 30 days after.
- **Final rating:** (selfAvg × 0.4) + (managerAvg × 0.6). Category: ≥4.5 Outstanding, ≥4.0 Exceeds, ≥3.0 Meets, ≥2.0 Below, &lt;2.0 Unsatisfactory.
- **Raise matrix (annual):** Outstanding 10–15%, Exceeds 7–10%, Meets 3–5%, Below 0%, Unsatisfactory -5–0%.
- **OKR progress:** Per KR type compute %; overall = average of KRs; status On Track / At Risk / Delayed / Achieved.

---

## 5. Implementation Phases

1. **Schema:** Add PerformanceReview, OKR, KeyResult; migration.
2. **Types:** DTOs for review, OKR, KeyResult.
3. **Review periods:** Config or compute window dates; GET periods.
4. **Reviews:** Create review; self/manager submit; complete → final rating, category, raise recommendation.
5. **OKRs:** CRUD OKR and KeyResult; progress calculation; GET progress.
6. **Annual summary:** Aggregate quarters + OKR completion %; notifications; RBAC and tests.

---

## 6. Dependencies and Acceptance Criteria

**Dependencies:** Employee Records (User, JobDescription, UserCompensation); Approval for salary/promotion.

**Acceptance criteria:**

- [ ] Review periods and reviews with self/manager and final rating/category.
- [ ] OKRs with key results and progress; annual summary and raise recommendation.
- [ ] Notifications for review due and overdue.
