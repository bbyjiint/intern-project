ALTER TABLE "JobPost"
  ADD COLUMN IF NOT EXISTS "positionsAvailable" integer,
  ADD COLUMN IF NOT EXISTS "gpa" text,
  ADD COLUMN IF NOT EXISTS "positions" text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS "workingDaysHours" text,
  ADD COLUMN IF NOT EXISTS "locationProvinceId" uuid;

UPDATE "JobPost"
SET "positions" = CASE
  WHEN COALESCE(array_length("positions", 1), 0) = 0 AND "jobType" IS NOT NULL
    THEN ARRAY["jobType"]
  ELSE COALESCE("positions", ARRAY[]::text[])
END;

CREATE INDEX IF NOT EXISTS "JobPost_locationProvinceId_idx"
  ON "JobPost" ("locationProvinceId");
