-- Optional data integrity CHECK constraints (PostgreSQL).
-- Run after Prisma migrations. Drop first if re-running.

-- Compensation period: validTo IS NULL OR validTo > validFrom
ALTER TABLE "UserCompensationHistory" DROP CONSTRAINT IF EXISTS "UserCompensationHistory_validTo_after_validFrom";
ALTER TABLE "UserCompensationHistory" ADD CONSTRAINT "UserCompensationHistory_validTo_after_validFrom"
  CHECK ("validTo" IS NULL OR "validTo" > "validFrom");

-- Contract: endDate IS NULL OR endDate > startDate
ALTER TABLE "Contract" DROP CONSTRAINT IF EXISTS "Contract_endDate_after_startDate";
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_endDate_after_startDate"
  CHECK ("end_date" IS NULL OR "end_date" > "start_date");
