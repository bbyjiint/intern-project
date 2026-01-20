# Migration Guide: Adding Faculty and CandidateUniversity Tables

## 📋 Overview

This guide will help you safely migrate your database to support the new `Faculty` and `CandidateUniversity` tables while preserving all existing data.

## ✅ Pre-Migration Checklist

- [ ] **Backup your database** (IMPORTANT!)
- [ ] Verify `DATABASE_URL` is correct in `backend/.env`
- [ ] Ensure no active database connections
- [ ] Review the schema changes in `schema.prisma`

## 🚀 Step-by-Step Migration

### Step 1: Review Schema Changes

The schema now includes:
- ✅ **Faculty** table (new) - Links to University
- ✅ **CandidateUniversity** table (new) - Junction table for multiple universities
- ✅ **EducationLevel** enum (BACHELOR, MASTERS, PHD)
- ✅ **Backward compatibility** - Old `universityId` field in `CandidateProfile` is preserved

### Step 2: Create the Migration

Navigate to the backend directory and create the migration:

```bash
cd backend
npm run prisma:migrate
```

When prompted, enter a migration name like:
```
add_faculty_and_candidate_university
```

This will:
1. Create a new migration file in `prisma/migrations/`
2. Apply the migration to your database
3. Generate the updated Prisma Client

### Step 3: Verify Migration Success

After migration, verify everything worked:

```bash
# Generate Prisma Client (if not done automatically)
npm run prisma:generate

# Open Prisma Studio to verify tables
npm run prisma:studio
```

In Prisma Studio, you should see:
- ✅ `Faculty` table
- ✅ `CandidateUniversity` table
- ✅ `CandidateProfile` still has `universityId` field (backward compatible)
- ✅ All existing data is intact

## 📊 Data Migration (Optional - For Later)

If you want to migrate existing `universityId` data to the new `CandidateUniversity` table, you can create a data migration script:

### Example Migration Script

Create `prisma/migrate-existing-universities.sql`:

```sql
-- Migrate existing universityId to CandidateUniversity table
INSERT INTO "CandidateUniversity" (
  id,
  "candidateId",
  "universityId",
  "educationLevel",
  "isCurrent",
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid(),
  cp.id,
  cp."universityId",
  'BACHELOR'::"EducationLevel",  -- Default to BACHELOR, update manually if needed
  true,  -- Assume current if they have a university
  cp."createdAt",
  cp."updatedAt"
FROM "CandidateProfile" cp
WHERE cp."universityId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM "CandidateUniversity" cu 
    WHERE cu."candidateId" = cp.id 
      AND cu."universityId" = cp."universityId"
  );
```

**⚠️ Important:** Only run this script if you want to migrate existing data. You can keep both approaches working simultaneously.

## 🎯 Using the New Schema

### Example: Create a Candidate with University

```typescript
// Using Prisma Client
import { PrismaClient, EducationLevel } from '@prisma/client';

const prisma = new PrismaClient();

// Create candidate with university and faculty
const candidate = await prisma.candidateProfile.create({
  data: {
    userId: 'user-uuid',
    fullName: 'John Doe',
    // ... other fields
    CandidateUniversity: {
      create: {
        universityId: 'university-uuid',
        facultyId: 'faculty-uuid',  // Optional
        educationLevel: EducationLevel.BACHELOR,
        degreeName: 'Computer Science',
        startDate: new Date('2020-09-01'),
        isCurrent: true,
        gpa: 3.5
      }
    }
  },
  include: {
    CandidateUniversity: {
      include: {
        University: true,
        Faculty: true
      }
    }
  }
});
```

### Example: Query Candidate with Universities

```typescript
const candidate = await prisma.candidateProfile.findUnique({
  where: { id: 'candidate-uuid' },
  include: {
    CandidateUniversity: {
      include: {
        University: true,
        Faculty: true
      },
      orderBy: {
        startDate: 'desc'
      }
    }
  }
});
```

### Example: Add Multiple Universities

```typescript
// Add multiple educational experiences
await prisma.candidateUniversity.createMany({
  data: [
    {
      candidateId: 'candidate-uuid',
      universityId: 'university-1-uuid',
      facultyId: 'faculty-1-uuid',
      educationLevel: EducationLevel.BACHELOR,
      startDate: new Date('2020-09-01'),
      endDate: new Date('2024-05-31'),
      isCurrent: false
    },
    {
      candidateId: 'candidate-uuid',
      universityId: 'university-2-uuid',
      facultyId: 'faculty-2-uuid',
      educationLevel: EducationLevel.MASTERS,
      startDate: new Date('2024-09-01'),
      isCurrent: true
    }
  ]
});
```

## 🔧 Creating Faculty Data

You'll need to seed faculty data for each university. Example:

```sql
-- Example: Add faculties to a university
INSERT INTO "Faculty" (id, "universityId", name, "thname", code, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'university-uuid', 'Engineering', 'วิศวกรรมศาสตร์', 'ENG', NOW(), NOW()),
  (gen_random_uuid(), 'university-uuid', 'Science', 'วิทยาศาสตร์', 'SCI', NOW(), NOW()),
  (gen_random_uuid(), 'university-uuid', 'Business', 'บริหารธุรกิจ', 'BUS', NOW(), NOW());
```

Or create a seed script similar to your existing `seed-universities.sql`.

## ⚠️ Troubleshooting

### Issue: Migration fails with "relation already exists"
**Solution:** The table might already exist. Check your database and remove the conflicting table if it's empty, or use `prisma migrate reset` (⚠️ WARNING: This deletes all data!)

### Issue: Foreign key constraint errors
**Solution:** Ensure all referenced universities exist before creating CandidateUniversity records.

### Issue: Prisma Client not updated
**Solution:** Run `npm run prisma:generate` manually.

## 📝 Next Steps After Migration

1. **Update your API endpoints** to support the new `CandidateUniversity` table
2. **Update frontend forms** to allow selecting faculty and education level
3. **Create faculty seed data** for your universities
4. **Gradually migrate** existing `universityId` data to `CandidateUniversity` (optional)
5. **Update documentation** with new API endpoints

## 🔄 Rollback (If Needed)

If you need to rollback the migration:

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back <migration-name>

# Or manually edit the database (not recommended)
```

## ✅ Verification Checklist

After migration, verify:
- [ ] All existing data is intact
- [ ] New tables (`Faculty`, `CandidateUniversity`) exist
- [ ] Old `universityId` field still works
- [ ] Prisma Client generated successfully
- [ ] No errors in application logs
- [ ] Can create new `CandidateUniversity` records
- [ ] Can query candidates with universities

---

**Need Help?** Check Prisma documentation: https://www.prisma.io/docs/concepts/components/prisma-migrate
