-- Add ApplicationStatus enum and JobApplication table
-- Note: this repo's migration history assumes an existing baseline schema;
-- this migration is intended to be applied onto the current database state.

DO $$ BEGIN
  CREATE TYPE "ApplicationStatus" AS ENUM ('NEW', 'SHORTLISTED', 'REVIEWED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "JobApplication" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "jobPostId" UUID NOT NULL,
  "candidateId" UUID NOT NULL,
  "status" "ApplicationStatus" NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "JobApplication"
    ADD CONSTRAINT "JobApplication_jobPostId_fkey"
    FOREIGN KEY ("jobPostId") REFERENCES "JobPost"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "JobApplication"
    ADD CONSTRAINT "JobApplication_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "JobApplication"
    ADD CONSTRAINT "JobApplication_jobPostId_candidateId_key"
    UNIQUE ("jobPostId", "candidateId");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "JobApplication_jobPostId_idx" ON "JobApplication"("jobPostId");
CREATE INDEX IF NOT EXISTS "JobApplication_candidateId_idx" ON "JobApplication"("candidateId");
CREATE INDEX IF NOT EXISTS "JobApplication_status_idx" ON "JobApplication"("status");
CREATE INDEX IF NOT EXISTS "JobApplication_createdAt_idx" ON "JobApplication"("createdAt");

