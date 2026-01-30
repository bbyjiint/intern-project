import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Load env manually
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

function loadDotEnv(dotEnvPath = resolve(process.cwd(), '.env')) {
  if (!existsSync(dotEnvPath)) return;
  const content = readFileSync(dotEnvPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
loadDotEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is missing. Put it in backend/.env');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function applyMigration() {
  try {
    // Find the bookmark migration folder
    const migrationsDir = path.join(__dirname, '../prisma/migrations');
    const bookmarkMigration = fs.readdirSync(migrationsDir)
      .find(dir => dir.includes('bookmark') && fs.existsSync(path.join(migrationsDir, dir, 'migration.sql')));
    
    if (!bookmarkMigration) {
      throw new Error('Bookmark migration file not found');
    }
    
    const migrationSQL = fs.readFileSync(
      path.join(migrationsDir, bookmarkMigration, 'migration.sql'),
      'utf8'
    );

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement);
          console.log('Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          // Ignore "already exists" errors
          if (error.message.includes('already exists') || error.code === '42P07') {
            console.log('Already exists, skipping:', statement.substring(0, 50) + '...');
          } else {
            throw error;
          }
        }
      }
    }

    // Mark migration as applied
    await prisma.$executeRawUnsafe(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES (gen_random_uuid(), '', NOW(), ${bookmarkMigration}, NULL, NULL, NOW(), 1)
      ON CONFLICT DO NOTHING;
    `);

    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
