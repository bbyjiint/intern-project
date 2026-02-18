import prisma from '../src/utils/prisma';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const prisma = new PrismaClient(); // Removed local instantiation

async function main() {
  console.log('🌱 Starting database seeding...');

  const runSqlFile = async (filename: string) => {
    const filePath = path.join(__dirname, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filename}, skipping...`);
      return;
    }
    
    console.log(`running ${filename}...`);
    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`   Read ${sql.length} characters.`);
    
    // Split statements safely
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement);
        successCount++;
      } catch (e: any) {
        // Ignore "already exists" errors to allow re-running seeds
        if (
          e.message.includes('Unique constraint') || 
          e.message.includes('already exists')
        ) {
          // Silent ignore for duplicates
        } else if (e.code === 'P2010') {
           console.warn(`⚠️  Raw query failed in ${filename}:`, e.message);
        } else {
          console.error(`❌ Error in ${filename}:`, e.message);
          errorCount++;
        }
      }
    }
    console.log(`   ✅ Finished ${filename} (${successCount} executed, ${errorCount} errors/skipped)`);
  };

  try {
    // 1. Geography (Provinces -> Districts)
    await runSqlFile('seed-provinces.sql');
    await runSqlFile('seed-districts-part1.sql');
    await runSqlFile('seed-districts-part2.sql');
    await runSqlFile('seed-districts-part3.sql');
    await runSqlFile('seed-districts-part4.sql');
    await runSqlFile('seed-districts-part5.sql');
    await runSqlFile('seed-districts-part6.sql');

    // 2. Universities (Insert -> Update Thai Names)
    await runSqlFile('seed-universities.sql');
    await runSqlFile('thai-university-name-seed.sql');

    // 3. Skills
    await runSqlFile('skill-seed.sql');

    console.log('✅ Seeding completed successfully!');
  } catch (e) {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
