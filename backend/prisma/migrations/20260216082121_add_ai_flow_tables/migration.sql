-- AlterTable
ALTER TABLE "CandidateProfile" ADD COLUMN     "aiParsedData" JSONB,
ADD COLUMN     "overallScore" DOUBLE PRECISION,
ADD COLUMN     "profileStrength" DOUBLE PRECISION,
ADD COLUMN     "skillScore" DOUBLE PRECISION,
ADD COLUMN     "verificationFlags" JSONB;

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "aiInsights" TEXT,
ADD COLUMN     "matchScore" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "SkillTest" (
    "id" UUID NOT NULL,
    "skillName" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestQuestion" (
    "id" UUID NOT NULL,
    "testId" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctIdx" INTEGER NOT NULL,

    CONSTRAINT "TestQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTestResult" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "testId" UUID NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "proficiency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTestResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "SkillTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTestResult" ADD CONSTRAINT "UserTestResult_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTestResult" ADD CONSTRAINT "UserTestResult_testId_fkey" FOREIGN KEY ("testId") REFERENCES "SkillTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
