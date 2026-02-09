-- Add JobBookmark and JobIgnore tables

CREATE TABLE IF NOT EXISTS "JobBookmark" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "jobPostId" UUID NOT NULL,
  "candidateId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JobBookmark_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "JobBookmark"
    ADD CONSTRAINT "JobBookmark_jobPostId_fkey"
    FOREIGN KEY ("jobPostId") REFERENCES "JobPost"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "JobBookmark"
    ADD CONSTRAINT "JobBookmark_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "JobBookmark"
    ADD CONSTRAINT "JobBookmark_jobPostId_candidateId_key"
    UNIQUE ("jobPostId", "candidateId");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "JobBookmark_jobPostId_idx" ON "JobBookmark"("jobPostId");
CREATE INDEX IF NOT EXISTS "JobBookmark_candidateId_idx" ON "JobBookmark"("candidateId");

CREATE TABLE IF NOT EXISTS "JobIgnore" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "jobPostId" UUID NOT NULL,
  "candidateId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JobIgnore_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "JobIgnore"
    ADD CONSTRAINT "JobIgnore_jobPostId_fkey"
    FOREIGN KEY ("jobPostId") REFERENCES "JobPost"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "JobIgnore"
    ADD CONSTRAINT "JobIgnore_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "JobIgnore"
    ADD CONSTRAINT "JobIgnore_jobPostId_candidateId_key"
    UNIQUE ("jobPostId", "candidateId");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "JobIgnore_jobPostId_idx" ON "JobIgnore"("jobPostId");
CREATE INDEX IF NOT EXISTS "JobIgnore_candidateId_idx" ON "JobIgnore"("candidateId");

