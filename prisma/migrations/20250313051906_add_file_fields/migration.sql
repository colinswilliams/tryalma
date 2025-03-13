/*
  Warnings:

  - You are about to drop the column `fileData` on the `Lead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "fileData",
ADD COLUMN     "files" JSONB;
