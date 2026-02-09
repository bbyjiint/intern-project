-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('BACHELOR', 'MASTERS', 'PHD');

-- CreateTable
CREATE TABLE "Faculty" (
    "id" UUID NOT NULL,
    "universityId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "thname" TEXT,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateUniversity" (
    "id" UUID NOT NULL,
    "candidateId" UUID NOT NULL,
    "universityId" UUID NOT NULL,
    "facultyId" UUID,
    "educationLevel" "EducationLevel" NOT NULL,
    "degreeName" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "gpa" DOUBLE PRECISION,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateUniversity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Faculty_universityId_idx" ON "Faculty"("universityId");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_universityId_name_key" ON "Faculty"("universityId", "name");

-- CreateIndex
CREATE INDEX "CandidateUniversity_candidateId_idx" ON "CandidateUniversity"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateUniversity_universityId_idx" ON "CandidateUniversity"("universityId");

-- CreateIndex
CREATE INDEX "CandidateUniversity_facultyId_idx" ON "CandidateUniversity"("facultyId");

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateUniversity" ADD CONSTRAINT "CandidateUniversity_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateUniversity" ADD CONSTRAINT "CandidateUniversity_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateUniversity" ADD CONSTRAINT "CandidateUniversity_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
