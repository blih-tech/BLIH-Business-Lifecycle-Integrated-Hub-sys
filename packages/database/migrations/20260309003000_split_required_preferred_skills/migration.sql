-- Split Job skills into requiredSkills and preferredSkills arrays

-- Job table
ALTER TABLE "Job"
  ADD COLUMN IF NOT EXISTS "required_skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "preferred_skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Job'
      AND column_name = 'skills'
  ) THEN
    UPDATE "Job"
    SET "required_skills" = COALESCE("skills", ARRAY[]::TEXT[])
    WHERE COALESCE(array_length("required_skills", 1), 0) = 0;

    ALTER TABLE "Job" DROP COLUMN "skills";
  END IF;
END $$;

UPDATE "Job"
SET "preferred_skills" = ARRAY[]::TEXT[]
WHERE "preferred_skills" IS NULL;

ALTER TABLE "Job"
  ALTER COLUMN "preferred_skills" SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN "preferred_skills" SET NOT NULL;

-- JobDetailsForm table
ALTER TABLE "JobDetailsForm"
  ADD COLUMN IF NOT EXISTS "required_skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

DO $$
DECLARE preferred_type TEXT;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'JobDetailsForm'
      AND column_name = 'skills'
  ) THEN
    UPDATE "JobDetailsForm"
    SET "required_skills" = COALESCE("skills", ARRAY[]::TEXT[])
    WHERE COALESCE(array_length("required_skills", 1), 0) = 0;

    ALTER TABLE "JobDetailsForm" DROP COLUMN "skills";
  END IF;

  SELECT data_type
  INTO preferred_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'JobDetailsForm'
    AND column_name = 'preferred_skills';

  IF preferred_type IS NULL THEN
    ALTER TABLE "JobDetailsForm"
      ADD COLUMN "preferred_skills" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
  ELSIF preferred_type <> 'ARRAY' THEN
    ALTER TABLE "JobDetailsForm"
      ADD COLUMN "preferred_skills_tmp" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

    UPDATE "JobDetailsForm"
    SET "preferred_skills_tmp" =
      CASE
        WHEN "preferred_skills" IS NULL OR btrim("preferred_skills") = '' THEN ARRAY[]::TEXT[]
        ELSE ARRAY(
          SELECT trim(item)
          FROM unnest(regexp_split_to_array("preferred_skills", E'\\r?\\n|,')) AS item
          WHERE trim(item) <> ''
        )
      END;

    ALTER TABLE "JobDetailsForm" DROP COLUMN "preferred_skills";
    ALTER TABLE "JobDetailsForm" RENAME COLUMN "preferred_skills_tmp" TO "preferred_skills";
  ELSE
    UPDATE "JobDetailsForm"
    SET "preferred_skills" = ARRAY[]::TEXT[]
    WHERE "preferred_skills" IS NULL;

    ALTER TABLE "JobDetailsForm"
      ALTER COLUMN "preferred_skills" SET DEFAULT ARRAY[]::TEXT[],
      ALTER COLUMN "preferred_skills" SET NOT NULL;
  END IF;
END $$;
