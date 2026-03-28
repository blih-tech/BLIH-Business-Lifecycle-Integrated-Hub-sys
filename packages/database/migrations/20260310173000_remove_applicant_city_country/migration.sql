-- Applicant location simplification:
-- Move city/country data into location when location is empty, then drop city/country.

DO $$
BEGIN
  IF to_regclass('public."Applicant"') IS NOT NULL THEN
    UPDATE "Applicant"
    SET "location" = NULLIF(CONCAT_WS(', ', "city", "country"), '')
    WHERE ("location" IS NULL OR BTRIM("location") = '')
      AND ("city" IS NOT NULL OR "country" IS NOT NULL);

    ALTER TABLE "Applicant"
      DROP COLUMN IF EXISTS "city",
      DROP COLUMN IF EXISTS "country";
  END IF;
END $$;
