-- Remove predefined application fields; job application forms now use custom fields only
DROP TABLE IF EXISTS "JobApplicationPredefinedField";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'JobPredefinedFieldKey'
  ) THEN
    DROP TYPE "JobPredefinedFieldKey";
  END IF;
END
$$;
