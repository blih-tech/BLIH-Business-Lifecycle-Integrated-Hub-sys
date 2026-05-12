# Recruitment frontend-backend gap report

This report documents remaining mismatches after the types-first integration pass for:

- `/hr/recruitment/requests`
- `/hr/recruitment/ready-to-post`
- `/hr/recruitment/active-posting`
- `/hr/recruitment/ongoing-recruitment`

Source contracts:

- `packages/types/src/recruitment/jobs.ts`
- `packages/types/src/recruitment/applicants.ts`
- `packages/types/src/recruitment/interviews.ts`
- `packages/types/src/recruitment/offers.ts`
- `apps/api/src/domains/hr/recruitment/*.controller.ts`

## 1) requests

## Integrated

- Uses real jobs APIs (`GET/POST/PATCH /hr/recruitment/jobs`, `POST /:id/approve`).
- Uses canonical DTO types from `@repo/types/recruitment/jobs`.
- Uses canonical permission constants from `@repo/types/rbac/permissions.constants`.

## Remaining gaps

1. **\"Approved by You\" logic is heuristic**
   - Current UI derives this from `requestForm.requestedBy === currentUserName`.
   - Backend truth for approvers is in `approvals[].approverId` + `decision`.
   - Impact: section label can be misleading.
   - Recommended fix: use authenticated user id (`/auth/me`) against `approvals`.

2. **Some request card display fields are adapted, not canonical domain fields**
   - Example: department is shown via UI labels while backend stores `departmentId` + request form string.
   - Impact: potential naming inconsistency.
   - Recommended fix: use department lookup dictionary from `/departments`.

## 2) ready-to-post

## Integrated

- Replaced mock list with real jobs query (`status=READY_TO_POST`).
- Wired publish action to `POST /hr/recruitment/jobs/:id/publish`.
- Uses canonical contracts and RBAC constants.

## Remaining gaps

1. **Preview dialog “revisions/approved by” is partially synthetic**
   - Derived from `progress` simplification in UI model.
   - Backend has richer approval step entities.
   - Impact: reviewer names/timestamps are not always real.
   - Recommended fix: map `approvals` directly with approver profile lookup.

## 3) active-posting

## Integrated

- Replaced mock jobs with real `PUBLISHED` jobs query.
- Replaced mock applicants with real applicants query.
- Wired close action to `POST /hr/recruitment/jobs/:id/close`.

## Remaining gaps

1. **Analytics charts still placeholder-backed**
   - Backend currently provides counters on `job` (`viewsCount`, `applicationsCount`, etc.) but not full timeseries distributions used by current charts.
   - Impact: charts may render empty arrays.
   - Recommended fix: add analytics endpoint(s) or simplify charts to available counters.

2. **Applicant AI analysis fields are not backend-native**
   - UI expects `aiAnalysis.{strengths,concerns,recommendation}` and rich `answers`.
   - Backend applicant contract does not provide those exact fields.
   - Impact: currently populated with fallback/derived values.
   - Recommended fix: either add backend AI analysis fields or refactor UI to contract-backed data only.

## 4) ongoing-recruitment

## Integrated

- Replaced mock jobs/applicants/interviews with API-backed datasets.
- Wired interview decision flow to applicant status update endpoint.

## Remaining gaps

1. **Committee management is still local UI state**
   - `SetupCommitteeDialog` currently does not persist to backend (no dedicated committee endpoint in current recruitment controllers).
   - Impact: committee changes are not durable.
   - Recommended fix: introduce backend committee assignment endpoint or remove editable committee UX.

2. **Interview review notes are not persisted**
   - Current flow updates applicant status but not interview participant feedback payloads.
   - Backend supports interview feedback endpoint.
   - Impact: review commentary can be lost.
   - Recommended fix: post reviews through interview feedback APIs before/with status transitions.

3. **Top match and some candidate cards are fallback-derived**
   - Missing explicit backend fields for “match score” composition in current contracts.
   - Impact: top match may not reflect true ranking logic.
   - Recommended fix: backend ranking endpoint or deterministic frontend ranking spec using existing fields.

## Summary

- **Completed:** type source-of-truth migration for API integration and core endpoint wiring for all four target pages.
- **Open structural gaps:** reviewer identity semantics, committee persistence, interview feedback persistence, and analytics/ranking richness.
