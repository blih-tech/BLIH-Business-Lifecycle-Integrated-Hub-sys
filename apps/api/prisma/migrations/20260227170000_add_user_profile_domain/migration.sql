-- Add professional user profile domain (profile, employment, compensation, lifecycle)

-- 1) Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmploymentType') THEN
    CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TEMPORARY');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PayFrequency') THEN
    CREATE TYPE "PayFrequency" AS ENUM ('MONTHLY', 'BIWEEKLY', 'WEEKLY', 'ANNUAL');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LifecycleStatus') THEN
    CREATE TYPE "LifecycleStatus" AS ENUM ('ONBOARDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'RESIGNED', 'RETIRED');
  END IF;
END
$$;

-- 2) Department model + User.departmentId
CREATE TABLE IF NOT EXISTS "Department" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Department_name_key" ON "Department"("name");

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "departmentId" UUID;
CREATE INDEX IF NOT EXISTS "User_departmentId_idx" ON "User"("departmentId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'User_departmentId_fkey'
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_departmentId_fkey"
      FOREIGN KEY ("departmentId") REFERENCES "Department"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- 3) Profile/employment/compensation/lifecycle tables
CREATE TABLE IF NOT EXISTS "UserProfile" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "dateOfBirth" TIMESTAMP(3),
  "gender" TEXT,
  "nationality" TEXT,
  "maritalStatus" TEXT,
  "avatarUrl" TEXT,
  "addressLine1" TEXT,
  "addressLine2" TEXT,
  "city" TEXT,
  "state" TEXT,
  "country" TEXT,
  "postalCode" TEXT,
  "emergencyContactName" TEXT,
  "emergencyContactPhone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserProfile_userId_key" ON "UserProfile"("userId");

CREATE TABLE IF NOT EXISTS "UserEmployment" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "employeeCode" TEXT,
  "jobTitle" TEXT,
  "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
  "managerEmploymentId" UUID,
  "hiredAt" TIMESTAMP(3),
  "probationEndAt" TIMESTAMP(3),
  "confirmedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserEmployment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserEmployment_userId_key" ON "UserEmployment"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "UserEmployment_employeeCode_key" ON "UserEmployment"("employeeCode");
CREATE INDEX IF NOT EXISTS "UserEmployment_managerEmploymentId_idx" ON "UserEmployment"("managerEmploymentId");

CREATE TABLE IF NOT EXISTS "UserCompensation" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "baseSalary" DECIMAL(15,2),
  "currency" TEXT,
  "payFrequency" "PayFrequency" NOT NULL DEFAULT 'MONTHLY',
  "bonusEligible" BOOLEAN NOT NULL DEFAULT false,
  "bonusRate" DECIMAL(5,2),
  "effectiveFrom" TIMESTAMP(3),
  "effectiveTo" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserCompensation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserCompensation_userId_key" ON "UserCompensation"("userId");

CREATE TABLE IF NOT EXISTS "UserCompensationHistory" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "baseSalary" DECIMAL(15,2),
  "currency" TEXT,
  "payFrequency" "PayFrequency" NOT NULL DEFAULT 'MONTHLY',
  "bonusEligible" BOOLEAN NOT NULL DEFAULT false,
  "bonusRate" DECIMAL(5,2),
  "validFrom" TIMESTAMP(3) NOT NULL,
  "validTo" TIMESTAMP(3),
  "changeReason" TEXT,
  "changedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserCompensationHistory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "UserCompensationHistory_userId_idx" ON "UserCompensationHistory"("userId");
CREATE INDEX IF NOT EXISTS "UserCompensationHistory_userId_validFrom_idx" ON "UserCompensationHistory"("userId", "validFrom");

CREATE TABLE IF NOT EXISTS "UserLifecycle" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "status" "LifecycleStatus" NOT NULL DEFAULT 'ONBOARDING',
  "onboardedAt" TIMESTAMP(3),
  "suspendedAt" TIMESTAMP(3),
  "terminatedAt" TIMESTAMP(3),
  "terminationReason" TEXT,
  "offboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserLifecycle_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserLifecycle_userId_key" ON "UserLifecycle"("userId");

-- 4) FKs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserProfile_userId_fkey') THEN
    ALTER TABLE "UserProfile"
      ADD CONSTRAINT "UserProfile_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserEmployment_userId_fkey') THEN
    ALTER TABLE "UserEmployment"
      ADD CONSTRAINT "UserEmployment_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserEmployment_managerEmploymentId_fkey') THEN
    ALTER TABLE "UserEmployment"
      ADD CONSTRAINT "UserEmployment_managerEmploymentId_fkey"
      FOREIGN KEY ("managerEmploymentId") REFERENCES "UserEmployment"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserCompensation_userId_fkey') THEN
    ALTER TABLE "UserCompensation"
      ADD CONSTRAINT "UserCompensation_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserCompensationHistory_userId_fkey') THEN
    ALTER TABLE "UserCompensationHistory"
      ADD CONSTRAINT "UserCompensationHistory_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserLifecycle_userId_fkey') THEN
    ALTER TABLE "UserLifecycle"
      ADD CONSTRAINT "UserLifecycle_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;

-- 5) Backfill from old User.position/status
INSERT INTO "UserEmployment" (
  "id", "userId", "jobTitle", "employmentType", "createdAt", "updatedAt"
)
SELECT u."id", u."id", NULLIF(trim(u."position"), ''), 'FULL_TIME', NOW(), NOW()
FROM "User" u
WHERE NOT EXISTS (
  SELECT 1 FROM "UserEmployment" ue WHERE ue."userId" = u."id"
);

INSERT INTO "UserLifecycle" (
  "id", "userId", "status", "onboardedAt", "suspendedAt", "createdAt", "updatedAt"
)
SELECT
  u."id",
  u."id",
  CASE
    WHEN u."status" = 'ACTIVE' THEN 'ACTIVE'::"LifecycleStatus"
    WHEN u."status" = 'DISABLED' THEN 'SUSPENDED'::"LifecycleStatus"
    ELSE 'ONBOARDING'::"LifecycleStatus"
  END,
  CASE WHEN u."status" = 'ACTIVE' THEN NOW() ELSE NULL END,
  CASE WHEN u."status" = 'DISABLED' THEN NOW() ELSE NULL END,
  NOW(),
  NOW()
FROM "User" u
WHERE NOT EXISTS (
  SELECT 1 FROM "UserLifecycle" ul WHERE ul."userId" = u."id"
);

-- 6) Remove old business column from User
ALTER TABLE "User" DROP COLUMN IF EXISTS "position";
