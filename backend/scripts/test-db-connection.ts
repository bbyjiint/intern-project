
import prisma from '../src/utils/prisma';

async function main() {
  try {
    console.log('Attempting to connect to database using app configuration...');
    await prisma.$connect();
    console.log('Connection successful!');
    
    const userCount = await prisma.user.count();
    console.log(`Query successful. Found ${userCount} users in the database.`);
    
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
