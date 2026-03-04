CREATE TYPE "DayOfWeek" AS ENUM (
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
);

CREATE TABLE "WorkSchedule" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "timezone" VARCHAR(64),
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "late_threshold_minutes" INTEGER NOT NULL DEFAULT 15,
  "standard_minutes_per_day" INTEGER NOT NULL DEFAULT 480,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WorkSchedule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkScheduleDay" (
  "id" UUID NOT NULL,
  "schedule_id" UUID NOT NULL,
  "day_of_week" "DayOfWeek" NOT NULL,
  "is_working_day" BOOLEAN NOT NULL DEFAULT true,
  "start_minute" INTEGER,
  "end_minute" INTEGER,
  "expected_minutes" INTEGER,
  "remote_allowed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WorkScheduleDay_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserWorkSchedule" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "schedule_id" UUID NOT NULL,
  "effective_from" DATE NOT NULL,
  "effective_to" DATE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UserWorkSchedule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Holiday" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "country_id" UUID,
  "is_recurring_annual" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeaveApproval" (
  "id" UUID NOT NULL,
  "leave_request_id" UUID NOT NULL,
  "approver_id" UUID NOT NULL,
  "level" INTEGER NOT NULL,
  "decision" "ApprovalDecision" NOT NULL DEFAULT 'PENDING',
  "comments" TEXT,
  "decided_at" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LeaveApproval_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeaveBalance" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "leave_type" "LeaveType" NOT NULL,
  "year" INTEGER NOT NULL,
  "total_days" DECIMAL(5,2) NOT NULL,
  "used_days" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "pending_days" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "carried_over" DECIMAL(5,2) DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "LeaveRequest"
  ADD COLUMN "start_half_day" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "end_half_day" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "LeaveRequest"
  DROP COLUMN "approvals";

ALTER TABLE "AttendanceLog"
  ADD COLUMN "is_auto_calculated" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "overtime_minutes" INTEGER,
  ADD COLUMN "overtime_approved" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "check_in_ip" VARCHAR(64),
  ADD COLUMN "check_in_location" JSONB,
  ADD COLUMN "reconciled_at" TIMESTAMP(3);

CREATE UNIQUE INDEX "WorkSchedule_name_key"
ON "WorkSchedule"("name");

CREATE INDEX "WorkSchedule_is_default_idx"
ON "WorkSchedule"("is_default");

CREATE INDEX "WorkScheduleDay_schedule_id_idx"
ON "WorkScheduleDay"("schedule_id");

CREATE UNIQUE INDEX "WorkScheduleDay_schedule_id_day_of_week_key"
ON "WorkScheduleDay"("schedule_id", "day_of_week");

CREATE INDEX "UserWorkSchedule_user_id_idx"
ON "UserWorkSchedule"("user_id");

CREATE INDEX "UserWorkSchedule_schedule_id_idx"
ON "UserWorkSchedule"("schedule_id");

CREATE INDEX "UserWorkSchedule_user_id_effective_from_idx"
ON "UserWorkSchedule"("user_id", "effective_from");

CREATE INDEX "Holiday_date_idx"
ON "Holiday"("date");

CREATE INDEX "Holiday_country_id_idx"
ON "Holiday"("country_id");

CREATE UNIQUE INDEX "Holiday_name_date_country_id_key"
ON "Holiday"("name", "date", "country_id");

CREATE INDEX "LeaveRequest_approved_by_id_idx"
ON "LeaveRequest"("approved_by_id");

CREATE INDEX "LeaveRequest_submitted_at_idx"
ON "LeaveRequest"("submitted_at");

CREATE INDEX "LeaveApproval_leave_request_id_idx"
ON "LeaveApproval"("leave_request_id");

CREATE INDEX "LeaveApproval_approver_id_idx"
ON "LeaveApproval"("approver_id");

CREATE UNIQUE INDEX "LeaveApproval_leave_request_id_level_key"
ON "LeaveApproval"("leave_request_id", "level");

CREATE INDEX "LeaveBalance_user_id_idx"
ON "LeaveBalance"("user_id");

CREATE UNIQUE INDEX "LeaveBalance_user_id_leave_type_year_key"
ON "LeaveBalance"("user_id", "leave_type", "year");

CREATE INDEX "AttendanceLog_user_id_date_idx"
ON "AttendanceLog"("user_id", "date");

CREATE INDEX "ProbationEvaluation_evaluation_round_idx"
ON "ProbationEvaluation"("evaluation_round");

ALTER TABLE "WorkScheduleDay"
  ADD CONSTRAINT "WorkScheduleDay_schedule_id_fkey"
  FOREIGN KEY ("schedule_id") REFERENCES "WorkSchedule"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "UserWorkSchedule"
  ADD CONSTRAINT "UserWorkSchedule_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "UserWorkSchedule"
  ADD CONSTRAINT "UserWorkSchedule_schedule_id_fkey"
  FOREIGN KEY ("schedule_id") REFERENCES "WorkSchedule"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "Holiday"
  ADD CONSTRAINT "Holiday_country_id_fkey"
  FOREIGN KEY ("country_id") REFERENCES "CountryReference"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "LeaveRequest"
  ADD CONSTRAINT "LeaveRequest_handover_delegate_id_fkey"
  FOREIGN KEY ("handover_delegate_id") REFERENCES "User"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE "LeaveApproval"
  ADD CONSTRAINT "LeaveApproval_leave_request_id_fkey"
  FOREIGN KEY ("leave_request_id") REFERENCES "LeaveRequest"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE "LeaveApproval"
  ADD CONSTRAINT "LeaveApproval_approver_id_fkey"
  FOREIGN KEY ("approver_id") REFERENCES "User"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

ALTER TABLE "LeaveBalance"
  ADD CONSTRAINT "LeaveBalance_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "User"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
