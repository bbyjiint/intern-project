-- Data Migration Script: Convert University-Faculty to Many-to-Many
-- Run this AFTER Prisma migration creates the new tables
-- This script safely migrates existing data

-- Step 1: Create UniversityFaculty entries from existing Faculty records
-- Each existing Faculty record becomes a UniversityFaculty entry
INSERT INTO "UniversityFaculty" (id, "universityId", "facultyId", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  f."universityId",
  f.id,
  f."createdAt",
  f."updatedAt"
FROM "Faculty" f
WHERE f."universityId" IS NOT NULL
ON CONFLICT ("universityId", "facultyId") DO NOTHING;

-- Step 2: Update CandidateUniversity to reference UniversityFaculty
-- For records that have both universityId and facultyId, link to the UniversityFaculty pair
UPDATE "CandidateUniversity" cu
SET "universityFacultyId" = uf.id
FROM "UniversityFaculty" uf
WHERE cu."universityId" = uf."universityId"
  AND cu."facultyId" = uf."facultyId"
  AND cu."facultyId" IS NOT NULL
  AND cu."universityFacultyId" IS NULL;

-- Step 3: Verification queries (uncomment to run)

-- Check migration success - should show matching counts
-- SELECT 
--   COUNT(DISTINCT f.id) as total_faculties,
--   COUNT(DISTINCT uf.id) as total_university_faculty_pairs,
--   COUNT(DISTINCT CASE WHEN cu."universityFacultyId" IS NOT NULL THEN cu.id END) as migrated_candidates
-- FROM "Faculty" f
-- LEFT JOIN "UniversityFaculty" uf ON uf."facultyId" = f.id
-- LEFT JOIN "CandidateUniversity" cu ON cu."universityFacultyId" = uf.id;

-- Check for orphaned CandidateUniversity records (should return 0)
-- SELECT COUNT(*) as orphaned_records
-- FROM "CandidateUniversity" cu
-- WHERE cu."facultyId" IS NOT NULL 
--   AND cu."universityFacultyId" IS NULL;

-- Check all faculties have at least one university (should return 0 rows)
-- SELECT f.id, f.name, COUNT(uf.id) as university_count
-- FROM "Faculty" f
-- LEFT JOIN "UniversityFaculty" uf ON uf."facultyId" = f.id
-- GROUP BY f.id, f.name
-- HAVING COUNT(uf.id) = 0;

-- Verify unique constraint works (should return 0 duplicates)
-- SELECT "universityId", "facultyId", COUNT(*) as count
-- FROM "UniversityFaculty"
-- GROUP BY "universityId", "facultyId"
-- HAVING COUNT(*) > 1;
