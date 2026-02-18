
import prisma from '../src/utils/prisma';

async function main() {
  try {
    console.log("Checking database connection...");
    // Try to count users to see if tables exist and connection works
    const userCount = await prisma.user.count();
    console.log(`Connection successful! Found ${userCount} users.`);

    // Check for seed data (e.g., Universities, Provinces)
    // Based on file list, there might be a University model
    try {
        // @ts-ignore - We'll see if this model exists// @ts-ignore
        const uniCount = await prisma.university.count();
        console.log(`Found ${uniCount} universities.`);
        
        // @ts-ignore
        const provCount = await prisma.province.count();
        console.log(`Found ${provCount} provinces.`);

    } catch (e) {
        console.log("Could not check universities (Table might not exist or model name differs).");
    }

  } catch (e: any) {
    console.error("Database check failed:");
    console.error(e.message);
    if (e.code) console.error("Error Code:", e.code);
  }
}

main();
