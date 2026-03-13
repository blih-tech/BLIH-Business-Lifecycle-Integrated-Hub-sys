-- AlterEnum
ALTER TYPE "OnboardingChecklistStatus" ADD VALUE 'NOT_STARTED';

-- AlterTable
ALTER TABLE "OnboardingChecklist" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';
