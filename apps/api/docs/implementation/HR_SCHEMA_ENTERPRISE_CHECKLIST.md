# HR Schema Enterprise Pattern — Checklist

This checklist maps your review comments to the **current** Prisma schema and code so you can see what is already addressed and what (if anything) remains for you to fix.

---

## 1. Position linked to UserEmployment

**Requirement:** UserEmployment must reference Position so HR formation is consistent.

**Status: Done**

- `UserEmployment.positionId` and `UserEmployment.position` exist in `schema.prisma` (Position is linked).
- Employee list/full APIs derive department from `employment.position.departmentId` and `employment.position.department.name`.

---

## 2. Department ownership — single source of truth

**Requirement:** Department should come from Employment → Position → Department. No duplicate department on User or UserEmployment.

**Status: Done**

- **User:** No `departmentId`. User has no direct department.
- **UserEmployment:** No `departmentId`. Department is derived via `employment.position.department`.
- **Position:** Has `departmentId` (positions belong to departments).
- **Application code:** List/get employees use `user.employment?.position?.departmentId` and `user.employment?.position?.department?.name` (no User or UserEmployment.departmentId).

So: Department is linked to employment only through Position; no dual ownership.

---

## 3. EmployeeDocument — verifiedBy relation

**Requirement:** `verifiedById` must have a relation to User.

**Status: Done**

- `EmployeeDocument.verifiedById` has relation `verifiedBy User? @relation("EmployeeDocumentVerifiedBy", fields: [verifiedById], references: [id], onDelete: SetNull)` in `schema.prisma`.
- `User.verifiedDocuments` exists for the back-relation.

---

## 4. JobDescription — linked to Position

**Requirement:** JobDescription should relate to Position (Position → JobDescription), not only Department.

**Status: Done**

- `JobDescription.positionId` and `JobDescription.position` exist.
- JobDescription has no `departmentId`; department is derived from `jobDescription.position.department` in use cases (list, get, create, update responses).
- List job descriptions supports both `departmentId` and `positionId` query params; filtering by department is done via `position.departmentId`.

---

## 5. Employment history

**Requirement:** When an employee changes department/position/manager, previous structure must be kept (e.g. UserEmploymentHistory).

**Status: Done**

- `UserEmploymentHistory` exists with: `userEmploymentId`, `userId`, `employeeCode`, `departmentId`, `positionId`, `employmentType`, `managerEmploymentId`, `effectiveFrom`, `effectiveTo`, `changeReason`, `changedById`.
- History keeps a snapshot of department/position/manager for reporting.

---

## 6. No departmentId on UserEmployment (no duplication with Position)

**Requirement:** Do not store department on UserEmployment; derive from Position to avoid Employment.departmentId ≠ Position.departmentId.

**Status: Done**

- `UserEmployment` has no `departmentId` in the schema.
- Department is only derived: Employment → Position → Department.

---

## Summary table

| Item                        | Requirement                                       | Schema / code status                                            |
| --------------------------- | ------------------------------------------------- | --------------------------------------------------------------- |
| Position ↔ UserEmployment   | Employment references Position                    | Done: `positionId` + `position` on UserEmployment               |
| Department ownership        | Single chain: Dept → Position → Employment → User | Done: no User.departmentId, no UserEmployment.departmentId      |
| EmployeeDocument.verifiedBy | Relation from verifiedById to User                | Done: `verifiedBy` relation defined                             |
| JobDescription ↔ Position   | JobDescription linked to Position                 | Done: `positionId` + `position` on JobDescription               |
| Employment history          | Model for dept/position/manager changes           | Done: UserEmploymentHistory with dept/position/manager snapshot |
| No Employment.departmentId  | Avoid dual source of truth                        | Done: not present on UserEmployment                             |

---

## What you may still need to fix or verify

1. **Migrations / DB state**  
   If an older migration or another branch ever added `User.departmentId` or `UserEmployment.departmentId`, ensure those columns are not re-introduced and that any existing columns are removed by migration if they exist in your DB.

2. **Other services or frontends**  
   Any client or service that still expects:
   - `user.departmentId`, or
   - `employment.departmentId`  
     should be updated to use:
   - `employment.position.departmentId` and
   - `employment.position.department.name`  
     (and ensure the API returns these where needed; the HR employees list/full APIs already do.)

3. **Employment history writes**  
   Application code that changes an employee’s position (or manager) should create/update `UserEmploymentHistory` and set `effectiveTo` on the previous record so reporting and audits are correct. If that write path is not implemented yet, that is the remaining piece to implement (logic only; schema is in place).

4. **Documentation**  
   Update any internal docs or runbooks that still describe “user’s department” or “employment department” as a direct field; state that department is derived from Employment → Position → Department.

---

**Conclusion:** The Prisma schema and the HR employee/job-description code already follow the enterprise pattern you described. The main follow-ups are: (1) ensure no legacy User/UserEmployment.departmentId in DB or migrations, (2) update other consumers to use derived department, (3) implement or verify employment-history writes on position/manager changes, and (4) align documentation.
