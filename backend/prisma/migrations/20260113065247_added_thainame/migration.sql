/*
  Warnings:

  - A unique constraint covering the columns `[thname]` on the table `University` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "University" ADD COLUMN     "thname" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "University_thname_key" ON "University"("thname");
