-- Company registration / profile: fields exist in schema.prisma but were missing from DB history
ALTER TABLE "CompanyProfile" ADD COLUMN IF NOT EXISTS "businessType" TEXT;
ALTER TABLE "CompanyProfile" ADD COLUMN IF NOT EXISTS "companySize" TEXT;
