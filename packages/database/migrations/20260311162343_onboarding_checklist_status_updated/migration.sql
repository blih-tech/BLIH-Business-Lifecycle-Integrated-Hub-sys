/*
  Warnings:

  - The values [NOT_STARTED] on the enum `OnboardingChecklistStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OnboardingChecklistStatus_new" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'OVERDUE');
ALTER TABLE "public"."OnboardingChecklist" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "OnboardingChecklist" ALTER COLUMN "status" TYPE "OnboardingChecklistStatus_new" USING ("status"::text::"OnboardingChecklistStatus_new");
ALTER TYPE "OnboardingChecklistStatus" RENAME TO "OnboardingChecklistStatus_old";
ALTER TYPE "OnboardingChecklistStatus_new" RENAME TO "OnboardingChecklistStatus";
DROP TYPE "public"."OnboardingChecklistStatus_old";
ALTER TABLE "OnboardingChecklist" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
COMMIT;

-- AlterTable
ALTER TABLE "OnboardingChecklist" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
