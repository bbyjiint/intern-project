import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import prisma from '../src/utils/prisma.js';

async function main() {
  console.log('Applying address tables migration...');
  
  const migrationSQL = readFileSync(
    resolve(process.cwd(), 'prisma/migrations/20260206000000_add_address_tables/migration.sql'),
    'utf8'
  );

  // Execute the entire migration SQL as one block
  try {
    await prisma.$executeRawUnsafe(migrationSQL);
    console.log('Migration SQL executed successfully');
  } catch (error: any) {
    // If it's a "already exists" error, that's okay
    if (error.message?.includes('already exists') || error.code === '42P07' || error.code === '42710') {
      console.log('Some objects already exist, continuing...');
    } else {
      console.error('Error executing migration:', error.message);
      throw error;
    }
  }

  // Verify tables were created
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('Province', 'District', 'Subdistrict')
  `;
  
  console.log('Created tables:', tables.map(t => t.tablename).join(', '));
  
  if (tables.length < 3) {
    throw new Error('Not all tables were created. Expected 3, found ' + tables.length);
  }

  console.log('Migration applied successfully!');
}

main()
  .catch((e) => {
    console.error('Error applying migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
