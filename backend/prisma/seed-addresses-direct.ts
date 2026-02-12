import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import prisma from '../src/utils/prisma.js';

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
  districtCode: string;
  code: string;
  nameEn: string;
  nameTh: string;
}

async function main() {
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
        districtCode: entry.districtCode.toString(),
        code: entry.subdistrictCode.toString(),
        nameEn: entry.subdistrictNameEn,
        nameTh: entry.subdistrictNameTh,
      });
    }
  }

  console.log(`Found ${provinceMap.size} unique provinces`);
  console.log(`Found ${districtMap.size} unique districts`);
  console.log(`Found ${subdistrictMap.size} unique subdistricts`);

  // Seed provinces
  console.log('\nSeeding provinces...');
  const provinces = Array.from(provinceMap.values());
  let provinceCount = 0;
  for (const province of provinces) {
    try {
      await prisma.province.upsert({
        where: { name: province.nameEn },
        update: {
          thname: province.nameTh,
          code: province.code,
          updatedAt: new Date(),
        },
        create: {
          name: province.nameEn,
          thname: province.nameTh,
          code: province.code,
        },
      });
      provinceCount++;
      if (provinceCount % 10 === 0) {
        process.stdout.write(`\r  Progress: ${provinceCount}/${provinces.length}`);
      }
    } catch (error: any) {
      console.error(`\nError seeding province ${province.nameEn}:`, error.message);
    }
  }
  console.log(`\n✓ Seeded ${provinceCount} provinces`);

  // Seed districts
  console.log('\nSeeding districts...');
  const districts = Array.from(districtMap.values());
  let districtCount = 0;
  for (const district of districts) {
    try {
      const province = await prisma.province.findUnique({
        where: { code: district.provinceCode },
      });

      if (!province) {
        console.error(
          `\nWarning: Province with code ${district.provinceCode} not found for district ${district.nameEn}`
        );
        continue;
      }

      await prisma.district.upsert({
        where: {
          provinceId_name: {
            provinceId: province.id,
            name: district.nameEn,
          },
        },
        update: {
          thname: district.nameTh,
          code: district.code,
          postalCode: district.postalCode,
          updatedAt: new Date(),
        },
        create: {
          provinceId: province.id,
          name: district.nameEn,
          thname: district.nameTh,
          code: district.code,
          postalCode: district.postalCode,
        },
      });
      districtCount++;
      if (districtCount % 50 === 0) {
        process.stdout.write(`\r  Progress: ${districtCount}/${districts.length}`);
      }
    } catch (error: any) {
      console.error(
        `\nError seeding district ${district.nameEn}:`,
        error.message
      );
    }
  }
  console.log(`\n✓ Seeded ${districtCount} districts`);

  // Seed subdistricts
  console.log('\nSeeding subdistricts...');
  const subdistricts = Array.from(subdistrictMap.values());
  let subdistrictCount = 0;
  for (const subdistrict of subdistricts) {
    try {
      const district = await prisma.district.findFirst({
        where: { code: subdistrict.districtCode },
      });

      if (!district) {
        console.error(
          `\nWarning: District with code ${subdistrict.districtCode} not found for subdistrict ${subdistrict.nameEn}`
        );
        continue;
      }

      await prisma.subdistrict.upsert({
        where: {
          districtId_name: {
            districtId: district.id,
            name: subdistrict.nameEn,
          },
        },
        update: {
          thname: subdistrict.nameTh,
          code: subdistrict.code,
          updatedAt: new Date(),
        },
        create: {
          districtId: district.id,
          name: subdistrict.nameEn,
          thname: subdistrict.nameTh,
          code: subdistrict.code,
        },
      });
      subdistrictCount++;
      if (subdistrictCount % 100 === 0) {
        process.stdout.write(
          `\r  Progress: ${subdistrictCount}/${subdistricts.length}`
        );
      }
    } catch (error: any) {
      console.error(
        `\nError seeding subdistrict ${subdistrict.nameEn}:`,
        error.message
      );
    }
  }
  console.log(`\n✓ Seeded ${subdistrictCount} subdistricts`);

  console.log('\n✅ All address data seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding addresses:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
