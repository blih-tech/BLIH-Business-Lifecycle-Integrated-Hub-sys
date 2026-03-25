-- Set default for onboarding checklist status after enum value exists.
ALTER TABLE "OnboardingChecklist"
  ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';
