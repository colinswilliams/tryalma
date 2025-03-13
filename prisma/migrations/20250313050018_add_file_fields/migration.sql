/*
  Warnings:

  - You are about to drop the column `fileNames` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `filePaths` on the `Lead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "fileNames",
DROP COLUMN "filePaths",
ADD COLUMN     "fileData" JSONB;
