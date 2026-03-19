DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SkillCategory') THEN
    CREATE TYPE "SkillCategory" AS ENUM ('TECHNICAL', 'BUSINESS');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VerificationStatus') THEN
    CREATE TYPE "VerificationStatus" AS ENUM ('NOT_VERIFIED', 'VERIFIED');
  END IF;
END $$;

ALTER TABLE "Skills"
  ADD COLUMN IF NOT EXISTS "category" "SkillCategory" DEFAULT 'TECHNICAL';

ALTER TABLE "UserSkill"
  ADD COLUMN IF NOT EXISTS "category" "SkillCategory" DEFAULT 'TECHNICAL',
  ADD COLUMN IF NOT EXISTS "status" "VerificationStatus" DEFAULT 'NOT_VERIFIED';

ALTER TABLE "CandidateUniversity"
  ADD COLUMN IF NOT EXISTS "isVerified" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "verifiedBy" text,
  ADD COLUMN IF NOT EXISTS "transcriptUrl" text;

ALTER TABLE "UserProjects"
  ADD COLUMN IF NOT EXISTS "githubUrl" text,
  ADD COLUMN IF NOT EXISTS "githubVerified" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "projectUrl" text,
  ADD COLUMN IF NOT EXISTS "fileUrl" text,
  ADD COLUMN IF NOT EXISTS "fileName" text;

ALTER TABLE "CertificateFile"
  ADD COLUMN IF NOT EXISTS "issuedBy" text,
  ADD COLUMN IF NOT EXISTS "issueDate" timestamp(3),
  ADD COLUMN IF NOT EXISTS "relatedSkills" text[] DEFAULT ARRAY[]::text[];

UPDATE "Skills"
SET "category" = CASE
  WHEN "name" IN ('UI Design', 'UX Research', 'Financial Analysis', 'Excel', 'Data Analysis', 'SEO', 'Content Strategy', 'Social Media Marketing')
    THEN 'BUSINESS'::"SkillCategory"
  ELSE 'TECHNICAL'::"SkillCategory"
END
WHERE "category" IS NULL OR "category" = 'TECHNICAL'::"SkillCategory";

UPDATE "UserSkill" us
SET
  "category" = COALESCE(us."category", s."category", 'TECHNICAL'::"SkillCategory"),
  "status" = COALESCE(us."status", 'NOT_VERIFIED'::"VerificationStatus")
FROM "Skills" s
WHERE us."skillId" = s."id";
