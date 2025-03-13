/*
  Warnings:

  - You are about to drop the column `company` on the `Lead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "company",
ADD COLUMN     "fileNames" TEXT[],
ADD COLUMN     "filePaths" TEXT[];
