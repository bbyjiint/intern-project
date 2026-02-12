import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface GeographyEntry {
  id: number;
  provinceCode: number;
  provinceNameEn: string;
  provinceNameTh: string;
  districtCode: number;
  districtNameEn: string;
  districtNameTh: string;
  subdistrictCode: number;
  subdistrictNameEn: string;
  subdistrictNameTh: string;
  postalCode: number;
}

interface ProvinceData {
  code: string;
  nameEn: string;
  nameTh: string;
}

interface DistrictData {
  provinceCode: string;
  code: string;
  nameEn: string;
  nameTh: string;
  postalCode: string;
}

interface SubdistrictData {
  districtCode: string; // Store as string to match District.code
  code: string;
  nameEn: string;
  nameTh: string;
}

function main() {
  console.log('Reading geography.json...');
  const geographyPath = resolve(process.cwd(), 'prisma/geography.json');
  const geographyData: GeographyEntry[] = JSON.parse(
    readFileSync(geographyPath, 'utf8')
  );

  console.log(`Processing ${geographyData.length} entries...`);

  // Extract unique provinces
  const provinceMap = new Map<string, ProvinceData>();
  const districtMap = new Map<string, DistrictData>();
  const subdistrictMap = new Map<string, SubdistrictData>();

  // Process all entries
  for (const entry of geographyData) {
    // Store province
    const provinceKey = entry.provinceCode.toString();
    if (!provinceMap.has(provinceKey)) {
      provinceMap.set(provinceKey, {
        code: entry.provinceCode.toString(),
        nameEn: entry.provinceNameEn,
        nameTh: entry.provinceNameTh,
      });
    }

    // Store district (with postal code - we'll use the first one we encounter)
    const districtKey = `${entry.provinceCode}-${entry.districtCode}`;
    if (!districtMap.has(districtKey)) {
      districtMap.set(districtKey, {
        provinceCode: entry.provinceCode.toString(),
        code: entry.districtCode.toString(),
        nameEn: entry.districtNameEn,
        nameTh: entry.districtNameTh,
        postalCode: entry.postalCode.toString(),
      });
    }

    // Store subdistrict
    const subdistrictKey = `${entry.districtCode}-${entry.subdistrictCode}`;
    if (!subdistrictMap.has(subdistrictKey)) {
      subdistrictMap.set(subdistrictKey, {
        districtCode: entry.districtCode.toString(), // Store as string to match District.code
        code: entry.subdistrictCode.toString(),
        nameEn: entry.subdistrictNameEn,
        nameTh: entry.subdistrictNameTh,
      });
    }
  }

  console.log(`Found ${provinceMap.size} unique provinces`);
  console.log(`Found ${districtMap.size} unique districts`);
  console.log(`Found ${subdistrictMap.size} unique subdistricts`);

  // Generate Province SQL
  console.log('Generating province seed file...');
  const provinceSQL = generateProvinceSQL(Array.from(provinceMap.values()));
  writeFileSync(
    resolve(process.cwd(), 'prisma/seed-provinces-from-geography.sql'),
    provinceSQL
  );

  // Generate District SQL
  console.log('Generating district seed file...');
  const districtSQL = generateDistrictSQL(Array.from(districtMap.values()));
  writeFileSync(
    resolve(process.cwd(), 'prisma/seed-districts-from-geography.sql'),
    districtSQL
  );

  // Generate Subdistrict SQL
  console.log('Generating subdistrict seed file...');
  const subdistrictSQL = generateSubdistrictSQL(
    Array.from(subdistrictMap.values())
  );
  writeFileSync(
    resolve(process.cwd(), 'prisma/seed-subdistricts-from-geography.sql'),
    subdistrictSQL
  );

  console.log('All seed files generated successfully!');
}

function generateProvinceSQL(provinces: ProvinceData[]): string {
  let sql = `-- Seed Thai Provinces from geography.json
-- Run this SQL script to populate the Province table
-- Generated from geography.json

INSERT INTO "Province" ("id", "name", "thname", "code", "createdAt", "updatedAt")
VALUES
`;

  const values = provinces.map(
    (p) =>
      `  (gen_random_uuid(), ${escapeSQLString(p.nameEn)}, ${escapeSQLString(p.nameTh)}, ${escapeSQLString(p.code)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
  );

  // Split into chunks if too large (unlikely for provinces, but just in case)
  const chunkSize = 1000;
  if (values.length > chunkSize) {
    const chunks: string[] = [];
    for (let i = 0; i < values.length; i += chunkSize) {
      const chunk = values.slice(i, i + chunkSize);
      chunks.push(
        sql +
          chunk.join(',\n') +
          `
ON CONFLICT ("name") 
DO UPDATE SET 
  "thname" = EXCLUDED."thname",
  "code" = EXCLUDED."code",
  "updatedAt" = CURRENT_TIMESTAMP;
`
      );
    }
    return chunks.join('\n\n');
  }

  sql += values.join(',\n');
  sql += `
ON CONFLICT ("name") 
DO UPDATE SET 
  "thname" = EXCLUDED."thname",
  "code" = EXCLUDED."code",
  "updatedAt" = CURRENT_TIMESTAMP;
`;

  return sql;
}

function generateDistrictSQL(districts: DistrictData[]): string {
  let sql = `-- Seed Thai Districts from geography.json
-- Run this SQL script to populate the District table
-- Make sure to run seed-provinces-from-geography.sql first
-- Generated from geography.json

INSERT INTO "District" ("id", "provinceId", "name", "thname", "code", "postalCode", "createdAt", "updatedAt")
VALUES
`;

  const values = districts.map(
    (d) =>
      `  (gen_random_uuid(), (SELECT id FROM "Province" WHERE code = ${escapeSQLString(d.provinceCode)}), ${escapeSQLString(d.nameEn)}, ${escapeSQLString(d.nameTh)}, ${escapeSQLString(d.code)}, ${escapeSQLString(d.postalCode)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
  );

  // Split into chunks if too large (PostgreSQL has limits on statement size)
  const chunkSize = 1000;
  if (values.length > chunkSize) {
    const chunks: string[] = [];
    for (let i = 0; i < values.length; i += chunkSize) {
      const chunk = values.slice(i, i + chunkSize);
      chunks.push(
        sql +
          chunk.join(',\n') +
          `
ON CONFLICT ("provinceId", "name") 
DO UPDATE SET 
  "thname" = EXCLUDED."thname",
  "code" = EXCLUDED."code",
  "postalCode" = EXCLUDED."postalCode",
  "updatedAt" = CURRENT_TIMESTAMP;
`
      );
    }
    return chunks.join('\n\n');
  }

  sql += values.join(',\n');
  sql += `
ON CONFLICT ("provinceId", "name") 
DO UPDATE SET 
  "thname" = EXCLUDED."thname",
  "code" = EXCLUDED."code",
  "postalCode" = EXCLUDED."postalCode",
  "updatedAt" = CURRENT_TIMESTAMP;
`;

  return sql;
}

function generateSubdistrictSQL(subdistricts: SubdistrictData[]): string {
  let sql = `-- Seed Thai Subdistricts from geography.json
-- Run this SQL script to populate the Subdistrict table
-- Make sure to run seed-districts-from-geography.sql first
-- Generated from geography.json

INSERT INTO "Subdistrict" ("id", "districtId", "name", "thname", "code", "createdAt", "updatedAt")
VALUES
`;

  const values = subdistricts.map(
    (s) =>
      `  (gen_random_uuid(), (SELECT id FROM "District" WHERE code = ${escapeSQLString(s.districtCode)}), ${escapeSQLString(s.nameEn)}, ${escapeSQLString(s.nameTh)}, ${escapeSQLString(s.code)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
  );

  // Split into chunks if too large
  const chunkSize = 1000;
  if (values.length > chunkSize) {
    const chunks: string[] = [];
    for (let i = 0; i < values.length; i += chunkSize) {
      const chunk = values.slice(i, i + chunkSize);
      chunks.push(
        sql +
          chunk.join(',\n') +
          `
ON CONFLICT ("districtId", "name") 
DO UPDATE SET 
  "thname" = EXCLUDED."thname",
  "code" = EXCLUDED."code",
  "updatedAt" = CURRENT_TIMESTAMP;
`
      );
    }
    return chunks.join('\n\n');
  }

  sql += values.join(',\n');
  sql += `
ON CONFLICT ("districtId", "name") 
DO UPDATE SET 
  "thname" = EXCLUDED."thname",
  "code" = EXCLUDED."code",
  "updatedAt" = CURRENT_TIMESTAMP;
`;

  return sql;
}

function escapeSQLString(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  // Escape single quotes by doubling them
  const escaped = value.replace(/'/g, "''");
  return `'${escaped}'`;
}

main();
