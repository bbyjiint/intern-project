import prisma from '../src/utils/prisma.js';

async function main() {
  console.log('Creating Subdistrict table...');
  
  const statements = [
    `CREATE TABLE IF NOT EXISTS "Subdistrict" (
      "id" UUID NOT NULL DEFAULT gen_random_uuid(),
      "districtId" UUID NOT NULL,
      "name" TEXT NOT NULL,
      "thname" TEXT,
      "code" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Subdistrict_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Subdistrict_districtId_name_key" ON "Subdistrict"("districtId", "name")`,
    `CREATE INDEX IF NOT EXISTS "Subdistrict_districtId_idx" ON "Subdistrict"("districtId")`,
    `CREATE INDEX IF NOT EXISTS "Subdistrict_code_idx" ON "Subdistrict"("code")`,
  ];

  try {
    // Create table and indexes
    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      } catch (error: any) {
        if (error.message?.includes('already exists') || error.code === '42P07' || error.code === '42710') {
          console.log('Already exists, skipping');
        } else {
          throw error;
        }
      }
    }

    // Add foreign key constraint
    try {
      await prisma.$executeRawUnsafe(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'Subdistrict_districtId_fkey'
          ) THEN
            ALTER TABLE "Subdistrict" ADD CONSTRAINT "Subdistrict_districtId_fkey" 
              FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$;
      `);
      console.log('Foreign key constraint added');
    } catch (error: any) {
      if (error.message?.includes('already exists') || error.code === '42P07' || error.code === '42710') {
        console.log('Foreign key already exists');
      } else {
        console.error('Error adding foreign key:', error.message);
      }
    }
    
    // Verify table was created
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Subdistrict'
    `;
    
    if (tables.length > 0) {
      console.log('✓ Subdistrict table verified');
    } else {
      throw new Error('Subdistrict table was not created');
    }
  } catch (error: any) {
    console.error('Error creating Subdistrict table:', error.message);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
