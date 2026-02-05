-- CreateTable
CREATE TABLE IF NOT EXISTS "Province" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "thname" TEXT,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "District" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provinceId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "thname" TEXT,
    "code" TEXT,
    "postalCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Subdistrict" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "districtId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "thname" TEXT,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subdistrict_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Province_name_key" ON "Province"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Province_thname_key" ON "Province"("thname");

-- CreateIndex
CREATE UNIQUE INDEX "Province_code_key" ON "Province"("code");

-- CreateIndex
CREATE INDEX "Province_code_idx" ON "Province"("code");

-- CreateIndex
CREATE UNIQUE INDEX "District_provinceId_name_key" ON "District"("provinceId", "name");

-- CreateIndex
CREATE INDEX "District_provinceId_idx" ON "District"("provinceId");

-- CreateIndex
CREATE INDEX "District_code_idx" ON "District"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Subdistrict_districtId_name_key" ON "Subdistrict"("districtId", "name");

-- CreateIndex
CREATE INDEX "Subdistrict_districtId_idx" ON "Subdistrict"("districtId");

-- CreateIndex
CREATE INDEX "Subdistrict_code_idx" ON "Subdistrict"("code");

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subdistrict" ADD CONSTRAINT "Subdistrict_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;
