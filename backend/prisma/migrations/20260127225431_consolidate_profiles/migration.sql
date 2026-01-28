-- Create Profile table
CREATE TABLE "Profile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "profileType" "UserRole" NOT NULL,
    
    -- Candidate-specific fields
    "studentCode" TEXT,
    "fullName" TEXT,
    "contactEmail" VARCHAR(255),
    "phoneNumber" VARCHAR(32),
    "desiredPosition" TEXT,
    "bio" TEXT,
    "major" TEXT,
    "studyYear" INTEGER,
    "universityId" UUID,
    
    -- Company-specific fields
    "companyName" TEXT,
    "about" TEXT,
    "location" TEXT,
    "province" TEXT,
    "logoURL" TEXT,
    "recruiterName" TEXT,
    "recruiterPosition" TEXT,
    "registrationNum" TEXT,
    
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on userId
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- Create unique constraint on studentCode (nullable)
CREATE UNIQUE INDEX "Profile_studentCode_key" ON "Profile"("studentCode") WHERE "studentCode" IS NOT NULL;

-- Create indexes
CREATE INDEX "Profile_universityId_idx" ON "Profile"("universityId");
CREATE INDEX "Profile_profileType_idx" ON "Profile"("profileType");

-- Migrate data from CandidateProfile
INSERT INTO "Profile" (
    "id", "userId", "profileType",
    "studentCode", "fullName", "contactEmail", "phoneNumber", 
    "desiredPosition", "bio", "major", "studyYear", "universityId",
    "createdAt", "updatedAt"
)
SELECT 
    "id", "userId", 'CANDIDATE'::"UserRole",
    "studentCode", "fullName", "contactEmail", "phoneNumber",
    "desiredPosition", "bio", "major", "studyYear", "universityId",
    "createdAt", "updatedAt"
FROM "CandidateProfile";

-- Migrate data from CompanyProfile (preserve IDs for foreign key references)
INSERT INTO "Profile" (
    "id", "userId", "profileType",
    "companyName", "about", "location", "province",
    "logoURL", "recruiterName", "recruiterPosition", "registrationNum",
    "createdAt", "updatedAt"
)
SELECT 
    "id", "userId", 'COMPANY'::"UserRole",
    "companyName", "about", "location", "province",
    "logoURL", "recruiterName", "recruiterPosition", "registrationNum",
    "createdAt", "updatedAt"
FROM "CompanyProfile";

-- Update foreign keys in related tables
-- Update CandidateContactFile
ALTER TABLE "CandidateContactFile" 
    DROP CONSTRAINT IF EXISTS "CandidateContactFile_candidateId_fkey",
    ADD CONSTRAINT "CandidateContactFile_candidateId_fkey" 
    FOREIGN KEY ("candidateId") REFERENCES "Profile"("id") ON DELETE CASCADE;

-- Update CertificateFile
ALTER TABLE "CertificateFile" 
    DROP CONSTRAINT IF EXISTS "CertificateFile_candidateId_fkey",
    ADD CONSTRAINT "CertificateFile_candidateId_fkey" 
    FOREIGN KEY ("candidateId") REFERENCES "Profile"("id") ON DELETE CASCADE;

-- Update UserSkill
ALTER TABLE "UserSkill" 
    DROP CONSTRAINT IF EXISTS "UserSkill_candidateId_fkey",
    ADD CONSTRAINT "UserSkill_candidateId_fkey" 
    FOREIGN KEY ("candidateId") REFERENCES "Profile"("id") ON DELETE CASCADE;

-- Update WorkHistory
ALTER TABLE "WorkHistory" 
    DROP CONSTRAINT IF EXISTS "WorkHistory_candidateId_fkey",
    ADD CONSTRAINT "WorkHistory_candidateId_fkey" 
    FOREIGN KEY ("candidateId") REFERENCES "Profile"("id") ON DELETE CASCADE;

-- Update CandidateUniversity
ALTER TABLE "CandidateUniversity" 
    DROP CONSTRAINT IF EXISTS "CandidateUniversity_candidateId_fkey",
    ADD CONSTRAINT "CandidateUniversity_candidateId_fkey" 
    FOREIGN KEY ("candidateId") REFERENCES "Profile"("id") ON DELETE CASCADE;

-- Update CompanyEmail
ALTER TABLE "CompanyEmail" 
    DROP CONSTRAINT IF EXISTS "CompanyEmail_companyId_fkey",
    ADD CONSTRAINT "CompanyEmail_companyId_fkey" 
    FOREIGN KEY ("companyId") REFERENCES "Profile"("id") ON DELETE CASCADE;

-- Update CompanyPhone
ALTER TABLE "CompanyPhone" 
    DROP CONSTRAINT IF EXISTS "CompanyPhone_companyId_fkey",
    ADD CONSTRAINT "CompanyPhone_companyId_fkey" 
    FOREIGN KEY ("companyId") REFERENCES "Profile"("id") ON DELETE CASCADE;

-- Update University relation
ALTER TABLE "Profile" 
    ADD CONSTRAINT "Profile_universityId_fkey" 
    FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update User relation
ALTER TABLE "Profile" 
    ADD CONSTRAINT "Profile_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop old tables (after all foreign keys are updated)
DROP TABLE IF EXISTS "CandidateProfile" CASCADE;
DROP TABLE IF EXISTS "CompanyProfile" CASCADE;
