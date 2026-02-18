import fs from 'fs';
import path from 'path';

const inputPath = path.join(process.cwd(), 'prisma', 'thai-university-name-seed.sql');
const outputPath = path.join(process.cwd(), 'prisma', 'seed-universities.sql');

const sqlContent = fs.readFileSync(inputPath, 'utf-8');

// Extract names from "WHEN 'Name' THEN"
const regex = /WHEN '([^']+)' THEN/g;
let match;
const universities = [];

while ((match = regex.exec(sqlContent)) !== null) {
  universities.push(match[1]);
}

console.log(`Found ${universities.length} universities.`);

// Helper to guess province
function guessProvince(name: string): string {
  if (name.includes('Chiang Mai')) return 'Chiang Mai';
  if (name.includes('Khon Kaen')) return 'Khon Kaen';
  if (name.includes('Phuket')) return 'Phuket';
  if (name.includes('Songkla')) return 'Songkhla';
  if (name.includes('Chonburi') || name.includes('Burapha')) return 'Chon Buri';
  if (name.includes('Mahasarakham')) return 'Maha Sarakham';
  if (name.includes('Nakhon Ratchasima')) return 'Nakhon Ratchasima';
  if (name.includes('Ubon Ratchathani')) return 'Ubon Ratchathani';
  if (name.includes('Naresuan')) return 'Phitsanulok';
  if (name.includes('Walailak')) return 'Nakhon Si Thammarat';
  if (name.includes('Mae Fah Luang')) return 'Chiang Rai';
  if (name.includes('Suranaree')) return 'Nakhon Ratchasima';
  if (name.includes('Thaksin')) return 'Songkhla'; // And Phatthalung
  if (name.includes('Udon Thani')) return 'Udon Thani';
  return 'Bangkok'; // Default
}

// Helper to generate code (simple initials)
function generateCode(name: string): string {
  return name.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 10); // Limit length
}

const values = universities.map(name => {
  const province = guessProvince(name);
  const code = generateCode(name);
  // Escape single quotes in name for SQL
  const safeName = name.replace(/'/g, "''");
  
  return `(gen_random_uuid(), '${safeName}', '${code}', '${province}', 'Thailand', NOW(), NOW())`;
});

const insertSql = `-- Generated University Seeds
INSERT INTO "University" ("id", "name", "code", "province", "country", "createdAt", "updatedAt")
VALUES
${values.join(',\n')}
ON CONFLICT ("name") DO NOTHING;
`;

fs.writeFileSync(outputPath, insertSql);
console.log(`Generated ${outputPath}`);
