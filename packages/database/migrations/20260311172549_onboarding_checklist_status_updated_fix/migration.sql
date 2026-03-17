-- AlterEnum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'OnboardingChecklistStatus'
      AND e.enumlabel = 'NOT_STARTED'
  ) THEN
    ALTER TYPE "OnboardingChecklistStatus" ADD VALUE 'NOT_STARTED';
  END IF;
END $$;
