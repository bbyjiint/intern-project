/*
  Warnings:

  - You are about to drop the column `universityId` on the `CandidateProfile` table. All the data in the column will be lost.
  - You are about to drop the column `facultyId` on the `CandidateUniversity` table. All the data in the column will be lost.
  - You are about to drop the column `universityId` on the `Faculty` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Faculty` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[thname]` on the table `Faculty` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Faculty` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CandidateProfile" DROP CONSTRAINT "CandidateProfile_universityId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateUniversity" DROP CONSTRAINT "CandidateUniversity_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "Faculty" DROP CONSTRAINT "Faculty_universityId_fkey";

-- DropIndex
DROP INDEX "CandidateUniversity_facultyId_idx";

-- DropIndex
DROP INDEX "Faculty_universityId_idx";

-- DropIndex
DROP INDEX "Faculty_universityId_name_key";

-- AlterTable
ALTER TABLE "CandidateProfile" DROP COLUMN "universityId";

-- AlterTable
ALTER TABLE "CandidateUniversity" DROP COLUMN "facultyId",
ADD COLUMN     "universityFacultyId" UUID;

-- AlterTable
ALTER TABLE "Faculty" DROP COLUMN "universityId";

-- CreateTable
CREATE TABLE "UniversityFaculty" (
    "id" UUID NOT NULL,
    "universityId" UUID NOT NULL,
    "facultyId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UniversityFaculty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UniversityFaculty_universityId_idx" ON "UniversityFaculty"("universityId");

-- CreateIndex
CREATE INDEX "UniversityFaculty_facultyId_idx" ON "UniversityFaculty"("facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "UniversityFaculty_universityId_facultyId_key" ON "UniversityFaculty"("universityId", "facultyId");

-- CreateIndex
CREATE INDEX "CandidateUniversity_universityFacultyId_idx" ON "CandidateUniversity"("universityFacultyId");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_name_key" ON "Faculty"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_thname_key" ON "Faculty"("thname");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_code_key" ON "Faculty"("code");

-- CreateIndex
CREATE INDEX "University_code_idx" ON "University"("code");

-- AddForeignKey
ALTER TABLE "UniversityFaculty" ADD CONSTRAINT "UniversityFaculty_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityFaculty" ADD CONSTRAINT "UniversityFaculty_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateUniversity" ADD CONSTRAINT "CandidateUniversity_universityFacultyId_fkey" FOREIGN KEY ("universityFacultyId") REFERENCES "UniversityFaculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
